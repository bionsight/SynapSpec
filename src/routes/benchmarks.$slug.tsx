import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { AccuracyTrack, Chips, Figures, Spark } from '../components/Benchmark'
import { TableScroll } from '../components/Section'
import { accuracyByAxis, benchmarks, combinedFileErrors, findRun, latestBenchmarkRun } from '../data/benchmarks'
import type { BenchmarkRun } from '../data/benchmarks'
import { blockPlain, caps, container, eyebrow } from '../ui'

export const Route = createFileRoute('/benchmarks/$slug')({
  loader: ({ params }) => {
    const run = findRun(params.slug)
    if (!run) throw notFound()
    return run
  },
  head: ({ params }) => ({
    meta: [
      { title: `Benchmark run ${params.slug} | SynapSpec` },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: BenchmarkRunPage,
})

const { dataset, filter } = benchmarks

const cell = 'border-b border-ink-100 px-3 py-2.5 align-middle'
const numeric = `${cell} text-end tabular-nums`

function figuresFor(run: BenchmarkRun) {
  const worst = run.has_accuracy
    ? run.accuracy.reduce((a, b) => (Math.abs(b.deviation) > Math.abs(a.deviation) ? b : a))
    : null

  return [
    { label: 'Precursors', value: run.total_precursors_display, unit: '1% FDR' },
    { label: 'Protein groups', value: run.total_proteins_display, unit: 'unique accessions' },
    {
      label: 'Wall clock',
      value: run.runtime_hours ? `${run.runtime_hours.toFixed(2)} h` : '—',
      unit: `${run.instance} · ${run.files_in_experiment} files`,
    },
    {
      label: 'Max deviation',
      value: worst ? Math.abs(worst.deviation).toFixed(3) : '—',
      unit: worst ? `log2 · ${worst.label}` : 'not measured',
    },
  ]
}

function BenchmarkRunPage() {
  const run = Route.useLoaderData()
  const combined = combinedFileErrors(run)
  const peakFilePrecursors = Math.max(...run.files.map((file) => file.precursors))

  const chips = [
    dataset.name,
    dataset.instrument,
    `${run.files_in_experiment} files`,
    run.instance,
    `branch ${filter.branch}`,
    run.slug === latestBenchmarkRun.slug ? 'latest' : run.date,
  ]

  const meta: readonly (readonly [string, ReactNode])[] = [
    ['Started', run.date],
    ['Wall clock', run.runtime_hours ? `${run.runtime_hours.toFixed(2)} h` : '—'],
    ['Instance', <>AWS <code>{run.instance}</code></>],
    ['Branch', <code>{filter.branch}</code>],
    ['ClearML tag', <code>{filter.tag}</code>],
    /* `filter.project` 은 싣지 않는다 — 내부 ClearML 경로이고 방문자에게는 뜻이 없다.
       docs/BENCHMARKS.md 가 그 경로를 내부 정보로 적어 두었다. */
    ['Experiment', <code>{filter.tag.replace(/-/g, '_')}</code>],
  ]

  return (
    <>
      <div className={`${container} pt-10 pb-8 md:pt-14`}>
        <p className={eyebrow}>
          <Link to="/benchmarks" className="hover:underline">Benchmarks</Link> / {run.date}
        </p>
        <h1 className="mt-3 text-[26px] tracking-[-0.035em] tabular-nums md:text-[32px]">
          Benchmark run {run.date}
        </h1>
        <Chips items={chips} />
        <Figures items={figuresFor(run)} />
      </div>

      <div className={container}>
        {run.has_accuracy ? (
          <section className={blockPlain}>
            <div className="mb-5 flex flex-wrap items-baseline gap-4">
              <h2 className="text-[19px] tracking-[-0.02em]">Quantification accuracy</h2>
              <span className="ms-auto font-mono text-[11.5px] text-ink-500">
                log2(A/B) · axis −2.5 … +1.5
              </span>
            </div>
            <div className="grid gap-6 md:grid-cols-3 md:gap-x-8">
              {accuracyByAxis(run).map((item) => (
                <AccuracyTrack item={item} key={item.species} />
              ))}
            </div>
            <p className="mt-4 font-mono text-[11.5px] text-ink-500">띠는 목표 기준 MAD.</p>
          </section>
        ) : (
          <section className={blockPlain}>
            <p className="font-mono text-[11.5px] text-ink-500">
              이 run 에는 정량 정확도가 없다 — LFQ 파서가 나중에 들어왔다.{' '}
              <Link to="/benchmarks" className="text-brand-700 hover:text-brand-800">모든 run</Link>
            </p>
          </section>
        )}

        <section className={blockPlain}>
          <div className="mb-5 flex flex-wrap items-baseline gap-4">
            <h2 className="text-[19px] tracking-[-0.02em]">Per file</h2>
            <span className="ms-auto font-mono text-[11.5px] text-ink-500">
              {run.files_in_experiment} files · {dataset.conditions.length} conditions × {dataset.replicates} replicates
            </span>
          </div>

          <TableScroll>
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {['File', 'Precursors', 'Proteins', 'MS1 error', 'MS2 error', 'RT error', 'FWHM RT'].map(
                    (heading, index) => (
                      <th
                        className={`${caps} border-b border-ink-300 px-3 py-2 font-semibold ${index === 0 ? 'text-start' : 'text-end'}`}
                        key={heading}
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {run.files.map((file) => (
                  <tr className="hover:bg-ink-50" key={file.name}>
                    <td className={cell}>
                      <code>{file.short_name}</code>
                    </td>
                    <td className={numeric}>
                      <Spark value={file.precursors} max={peakFilePrecursors} />
                      {file.precursors_display}
                    </td>
                    <td className={numeric}>{file.proteins_display}</td>
                    <td className={numeric}>{file.ms1_error ?? '—'}</td>
                    <td className={numeric}>{file.ms2_error ?? '—'}</td>
                    <td className={numeric}>{file.rt_error ?? '—'}</td>
                    <td className={numeric}>{file.fwhm_rt ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold">
                  <th className="border-t border-ink-300 px-3 py-2.5 text-start">Combined</th>
                  <td className="border-t border-ink-300 px-3 py-2.5 text-end tabular-nums">
                    {run.total_precursors_display}
                  </td>
                  <td className="border-t border-ink-300 px-3 py-2.5 text-end tabular-nums">
                    {run.total_proteins_display}
                  </td>
                  {(['ms1_error', 'ms2_error', 'rt_error', 'fwhm_rt'] as const).map((key) => (
                    <td className="border-t border-ink-300 px-3 py-2.5 text-end tabular-nums text-ink-500" key={key}>
                      {combined[key] ?? '—'}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </TableScroll>
          <p className="mt-4 font-mono text-[11.5px] text-ink-500">
            합계 행의 precursor·protein 은 파일 합이 아니라 중복을 제거한 수. 오차 넷은 파일 평균.
            막대는 이 run 의 최고값 {peakFilePrecursors.toLocaleString('en-US')} 대비.
          </p>
        </section>

        <section className={blockPlain}>
          <h2 className="mb-5 text-[19px] tracking-[-0.02em]">Run</h2>
          <dl className="m-0 grid border-t-2 border-brand-600 md:grid-cols-2 md:gap-x-9">
            {meta.map(([term, value]) => (
              <div
                className="grid gap-1 border-b border-ink-100 py-3 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-4"
                key={term}
              >
                <dt className={caps}>{term}</dt>
                <dd className="m-0 text-[13.5px]">{value}</dd>
              </div>
            ))}
          </dl>

          <nav className="mt-7 flex items-center justify-between gap-4 font-mono text-[12px]">
            {run.prev_slug ? (
              <Link to="/benchmarks/$slug" params={{ slug: run.prev_slug }} className="text-brand-700 hover:underline">
                ← {run.prev_slug}
              </Link>
            ) : (
              <span />
            )}
            <Link to="/benchmarks" className="text-brand-700 hover:underline">
              모든 run {benchmarks.coverage.run_count}개
            </Link>
            {run.next_slug ? (
              <Link to="/benchmarks/$slug" params={{ slug: run.next_slug }} className="text-brand-700 hover:underline">
                {run.next_slug} →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </section>
      </div>
    </>
  )
}

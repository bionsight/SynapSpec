import { Link, createFileRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { AccuracyTrack, Chips, Figures, Spark, TrendChart } from '../components/Benchmark'
import { TableScroll } from '../components/Section'
import {
  accuracyByAxis,
  benchmarks,
  depthChangePercent,
  latestAccuracyRun,
  latestBenchmarkRun,
  oldestRun,
  runsNewestFirst,
  runtimeBaselineRun,
  runtimeChangePercent,
  signedPercent,
  worstAccuracySpecies,
} from '../data/benchmarks'
import { badge, blockPlain, caps, container, eyebrow } from '../ui'

/* 아직 공개 전이다 — 내비게이션에 링크가 없고, robots 로 색인을 막고,
   vite.config.ts 에서 sitemap 에서도 제외한다. gh-page 의 Jekyll 판과 같은 조건. */
export const Route = createFileRoute('/benchmarks/')({
  head: () => ({
    meta: [
      { title: 'Benchmarks | SynapSpec' },
      { name: 'robots', content: 'noindex, nofollow' },
      {
        name: 'description',
        content:
          'SynapSpec benchmark history on the LFQBench standard dataset — identification depth and quantification accuracy measured on every tracked release of the engine',
      },
    ],
  }),
  component: BenchmarksPage,
})

const { coverage, dataset, filter } = benchmarks

/* 설명 문단 대신 조건을 칩으로 세운다. 무엇을 쟀는지가 제목보다 먼저 온다. */
const chips = [
  `${coverage.run_count} runs`,
  `${coverage.date_from} → ${coverage.date_to}`,
  `${dataset.files} files`,
  `${Object.keys(dataset.target_log2_ratios).length} species`,
  `branch ${filter.branch}`,
  'FDR 1%',
]

const figures = [
  {
    label: 'Precursors',
    value: latestBenchmarkRun.total_precursors_display,
    unit: `1% FDR · peak ${coverage.peak_precursors_display}`,
    delta: `${signedPercent(depthChangePercent)} · ${oldestRun.total_precursors_display} → ${latestBenchmarkRun.total_precursors_display}`,
  },
  {
    label: 'Max deviation',
    value: worstAccuracySpecies ? Math.abs(worstAccuracySpecies.deviation).toFixed(3) : '—',
    unit: worstAccuracySpecies
      ? `log2 · ${worstAccuracySpecies.label} · target ${worstAccuracySpecies.target_log2_ratio.toFixed(1)}`
      : 'not measured',
    delta: `${coverage.accuracy_count} / ${coverage.run_count} runs measured`,
    deltaMuted: true,
  },
  {
    label: 'Wall clock',
    value: latestBenchmarkRun.runtime_hours ? `${latestBenchmarkRun.runtime_hours.toFixed(2)} h` : '—',
    unit: `${latestBenchmarkRun.instance} · ${dataset.files} files`,
    delta:
      runtimeChangePercent !== null && runtimeBaselineRun?.runtime_hours && latestBenchmarkRun.runtime_hours
        ? `${signedPercent(runtimeChangePercent)} · ${runtimeBaselineRun.runtime_hours.toFixed(2)} → ${latestBenchmarkRun.runtime_hours.toFixed(2)} h`
        : undefined,
  },
]

const targets = Object.entries(dataset.target_log2_ratios)
  .map(([species, ratio]) => `${species} ${ratio > 0 ? '+' : ''}${ratio.toFixed(1)}`)
  .join(' · ')

const method: readonly (readonly [string, ReactNode])[] = [
  ['Dataset', <>{dataset.name} 3-species — human, yeast, <i>E. coli</i></>],
  ['Target log2(A/B)', <code>{targets}</code>],
  ['Instrument', dataset.instrument],
  ['Files', `${dataset.files} — ${dataset.conditions.length} conditions × ${dataset.replicates} replicates`],
  ['FASTA', <code>napedro_3mixed_human_yeast_ecoli_20140403_iRT</code>],
  ['Library', 'predicted · trypsin/P · MC 2 · max var mod 5'],
  ['FDR', 'precursor 1%'],
  ['Hardware', <>AWS <code>{latestBenchmarkRun.instance}</code></>],
  ['Engine build', <><code>{filter.branch}</code> commit — no release-commit run yet</>],
  ['ClearML tag', <code>{filter.tag}</code>],
]

const cell = 'border-b border-ink-100 px-3 py-2.5 align-middle'
const numeric = `${cell} text-end tabular-nums`

function BenchmarksPage() {
  return (
    <>
      <div className={`${container} pt-10 pb-8 md:pt-14`}>
        <p className={eyebrow}>Benchmarks</p>
        <h1 className="mt-3 text-[26px] tracking-[-0.035em] md:text-[32px]">
          {dataset.name} · {dataset.instrument}
        </h1>
        <Chips items={chips} />
        <Figures items={figures} />
      </div>

      <div className={container}>
        <section className={blockPlain}>
          <div className="mb-5 flex flex-wrap items-baseline gap-4">
            <h2 className="text-[19px] tracking-[-0.02em]">Precursors at 1% FDR</h2>
            <span className="ms-auto font-mono text-[11.5px] text-ink-500">
              {coverage.run_count} runs · {filter.branch}
            </span>
          </div>

          <TrendChart runs={benchmarks.runs} />
        </section>

        <section className={blockPlain}>
          <div className="mb-5 flex flex-wrap items-baseline gap-4">
            <h2 className="text-[19px] tracking-[-0.02em]">All runs</h2>
            <span className="ms-auto font-mono text-[11.5px] text-ink-500">newest first</span>
          </div>

          <TableScroll>
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {['Date', 'Precursors', 'Proteins', 'Runtime', 'Instance', 'Accuracy'].map((heading, index) => (
                    <th
                      className={`${caps} border-b border-ink-300 px-3 py-2 font-semibold ${index >= 1 && index <= 3 ? 'text-end' : 'text-start'}`}
                      key={heading}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {runsNewestFirst.map((run) => (
                  <tr
                    className={run.slug === latestBenchmarkRun.slug ? 'bg-ink-50 font-semibold' : 'hover:bg-ink-50'}
                    key={run.slug}
                  >
                    <td className={cell}>
                      <Link
                        to="/benchmarks/$slug"
                        params={{ slug: run.slug }}
                        className="font-semibold text-brand-700 hover:text-brand-800"
                      >
                        {run.date}
                      </Link>
                    </td>
                    <td className={numeric}>
                      <Spark value={run.total_precursors} max={coverage.peak_precursors} />
                      {run.total_precursors_display}
                    </td>
                    <td className={numeric}>{run.total_proteins_display}</td>
                    {/* 자릿수를 고정한다. 9.7 과 9.49 가 한 열에 섞이면 자리가 어긋난다. */}
                    <td className={numeric}>{run.runtime_hours ? `${run.runtime_hours.toFixed(2)} h` : '—'}</td>
                    <td className={cell}>
                      <code>{run.instance}</code>
                    </td>
                    <td className={cell}>
                      {run.has_accuracy ? (
                        <span className={`${badge} border-brand-200 bg-brand-50 text-brand-700`}>measured</span>
                      ) : (
                        <span className={badge}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
          <p className="mt-4 font-mono text-[11.5px] text-ink-500">
            막대는 최고값 {coverage.peak_precursors_display} 대비. 런타임은 인스턴스 타입이 다르면 비교되지 않는다.
          </p>
        </section>

        {latestAccuracyRun ? (
          <section className={blockPlain}>
            <div className="mb-5 flex flex-wrap items-baseline gap-4">
              <h2 className="text-[19px] tracking-[-0.02em]">Quantification accuracy</h2>
              <span className="ms-auto font-mono text-[11.5px] text-ink-500">
                run {latestAccuracyRun.date} · log2(A/B)
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-3 md:gap-x-8">
              {accuracyByAxis(latestAccuracyRun).map((item) => (
                <AccuracyTrack item={item} key={item.species} />
              ))}
            </div>
            <p className="mt-4 font-mono text-[11.5px] text-ink-500">
              축은 log2 −2.5 … +1.5. 띠는 목표 기준 MAD. 이 지표는 {latestAccuracyRun.date} run 부터 있다.
            </p>
          </section>
        ) : null}

        <section className={blockPlain}>
          <h2 className="mb-5 text-[19px] tracking-[-0.02em]">Method</h2>
          <dl className="m-0 grid border-t-2 border-brand-600 md:grid-cols-2 md:gap-x-9">
            {method.map(([term, value]) => (
              <div
                className="grid gap-1 border-b border-ink-100 py-3 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-4"
                key={term}
              >
                <dt className={caps}>{term}</dt>
                <dd className="m-0 text-[13.5px]">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  )
}

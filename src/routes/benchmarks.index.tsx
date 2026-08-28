import { Link, createFileRoute } from '@tanstack/react-router'

import { SectionHead, TableScroll } from '../components/Section'
import { benchmarks, runsNewestFirst } from '../data/benchmarks'
import { badge, block, caps, container, eyebrow } from '../ui'

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

const metaLine = [
  `${coverage.run_count} runs`,
  `${coverage.date_from} – ${coverage.date_to}`,
  `${dataset.name} · ${dataset.instrument}`,
].join('  ·  ')

const numeric = 'border-b border-ink-100 px-3 py-3 text-end align-middle tabular-nums'

function BenchmarksPage() {
  return (
    <div className={container}>
      <div className="pt-10 pb-6 md:pt-16 md:pb-8">
        <p className={eyebrow}>Benchmarks</p>
        <h1 className="mt-3 text-[30px] tracking-[-0.035em] md:text-[40px]">Benchmarks</h1>
        <p className="mt-3 max-w-[60ch] text-[15.5px] text-ink-600 md:text-[17px]">
          SynapSpec is measured against {dataset.name}, a standard dataset whose true protein ratios are
          known in advance. Every run on the {filter.branch} branch is recorded here — improvements and
          regressions alike.
        </p>
        <p className="mt-5 font-mono text-xs text-ink-500">{metaLine}</p>
      </div>

      <section className={block}>
        <SectionHead title="Identification depth over time">
          Total precursors identified across the {dataset.files}-file benchmark.
        </SectionHead>

        {/* 막대는 시간순. 최고값에 대한 비율이라 y축이 0 에서 시작한다. */}
        <div className="flex h-52 items-end gap-1 md:gap-2">
          {benchmarks.runs.map((run) => (
            <Link
              key={run.slug}
              to="/benchmarks/$slug"
              params={{ slug: run.slug }}
              title={`${run.date} — ${run.total_precursors_display} precursors`}
              className="group flex h-full flex-1 flex-col justify-end gap-2"
            >
              <span
                className="block w-full rounded-t-sm bg-brand-300 transition-colors group-hover:bg-brand-600"
                style={{ height: `${(run.total_precursors / coverage.peak_precursors) * 100}%` }}
              />
              <span className="text-center font-mono text-[10px] text-ink-500">{run.month_label}</span>
            </Link>
          ))}
        </div>
        <p className="mt-4 text-sm text-ink-500">
          Bars are scaled against the highest value in the series ({coverage.peak_precursors_display}).
          Select any bar for that run&apos;s detail.
        </p>
      </section>

      <section className={block}>
        <SectionHead title="All runs" />
        <TableScroll>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {['Date', 'Precursors', 'Protein groups', 'Runtime', 'Instance', 'Accuracy'].map((heading, index) => (
                  <th
                    className={`${caps} border-b border-ink-200 px-3 py-2 font-semibold ${index >= 1 && index <= 3 ? 'text-end' : 'text-start'}`}
                    key={heading}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {runsNewestFirst.map((run) => (
                <tr key={run.slug}>
                  <td className="border-b border-ink-100 px-3 py-3 align-middle">
                    <Link to="/benchmarks/$slug" params={{ slug: run.slug }} className="font-semibold text-brand-700 hover:text-brand-800">
                      {run.date}
                    </Link>
                  </td>
                  <td className={numeric}>{run.total_precursors_display}</td>
                  <td className={numeric}>{run.total_proteins_display}</td>
                  <td className={`${numeric} text-ink-600`}>{run.runtime_hours ? `${run.runtime_hours} h` : '—'}</td>
                  <td className="border-b border-ink-100 px-3 py-3 align-middle">
                    <code>{run.instance}</code>
                  </td>
                  <td className="border-b border-ink-100 px-3 py-3 align-middle">
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
        <p className="mt-4 text-sm text-ink-500">
          Quantification accuracy has been recorded since {coverage.date_to} ({coverage.accuracy_count} of{' '}
          {coverage.run_count} runs); earlier runs report identification depth only. Runtime reflects a
          single run on shared infrastructure and is not comparable across instance types.
        </p>
      </section>
    </div>
  )
}

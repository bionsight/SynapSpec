import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { SectionHead, TableScroll } from '../components/Section'
import { benchmarks, findRun } from '../data/benchmarks'
import type { AccuracyItem } from '../data/benchmarks'
import { block, caps, container, eyebrow } from '../ui'

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

/* Jekyll 판과 같은 축: log2 -2.5 … +1.5 를 0 … 100% 로 편다.
   목표선과 측정값, 그리고 MAD 폭의 띠를 같은 자에 올려야 눈으로 비교된다. */
const toPercent = (log2Ratio: number) => (log2Ratio + 2.5) * 25

function AccuracyTrack({ item }: { item: AccuracyItem }) {
  const targetPos = toPercent(item.target_log2_ratio)
  const valuePos = toPercent(item.median_log2_ratio)
  const bandHalf = item.mad_from_target * 25

  return (
    <div className="border-t border-ink-100 pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-base">{item.label}</h3>
        <span className="font-mono text-[11.5px] text-ink-500">{item.count_display} precursors</span>
      </div>

      <div className="relative mt-5 mb-8 h-1.5 rounded-full bg-ink-100">
        <span
          className="absolute inset-y-0 rounded-full bg-brand-200"
          style={{ left: `${bandHalf ? valuePos - bandHalf : valuePos}%`, width: `${bandHalf * 2}%` }}
        />
        <span className="absolute -top-1.5 h-4.5 w-px bg-ink-900" style={{ left: `${targetPos}%` }}>
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[10px] whitespace-nowrap text-ink-500">
            target {item.target_log2_ratio}
          </span>
        </span>
        <span
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand-600"
          style={{ left: `${valuePos}%` }}
        >
          <span className="absolute top-4 left-1/2 -translate-x-1/2 font-mono text-[10px] whitespace-nowrap text-ink-900">
            {item.median_log2_ratio}
          </span>
        </span>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-600">
        <span>deviation from target <strong className="text-ink-900 tabular-nums">{item.deviation}</strong></span>
        <span>spread (MAD) <strong className="text-ink-900 tabular-nums">{item.mad_from_target}</strong></span>
      </div>
    </div>
  )
}

const numeric = 'border-b border-ink-100 px-3 py-3 text-end align-middle tabular-nums text-ink-600'

function BenchmarkRunPage() {
  const run = Route.useLoaderData()

  const metaLine = [
    `${dataset.name} · ${dataset.instrument}`,
    `AWS ${run.instance}`,
    run.runtime_hours ? `${run.runtime_hours} h` : null,
  ]
    .filter(Boolean)
    .join('  ·  ')

  return (
    <div className={container}>
      <div className="pt-10 pb-6 md:pt-16 md:pb-8">
        <Link to="/benchmarks" className="text-sm text-brand-700 hover:text-brand-800">← All benchmarks</Link>
        <p className={`${eyebrow} mt-6`}>Benchmark run</p>
        <h1 className="mt-3 text-[30px] tracking-[-0.035em] tabular-nums md:text-[40px]">{run.date}</h1>
        <p className="mt-5 font-mono text-xs text-ink-500">{metaLine}</p>
      </div>

      <div className="grid grid-cols-2 gap-6 rounded-lg bg-ink-900 p-6 text-white md:grid-cols-3">
        {[
          [run.total_precursors_display, 'Precursors'],
          [run.total_proteins_display, 'Protein groups'],
          [String(run.files_in_experiment), 'Raw files analysed'],
        ].map(([value, label]) => (
          <div key={label}>
            <div className="text-[26px]/[1.1] font-semibold tracking-[-0.03em] tabular-nums md:text-[34px]">{value}</div>
            <p className="mt-1 text-[13px] text-white/60">{label}</p>
          </div>
        ))}
      </div>

      {run.has_accuracy ? (
        <section className={block}>
          <SectionHead title="Quantification accuracy">
            {dataset.name} mixes human, yeast and <em>E.&nbsp;coli</em> proteins into two samples at fixed,
            known ratios. A perfect result lands exactly on the target line.
          </SectionHead>
          <div className="grid gap-6">
            {run.accuracy.map((item) => <AccuracyTrack item={item} key={item.species} />)}
          </div>
          <p className="mt-6 text-sm text-ink-500">
            Horizontal axis: log₂ ratio between the two samples. The shaded band shows the median absolute
            deviation — how tightly individual measurements cluster around the target.
          </p>
        </section>
      ) : (
        <section className={block}>
          <p className="text-sm text-ink-500">
            Quantification accuracy was not recorded for this run — the {dataset.name} analysis was added to
            the pipeline later.{' '}
            <Link to="/benchmarks" className="font-semibold text-brand-700 hover:text-brand-800">See the run list</Link>{' '}
            for runs that include it.
          </p>
        </section>
      )}

      <section className={block}>
        <SectionHead title="Per-file results">
          Each of the {run.files_in_experiment} raw files, analysed independently. Mass and retention-time
          errors indicate calibration quality.
        </SectionHead>
        <TableScroll>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {['File', 'Precursors', 'Proteins', 'MS1 error', 'MS2 error', 'RT error', 'FWHM (RT)'].map((heading, index) => (
                  <th
                    className={`${caps} border-b border-ink-200 px-3 py-2 font-semibold ${index === 0 ? 'text-start' : 'text-end'}`}
                    key={heading}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {run.files.map((file) => (
                <tr key={file.name}>
                  <td className="border-b border-ink-100 px-3 py-3 align-middle"><code>{file.short_name}</code></td>
                  <td className={numeric}>{file.precursors_display}</td>
                  <td className={numeric}>{file.proteins_display}</td>
                  <td className={numeric}>{file.ms1_error ?? '—'}</td>
                  <td className={numeric}>{file.ms2_error ?? '—'}</td>
                  <td className={numeric}>{file.rt_error ?? '—'}</td>
                  <td className={numeric}>{file.fwhm_rt ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      </section>

      <section className={block}>
        <SectionHead title="How this was measured">
          {dataset.name} is a community-standard benchmark for label-free quantification. Because the mixing
          ratios are fixed when the samples are prepared, the correct answer is known independently of any
          software — which makes it possible to measure accuracy rather than merely report output volume.
        </SectionHead>
        <dl className="m-0 grid gap-x-8 gap-y-5 md:grid-cols-2">
          {[
            ['Dataset', `${dataset.instrument} — ${run.files_in_experiment} raw files: conditions ${dataset.conditions.join(' and ')}, ${dataset.replicates} replicates each.`],
            ['Ground truth', 'Expected log₂ ratios — Human 0.0, E. coli -2.0, Yeast 1.0.'],
            ['Environment', `AWS ${run.instance}, single run. Random seed fixed so the analysis is reproducible.`],
            ['Scope', `Measured on the ${filter.branch} branch of the SynapSpec engine. Runtime reflects one run on shared infrastructure and will vary with hardware.`],
          ].map(([term, value]) => (
            <div className="border-t border-ink-100 pt-3" key={term}>
              <dt className={caps}>{term}</dt>
              <dd className="m-0 mt-1 text-sm text-ink-600">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <nav className="flex items-center justify-between gap-4 border-t border-ink-100 py-8 font-mono text-sm">
        {run.prev_slug ? (
          <Link to="/benchmarks/$slug" params={{ slug: run.prev_slug }} className="text-brand-700 hover:text-brand-800">← {run.prev_slug}</Link>
        ) : <span />}
        {run.next_slug ? (
          <Link to="/benchmarks/$slug" params={{ slug: run.next_slug }} className="text-brand-700 hover:text-brand-800">{run.next_slug} →</Link>
        ) : <span />}
      </nav>
    </div>
  )
}

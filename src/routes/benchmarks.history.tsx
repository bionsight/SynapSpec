import { Link, createFileRoute } from '@tanstack/react-router'

import { Spark } from '../components/Benchmark'
import { benchmarks, runsNewestFirst } from '../data/benchmarks'
import { recordedRunSlug } from '../data/benchmark-catalog'
import { blockPlain, caps, container, eyebrow } from '../ui'

export const Route = createFileRoute('/benchmarks/history')({
  head: () => ({ meta: [
    { title: 'LFQBench / Astral history | SynapSpec' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }),
  component: BenchmarkHistory,
})

const cell = 'border-b border-ink-100 px-3 py-3'

function BenchmarkHistory() {
  const runs = benchmarks.runs
  const minimum = Math.floor(Math.min(...runs.map((run) => run.total_precursors)) / 20000) * 20000
  const maximum = Math.ceil(Math.max(...runs.map((run) => run.total_precursors)) / 20000) * 20000
  const firstDay = Date.parse(runs[0].date)
  const span = Date.parse(runs[runs.length - 1].date) - firstDay || 1
  // Rounded SVG coordinates keep prerendered and hydrated geometry byte-stable.
  const x = (date: string) => Number((65 + (Date.parse(date) - firstDay) / span * 910).toFixed(3))
  const y = (value: number) => Number((225 - (value - minimum) / (maximum - minimum || 1) * 190).toFixed(3))
  const ticks = Array.from({ length: (maximum - minimum) / 20000 + 1 }, (_, index) => minimum + index * 20000)
  return <div className={container}>
    <header className="pt-10 pb-8 md:pt-14"><p className={eyebrow}><Link to="/benchmarks" className="hover:underline">Benchmarks</Link> / Dataset history</p><h1 className="mt-3 text-[26px] tracking-[-0.035em] md:text-[32px]">LFQBench / Orbitrap Astral</h1><p className="mt-3 max-w-[48rem] text-sm text-ink-600">{runs.length} archived runs from {benchmarks.coverage.date_from} to {benchmarks.coverage.date_to}. Same dataset, different engine runs; these are not verified release versions.</p><p className="mt-3 text-sm"><Link to="/benchmarks/$slug" params={{ slug: recordedRunSlug }} className="text-brand-700 hover:underline">View the separately imported 7 September run</Link></p></header>
    <section className={blockPlain}><h2 className="mb-5 text-[19px] tracking-[-0.02em]">Identification history</h2>
      <div className="overflow-x-auto rounded-md border border-ink-200 p-4" role="region" aria-label="Identification history chart" tabIndex={0}>
        <svg viewBox="0 0 1040 270" className="block h-auto w-full min-w-[600px]" role="img" aria-label={`Distinct precursor counts across ${runs.length} archived LFQBench runs. Exact counts are in the table below.`}>
          {ticks.map((tick) => <g key={tick}><line x1="65" x2="975" y1={y(tick)} y2={y(tick)} className="stroke-ink-200" /><text x="55" y={y(tick) + 4} textAnchor="end" className="fill-ink-600 text-[12px]">{`${tick / 1000}k`}</text></g>)}
          <polyline points={runs.map((run) => `${x(run.date)},${y(run.total_precursors)}`).join(' ')} className="fill-none stroke-brand-600" strokeWidth="2" />
          {runs.map((run) => <circle key={run.slug} cx={x(run.date)} cy={y(run.total_precursors)} r="4" className="fill-brand-600"><title>{`${run.date}: ${run.total_precursors_display} precursors`}</title></circle>)}
          <text x="65" y="255" className="fill-ink-600 text-[12px]">{runs[0].date}</text><text x="975" y="255" textAnchor="end" className="fill-ink-600 text-[12px]">{runs[runs.length - 1].date}</text>
        </svg>
      </div><p className="mt-4 text-xs text-ink-600">The vertical axis starts at {minimum.toLocaleString('en-US')}, not zero, to show changes. Position on the horizontal axis follows run date. Changes in settings may affect counts.</p>
    </section>
    <section className={blockPlain}><h2 className="mb-5 text-[19px] tracking-[-0.02em]">Archived runs</h2><div className="overflow-x-auto" role="region" aria-label="Archived benchmark runs" tabIndex={0}><table className="w-full min-w-[720px] border-collapse text-[13px]"><thead><tr>{['Date', 'Precursor IDs', 'Protein IDs', 'Elapsed time', 'Resource', 'LFQ metrics'].map((label, index) => <th scope="col" key={label} className={`${caps} border-b border-ink-300 px-3 py-3 ${index > 0 && index < 4 ? 'text-end' : 'text-start'}`}>{label}</th>)}</tr></thead><tbody>{runsNewestFirst.map((run) => <tr key={run.slug} className="hover:bg-ink-50"><th scope="row" className={`${cell} text-start font-medium`}><Link to="/benchmarks/$slug" params={{ slug: run.slug }} className="text-brand-700 hover:underline">{run.date}</Link></th><td className={`${cell} text-end tabular-nums`}><Spark value={run.total_precursors} max={benchmarks.coverage.peak_precursors} />{run.total_precursors_display}</td><td className={`${cell} text-end tabular-nums`}>{run.total_proteins_display}</td><td className={`${cell} text-end tabular-nums`}>{run.runtime_hours === null ? '—' : `${run.runtime_hours.toFixed(2)} h`}</td><td className={cell}><code>{run.instance}</code></td><td className={cell}>{run.has_accuracy ? 'Measured' : 'Not recorded'}</td></tr>)}</tbody></table></div><p className="mt-4 text-xs text-ink-600">Runtime is not directly comparable across different instance types. Counts retain the archived source fields; bars share a zero baseline and the archive peak as their maximum.</p></section>
  </div>
}

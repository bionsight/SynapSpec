import { Link } from '@tanstack/react-router'
import type { ComparisonRecord } from '../data/benchmark-comparisons'
import { blockPlain, container, eyebrow } from '../ui'

const cell = 'border-b border-ink-100 px-3 py-3 text-start align-top'
const count = (value: number) => value.toLocaleString('en-US')
const percent = (value: number) => `${value.toFixed(1)}%`

export function BenchmarkComparison({ record }: { record: ComparisonRecord }) {
  const image = `${import.meta.env.BASE_URL}images/benchmarks/${record.figure}`
  return <div className={container}>
    <header className="pt-10 pb-8 md:pt-14">
      <p className={eyebrow}><Link to="/benchmarks" className="hover:underline">Benchmarks</Link> / Archived comparison</p>
      <h1 className="mt-3 text-[26px] tracking-[-0.035em] md:text-[32px]">{record.name}</h1>
      <p className="mt-3 max-w-[48rem] text-ink-600">Three archived reports, the same six input files. A and B each contain three replicate runs.</p>
      <p className="mt-4 rounded-md border border-ink-200 bg-ink-50 p-4 text-sm text-ink-700">This is not a current-release ranking. Tool labels preserve source-folder labels; exact releases, execution dates, hardware and full search settings are not reconciled. Matching filenames do not establish identical search settings.</p>
    </header>
    <div className="overflow-x-auto" role="region" aria-label="Archived tool comparison" tabIndex={0}>
      <table className="w-full min-w-[760px] text-sm">
        <caption className="pb-3 text-start text-xs text-ink-600">Precursor q-value &lt; 0.01; decoys excluded. IDs are distinct modified-sequence and charge pairs across all six runs.</caption>
        <thead><tr>{['Tool / source label', 'Precursor IDs', 'Detected in all six', 'Median CV: A', 'Median CV: B'].map(title => <th key={title} className={`${cell} bg-ink-50`}>{title}</th>)}</tr></thead>
        <tbody>{record.tools.map(tool => <tr key={tool.id}>
          <th scope="row" className={`${cell} font-medium`}>{tool.label}</th>
          <td className={`${cell} tabular-nums`}>{count(tool.precursors)}</td>
          <td className={`${cell} tabular-nums`}>{percent(tool.complete_six_percent)}<span className="mt-1 block text-xs text-ink-600">{count(tool.complete_six)} of {count(tool.precursors)}</span></td>
          {(['A', 'B'] as const).map(condition => <td key={condition} className={`${cell} tabular-nums`}>{percent(tool.cv[condition].median_percent)}<span className="mt-1 block text-xs text-ink-600">n = {count(tool.cv[condition].count)}</span></td>)}
        </tr>)}</tbody>
      </table>
    </div>
    <p className="mt-3 text-xs text-ink-600">CV uses sample standard deviation / mean within one condition, only for precursors with positive finite MS2 quantities in all three replicates. Each tool has its own eligible population. Missing observations are not imputed.</p>
    <section className={blockPlain}>
      <h2 className="text-[19px]">Identification, repeatability and LFQ ratios</h2>
      <p className="mt-3 text-sm text-ink-600">More IDs means broader coverage, not automatically better quantification. Lower CV means more consistent repeat measurements. For LFQ, a median closer to the dashed expected line and a narrower interquartile range indicate closer agreement and less spread.</p>
      <a href={image} target="_blank" rel="noreferrer" className="mt-5 block"><img src={image} width={2880} height={1600} alt={`${record.name}: three-tool precursor counts, six-run completeness, within-condition CV, and species-specific LFQ median and interquartile range. Exact values follow below.`} className="h-auto w-full" /></a>
      <a href={image} download className="mt-3 inline-block text-sm text-brand-700 hover:underline">Download comparison PNG</a>
      <div className="mt-6 overflow-x-auto" role="region" aria-label="LFQ ratio measurements" tabIndex={0}>
        <table className="w-full min-w-[650px] text-sm"><caption className="pb-3 text-start text-xs text-ink-600">Precursor MS2 log₂(mean A / mean B), using observed values; entities require positive means in both conditions. Mixed-species annotations are excluded. Intervals are quartiles, not confidence intervals.</caption>
          <thead><tr>{['Tool', 'Species', 'Expected', 'Median', '25–75%', 'Precursors'].map(title => <th key={title} className={`${cell} bg-ink-50`}>{title}</th>)}</tr></thead>
          <tbody>{record.tools.flatMap(tool => tool.ratios.map(ratio => <tr key={`${tool.id}-${ratio.species}`}><th scope="row" className={`${cell} font-normal`}>{tool.label}</th><td className={cell}>{ratio.species}</td><td className={cell}>{ratio.target}</td><td className={cell}>{ratio.median.toFixed(3)}</td><td className={cell}>{ratio.lower.toFixed(3)} – {ratio.upper.toFixed(3)}</td><td className={cell}>{count(ratio.count)}</td></tr>))}</tbody>
        </table>
      </div>
    </section>
    <section className={blockPlain}>
      <h2 className="text-[19px]">Shared precursor IDs</h2>
      <p className="mt-3 text-sm text-ink-600">Exact modified-sequence and charge matches, across all six runs; pairwise counts overlap and must not be added together.</p>
      <ul className="mt-4 space-y-2 text-sm">{record.overlap.map(pair => <li key={`${pair.left}-${pair.right}`}>{pair.left} / {pair.right}: <strong className="tabular-nums">{count(pair.precursors)}</strong></li>)}</ul>
    </section>
    <details className="mb-6 rounded-md border border-ink-200 p-5 text-sm"><summary className="cursor-pointer font-medium">Input files and per-file IDs</summary>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[750px]"><thead><tr><th className={cell}>Input stem</th>{record.tools.map(tool => <th key={tool.id} className={cell}>{tool.label}</th>)}</tr></thead><tbody>{record.files.map(name => <tr key={name}><th scope="row" className={`${cell} font-normal`}>{name}</th>{record.tools.map(tool => <td key={tool.id} className={cell}>{count(tool.files.find(file => file.name === name)?.precursors ?? 0)}</td>)}</tr>)}</tbody></table></div>
    </details>
    <details className="mb-12 rounded-md border border-ink-200 p-5 text-sm"><summary className="cursor-pointer font-medium">Limitations and reproducibility</summary><ul className="mt-4 list-disc space-y-2 ps-5 text-ink-600">
      <li>No analysis engine was rerun. These are archived report extracts, imported on 2026-09-08.</li>
      <li>Protein entities use tool-specific grouping definitions and are not presented as a cross-tool score.</li>
      <li>Separate SynapSpec MBR files are not included. MBR settings in the base reports remain unverified.</li>
      <li>Expected ratios follow the existing BION LFQ preset: human 1:1, yeast 2:1, E. coli 1:4 (A:B). Sample preparation records and full settings still need owner review.</li>
      <li>Release, execution time, resource and analysis date: not verified. No metadata is borrowed from the September 7 run.</li>
      <li>These internal LFQBench experiments are not labeled PXD028735; a provenance mapping is not established.</li>
    </ul></details>
  </div>
}

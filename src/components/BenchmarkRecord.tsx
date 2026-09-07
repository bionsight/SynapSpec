import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { formatCount, ratioMeasurements, recordedConfig, recordedRun, relativeMedianDeviation } from '../data/benchmark-catalog'
import type { DatasetRecord } from '../data/benchmark-catalog'
import { blockPlain, button, caps, container, eyebrow } from '../ui'

const linkStyle = 'text-sm font-medium text-brand-700 hover:underline focus-visible:outline-2 focus-visible:outline-brand-500'
const headingStyle = 'text-[19px] tracking-[-0.02em]'

export function PendingDataset({ dataset }: { dataset: DatasetRecord }) {
  return <div className={`${container} py-10 md:py-14`}>
    <Link to="/benchmarks" className={linkStyle}>All datasets</Link>
    <h1 className="mt-6 text-[26px] tracking-[-0.035em] md:text-[32px]">{dataset.name} / {dataset.instrument}</h1>
    <div className="mt-8 rounded-md border border-ink-200 bg-ink-50 p-6">
      <h2 className={headingStyle}>Results have not been imported</h2>
      <p className="mt-3 max-w-[45rem] text-sm text-ink-600">This dataset preset exists, but no source run has been selected for this catalog. That does not mean the dataset or its results are unavailable.</p>
      <p className="mt-3 text-sm text-ink-600">Release, date, resource, configuration, identification counts and plots will appear after result import.</p>
      <p className="mt-4 text-xs text-ink-600">Preset: <code>{dataset.preset}</code></p>
    </div>
  </div>
}

export function RecordedBenchmark() {
  return <div className={container}>
    <header className="pt-10 pb-8 md:pt-14">
      <p className={eyebrow}><Link to="/benchmarks" className="hover:underline">Benchmarks</Link> / Run detail</p>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-[26px] tracking-[-0.035em] md:text-[32px]">LFQBench <span className="font-normal text-ink-600">/ Orbitrap Astral</span></h1>
        <Link to="/benchmarks/history" className={linkStyle}>Dataset history</Link>
      </div>
      <p className="mt-3 text-sm text-ink-600">A × 3 + B × 3 · completed run · <code>5d12a532</code></p>
      <dl className="mt-7 grid grid-cols-2 border-t-2 border-brand-600 md:grid-cols-4">
        {[
          ['Release', 'Not mapped', 'Commit 5d12a532'],
          ['Run date', recordedRun.date, '00:59–06:28 · ClearML display'],
          ['Elapsed time', '5 h 29 min', 'Task wall-clock time'],
          ['Resource', recordedRun.instance, 'Instance tag, not host capacity'],
        ].map(([term, value, note]) => <div className="border-b border-ink-100 py-5 pr-4" key={term}><dt className={caps}>{term}</dt><dd className="mt-2 text-lg font-semibold tabular-nums">{value}<span className="mt-1 block text-[11.5px] font-normal text-ink-600">{note}</span></dd></div>)}
      </dl>
    </header>
    <nav aria-label="Run sections" className="flex flex-wrap gap-x-7 gap-y-3 border-b border-ink-200 pb-5">
      <a href="#configuration" className={linkStyle}>Configuration</a><a href="#raw-files" className={linkStyle}>Raw files</a><a href="#lfq-metrics" className={linkStyle}>LFQ metrics</a><a href="#source-record" className={linkStyle}>Source record</a>
    </nav>
    <section id="configuration" className={blockPlain}>
      <h2 className={headingStyle}>Run configuration</h2><p className="mt-2 text-xs text-ink-600">Recorded configuration · bion_lfq_astral.yaml</p>
      <dl className="my-6 grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">{recordedConfig.map(([term, value]) => <div key={term}><dt className="text-xs text-ink-600">{term}</dt><dd className="mt-1 text-sm">{value}</dd></div>)}</dl>
      <details className="rounded-md border border-ink-200 p-4 text-sm"><summary className="cursor-pointer font-medium">Additional recorded settings</summary><div className="mt-3 max-w-[48rem] space-y-3 text-ink-600"><p className="break-words">FASTA: napedro_3mixed_human_yeast_ecoli_20140403_iRT.fasta</p><p>Differential analysis enabled · condition-aware precursor correction on · quantity level: pg · output: parquet.</p><p>Only explicitly recorded settings are shown. FDR thresholds and release mapping have not been verified for this run.</p></div></details>
    </section>
    <section id="raw-files" className={blockPlain}>
      <h2 className={headingStyle}>Raw files</h2><p className="mt-2 mb-5 text-xs text-ink-600">Six input files · protein column uses per-file protein_accessions</p>
      <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label="Raw-file identification results">
        <table className="w-full min-w-[760px] border-collapse text-[13px]">
          <thead><tr>{['File name', 'Condition', 'Replicate', 'Precursor IDs', 'Protein accessions'].map((label, index) => <th key={label} scope="col" className={`${caps} border-b border-ink-300 px-3 py-3 ${index > 2 ? 'text-end' : 'text-start'}`}>{label}</th>)}</tr></thead>
          <tbody>{recordedRun.files.map((file, index) => <tr key={file.name} className="hover:bg-ink-50"><th scope="row" className="border-b border-ink-100 px-3 py-3 text-start font-normal"><code className="whitespace-nowrap">{file.name}</code></th><td className="border-b border-ink-100 px-3 py-3">{index < 3 ? 'A' : 'B'}</td><td className="border-b border-ink-100 px-3 py-3">{index % 3 + 1}</td><td className="border-b border-ink-100 px-3 py-3 text-end tabular-nums">{file.precursors_display}</td><td className="border-b border-ink-100 px-3 py-3 text-end tabular-nums">{file.proteins_display}</td></tr>)}</tbody>
        </table>
      </div>
      <p className="mt-4 max-w-[48rem] text-xs text-ink-600">Across the analysis: {recordedRun.total_precursors_display} distinct precursors; {recordedRun.total_proteins_display} reported total_proteins. These are not sums of the rows. Protein counting scopes differ. File sizes and acquisition durations have not been imported.</p>
    </section>
    <section id="lfq-metrics" className={blockPlain}><RatioComparison /></section>
    <section id="source-record" className={blockPlain}>
      <h2 className={headingStyle}>Source record</h2>
      <p className="mt-3 max-w-[48rem] text-sm text-ink-600">ClearML run at commit 5d12a532, checked on 7 September 2026. Date and time retain the source display; its timezone has not been established. Resource describes the recorded instance tag.</p>
      <p className="mt-3 max-w-[48rem] text-sm text-ink-600">Ratios use mean quantity in A divided by mean quantity in B for each precursor with positive quantities in both conditions. Quartiles and medians below are transformed from logged log₂ ratios. One run does not establish performance on other datasets or a ranking against other tools.</p>
      <Link to="/benchmarks" className={`${linkStyle} mt-6 inline-block`}>All datasets</Link>
    </section>
  </div>
}

function RatioComparison() {
  const [relative, setRelative] = useState(false)
  const minimum = relative ? -0.5 : -2.5
  const maximum = relative ? 0.5 : 1.5
  const ticks = relative ? [-0.5, 0, 0.5] : [-2, -1, 0, 1]
  const position = (value: number) => Number((24 + (value - minimum) / (maximum - minimum) * 452).toFixed(3))
  return <>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><div><h2 className={headingStyle}>Expected and measured ratios</h2><p className="mt-2 text-xs text-ink-600">Precursor-level LFQ · Human 1×, Yeast 2×, E. coli 0.25× A/B</p></div><div className="flex gap-2" role="group" aria-label="Ratio display"><button type="button" aria-pressed={!relative} className={button(relative ? 'ghost' : 'secondary', 'sm')} onClick={() => setRelative(false)}>Actual ratio</button><button type="button" aria-pressed={relative} className={button(relative ? 'secondary' : 'ghost', 'sm')} onClick={() => setRelative(true)}>Against expected</button></div></div>
    <p className="mb-4 max-w-[48rem] text-sm text-ink-600">Dashed line: expected ratio. Dot: measured median. Band: middle 50% of measurements. A close median does not mean every measurement is close.</p>
    <div aria-live="polite">{ratioMeasurements.map((item) => {
      const offset = relative ? item.target : 0
      const deviation = relativeMedianDeviation(item.median, item.target)
      return <div className="grid grid-cols-2 items-center gap-x-4 border-b border-ink-100 py-4 md:grid-cols-[150px_minmax(0,1fr)_150px]" key={item.species}>
        <div className="font-medium">{item.species}<span className="block text-[11px] font-normal text-ink-600">{formatCount(item.count)} paired precursors</span></div>
        <svg viewBox="0 0 500 86" className="col-span-2 row-start-2 block h-auto w-full md:col-span-1 md:row-start-auto" role="img" aria-label={`${item.species}: expected ${(2 ** item.target).toFixed(2)}, median ${(2 ** item.median).toFixed(3)}, middle 50 percent ${(2 ** item.lower).toFixed(3)} to ${(2 ** item.upper).toFixed(3)} A/B.`}>
          {ticks.map((tick) => <g key={tick}><line x1={position(tick)} x2={position(tick)} y1="12" y2="54" className="stroke-ink-200" /><text x={position(tick)} y="76" textAnchor={relative && tick < 0 ? 'start' : relative && tick > 0 ? 'end' : 'middle'} className="fill-ink-600 text-[15px] md:text-[12px]">{relative ? tick === 0 ? 'Expected' : `${(2 ** tick).toFixed(2)}×` : `${2 ** tick}×`}</text></g>)}
          <rect x={position(item.lower - offset)} y="26" width={Number((position(item.upper - offset) - position(item.lower - offset)).toFixed(3))} height="20" rx="3" className="fill-brand-100 stroke-brand-500" />
          <line x1={position(item.target - offset)} x2={position(item.target - offset)} y1="12" y2="56" strokeDasharray="4 3" strokeWidth="2" className="stroke-ink-900" />
          <circle cx={position(item.median - offset)} cy="36" r="6" className="fill-brand-600 stroke-white" strokeWidth="2" />
        </svg>
        <div className="text-end text-xl font-semibold tabular-nums">{relative ? `${deviation > 0 ? '+' : ''}${deviation.toFixed(1)}%` : `${(2 ** item.median).toFixed(3)}×`}<span className="block text-[11px] font-normal text-ink-600">{relative ? 'median deviation' : 'measured median A/B'}</span></div>
      </div>
    })}</div>
    <p className="mt-4 max-w-[48rem] text-xs text-ink-600">{relative ? 'Measured A/B divided by expected A/B, on a closer log₂-spaced axis (0.71×–1.41× expected).' : 'Ratio A/B on a log₂-spaced axis: equal distances mean equal fold changes.'} Bands are interquartile ranges, not confidence intervals. The outer 50% is not drawn.</p>
    <details className="mt-6 rounded-md border border-ink-200 p-4 text-sm"><summary className="cursor-pointer font-medium">How do I read the original LFQ scatter plot?</summary><div className="mt-3 max-w-[48rem] space-y-3 text-ink-600"><p>Each dot is a precursor with a usable quantity in both samples. Left to right is the amount measured in B; bottom to top is the A/B ratio.</p><p>The expected horizontal lines are 0 for Human, +1 for Yeast and −2 for E. coli on the log₂ scale. Those mean 1×, 2× and 0.25×. Dots near their species’ line recover the known mixture well.</p><p>The side histograms count measurements at each ratio. The final panel uses logarithmic counts to make rare, far-away measurements visible.</p></div></details>
  </>
}

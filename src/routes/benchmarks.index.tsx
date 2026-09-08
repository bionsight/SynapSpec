import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { benchmarkLedgers } from '../data/benchmark-ledger'
import { formatCount } from '../data/benchmark-catalog'
import { button, caps, container } from '../ui'

export const Route = createFileRoute('/benchmarks/')({
  head: () => ({ meta: [
    { title: 'Benchmarks | SynapSpec' },
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Compare SynapSpec, DIA-NN and Spectronaut on fixed inputs and browse recorded runs.' },
  ] }),
  component: BenchmarkLedger,
})

const cell = 'border-b border-ink-100 px-3 py-3 align-top'
const linkStyle = 'text-sm font-medium text-brand-700 hover:underline focus-visible:outline-2 focus-visible:outline-brand-500'

function BenchmarkLedger() {
  const [datasetId, setDatasetId] = useState(benchmarkLedgers[0].id)
  const [selectedId, setSelectedId] = useState(benchmarkLedgers[0].comparison.slug)
  const ledger = benchmarkLedgers.find(dataset => dataset.id === datasetId)!
  const selected = ledger.rows.find(row => row.id === selectedId) ?? ledger.rows[ledger.rows.length - 1]
  const image = `${import.meta.env.BASE_URL}images/benchmarks/${ledger.comparison.figure}`
  return <div className={container}>
    <header className="pt-10 pb-7 md:pt-14">
      <h1 className="text-[26px] tracking-[-0.035em] md:text-[32px]">Benchmarks</h1>
      <p className="mt-3 max-w-[48rem] text-sm text-ink-600">Fixed input files. Three analysis tools. Recorded runs over time.</p>
    </header>
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-200 pb-5">
      <div role="group" aria-label="Dataset" className="flex flex-wrap gap-2">{benchmarkLedgers.map(dataset => <button key={dataset.id} type="button" className={button(dataset.id === datasetId ? 'secondary' : 'ghost', 'sm')} aria-pressed={dataset.id === datasetId} onClick={() => { setDatasetId(dataset.id); setSelectedId(dataset.comparison.slug) }}>{dataset.name}</button>)}</div>
      <a href="#run-history" className={linkStyle}>Run history ({ledger.rows.length})</a>
    </div>

    <section className="py-8" aria-label="Selected results">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 className="text-[21px] tracking-[-0.02em]">{selected.comparisonSlug ? 'SynapSpec · DIA-NN · Spectronaut' : `SynapSpec · ${selected.date}`}</h2>
          <p className="mt-2 text-xs text-ink-600">{ledger.name} · {ledger.files.length} input files · {selected.comparisonSlug ? 'Archived comparison; execution date not recorded' : `Commit ${selected.commit ?? 'not recorded'} · source display date`}</p>
        </div>
        <Link to="/benchmarks/$slug" params={{ slug: selected.sourceSlug }} className={linkStyle}>Run details & source</Link>
      </div>
      {selected.comparisonSlug ? <>
        <p className="mt-4 max-w-[60rem] text-xs text-ink-600">Same six input filenames across tools. Releases, full settings and input checksums are not reconciled; this is not a controlled current-release ranking.</p>
        <a href={image} target="_blank" rel="noreferrer" className="mt-6 block focus-visible:outline-2 focus-visible:outline-brand-500"><img src={image} width={2880} height={1600} className="h-auto w-full" alt={`${ledger.name}: SynapSpec, DIA-NN and Spectronaut precursor IDs, six-run completeness, CV and Human, Yeast, E. coli LFQ median and IQR.`} /></a>
        <div className="mt-3 flex flex-wrap gap-5"><a href={image} target="_blank" rel="noreferrer" className={linkStyle}>Open full-size figure</a><a href={image} download className={linkStyle}>Download PNG</a></div>
      </> : <div className="mt-6 border-y border-ink-200 py-6">
        <p className="text-2xl font-semibold tabular-nums">{formatCount(selected.counts[0]!)} <span className="text-sm font-normal text-ink-600">SynapSpec precursor IDs</span></p>
        <p className="mt-3 max-w-[48rem] text-sm text-ink-600">DIA-NN and Spectronaut results are not linked to this execution. The archived comparison belongs to a separate execution and is not substituted here.</p>
        <button type="button" className={`${button('secondary', 'sm')} mt-4`} onClick={() => setSelectedId(ledger.comparison.slug)}>Show archived three-tool comparison</button>
      </div>}
    </section>

    <section id="run-history" className="border-t border-ink-200 py-8">
      <h2 className="text-[21px] tracking-[-0.02em]">Run history</h2>
      <p className="mt-3 max-w-[55rem] text-sm text-ink-600">One row per recorded execution or comparison bundle, newest dated runs first. Select a row to inspect it above. Dates are source display dates; undated comparisons are listed separately at the end.</p>
      <div className="mt-6 overflow-x-auto" role="region" aria-label="Run history table" tabIndex={0}>
        <table className="w-full min-w-[940px] border-collapse text-[13px]">
          <caption className="pb-3 text-start text-xs text-ink-600">Precursor IDs by tool · “—” means not linked, not zero. Matching filenames do not prove identical file contents, settings or counting definitions; changes are descriptive, not isolated software improvements.</caption>
          <thead><tr>{['Run / date', 'Commit / source', 'SynapSpec', 'DIA-NN', 'Spectronaut', 'SynapSpec time', 'Resource'].map(title => <th scope="col" key={title} className={`${caps} ${cell} bg-ink-50 text-start`}>{title}</th>)}</tr></thead>
          <tbody>{ledger.rows.map(row => <tr key={row.id} className={selected.id === row.id ? 'bg-brand-50' : 'hover:bg-ink-50'}>
            <th scope="row" className={`${cell} text-start font-normal`}><button type="button" aria-pressed={selected.id === row.id} className={linkStyle} onClick={() => setSelectedId(row.id)}>{row.date ?? 'Undated comparison'}</button><span className="mt-1 block text-xs text-ink-600">{row.label}</span></th>
            <td className={cell}>{row.commit ?? (row.comparisonSlug ? 'Folder labels only' : 'Not recorded')}</td>
            {row.counts.map((value, index) => <td key={index} className={`${cell} text-end tabular-nums`}>{value === null ? '—' : formatCount(value)}</td>)}
            <td className={`${cell} tabular-nums`}>{row.runtime === null ? '—' : `${row.runtime.toFixed(2)} h`}</td><td className={cell}>{row.resource ?? '—'}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-ink-600">{ledger.rows.length > 1 ? '19 dated SynapSpec records and one undated three-tool bundle. Only one imported three-tool bundle is available for this dataset.' : 'Only one imported three-tool bundle is available for this dataset. A repeated-run history is not yet available.'}</p>
    </section>
    <details className="mb-12 border-t border-ink-200 pt-5 text-sm"><summary className="cursor-pointer font-medium">Fixed input-file list</summary><ul className="mt-4 space-y-2 text-xs text-ink-600">{ledger.files.map(file => <li key={file} className="break-all">{file}</li>)}</ul></details>
  </div>
}

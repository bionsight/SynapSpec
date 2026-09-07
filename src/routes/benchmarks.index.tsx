import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { catalogDestination, datasetCatalog, filterDatasets } from '../data/benchmark-catalog'
import { badge, blockPlain, button, caps, container, eyebrow } from '../ui'

export const Route = createFileRoute('/benchmarks/')({
  head: () => ({ meta: [
    { title: 'Benchmarks | SynapSpec' },
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Benchmark datasets, recorded results and the conditions behind each run.' },
  ] }),
  component: BenchmarksPage,
})

const cell = 'border-b border-ink-100 px-3 py-5 align-top'
const note = 'mt-1 block text-[11.5px] font-normal text-ink-600'
const resultCount = datasetCatalog.filter((dataset) => dataset.run !== null).length

function BenchmarksPage() {
  const [onlyWithResults, setOnlyWithResults] = useState(false)
  const navigate = useNavigate()
  return (
    <div className={container}>
      <header className="pt-10 pb-8 md:pt-14">
        <p className={eyebrow}>Benchmarks</p>
        <h1 className="mt-3 text-[26px] tracking-[-0.035em] md:text-[32px]">Results across datasets</h1>
        <p className="mt-3 max-w-[48rem] text-ink-600">Identification counts and analysis conditions, with run details one click away.</p>
      </header>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2" role="group" aria-label="Dataset filter">
          <button type="button" className={button(onlyWithResults ? 'ghost' : 'secondary', 'sm')} aria-pressed={!onlyWithResults} onClick={() => setOnlyWithResults(false)}>All datasets {datasetCatalog.length}</button>
          <button type="button" className={button(onlyWithResults ? 'secondary' : 'ghost', 'sm')} aria-pressed={onlyWithResults} onClick={() => setOnlyWithResults(true)}>Imported results {resultCount}</button>
        </div>
        <p className="text-xs text-ink-600">One selected run per dataset · not a ranking</p>
      </div>
      <div className="relative overflow-x-auto focus-visible:outline-2 focus-visible:outline-brand-500" role="region" aria-label="Benchmark datasets" tabIndex={0}>
        <table className="w-full min-w-[1080px] border-collapse text-[13px]">
          <caption className="sr-only">Select a dataset to view its recorded run or import status.</caption>
          <thead><tr>{['Dataset / instrument', 'Release / commit', 'Run date', 'Resource', 'Precursor IDs', 'Protein IDs', 'Key config'].map((heading, index) => (
            <th key={heading} scope="col" className={`${caps} border-y border-ink-200 bg-ink-50 px-3 py-3 font-semibold ${index === 4 || index === 5 ? 'text-end' : 'text-start'}`}>{heading}</th>
          ))}</tr></thead>
          <tbody>{filterDatasets(onlyWithResults).map((dataset) => (
            <tr key={dataset.slug} className="cursor-pointer hover:bg-ink-50 focus-within:bg-brand-50" onClick={(event) => {
              // The real link retains keyboard, new-tab and modifier-click behavior.
              if (event.target instanceof Element && event.target.closest('a')) return
              if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || window.getSelection()?.toString()) return
              void navigate({ to: '/benchmarks/$slug', params: { slug: catalogDestination(dataset) } })
            }}>
              <th scope="row" className={`${cell} min-w-[210px] text-start font-normal`}>
                <Link to="/benchmarks/$slug" params={{ slug: catalogDestination(dataset) }} className="font-semibold text-brand-700 hover:underline focus-visible:outline-2 focus-visible:outline-brand-500" aria-label={`${dataset.name}, ${dataset.instrument}: ${dataset.run ? 'view run' : 'view import status'}`}>{dataset.name}</Link>
                <span className={note}>{dataset.instrument}{dataset.run ? ` · ${dataset.run.files_in_experiment} raw files` : ''}</span>
                <span className={`${badge} mt-3 ${dataset.run ? 'border-brand-200 bg-brand-50 text-brand-700' : ''}`}>{dataset.run ? 'Results imported' : 'Results not imported'}</span>
              </th>
              <td className={cell}>{dataset.release ?? (dataset.run ? 'Not mapped' : '—')}<span className={note}>{dataset.commit ? <code>{dataset.commit}</code> : 'No selected run'}</span></td>
              <td className={`${cell} whitespace-nowrap`}>{dataset.run?.date ?? '—'}{dataset.run ? <span className={note}>ClearML display date</span> : null}</td>
              <td className={cell}>{dataset.run ? <><code>{dataset.run.instance}</code><span className={note}>Instance tag</span></> : '—'}</td>
              <td className={`${cell} text-end text-base font-semibold tabular-nums`}>{dataset.run?.total_precursors_display ?? '—'}{dataset.run ? <span className={note}>Analysis total</span> : null}</td>
              <td className={`${cell} text-end text-base font-semibold tabular-nums`}>{dataset.run?.total_proteins_display ?? '—'}{dataset.run ? <span className={note}>total_proteins</span> : null}</td>
              <td className={`${cell} min-w-[170px]`}>{dataset.keyConfig ?? '—'}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <p className="mt-4 max-w-[65rem] text-xs text-ink-600">This catalog contains one verified run and two dataset presets awaiting result import. It is not an inventory of all available experiments. “—” means not imported, not zero; release mapping is unverified.</p>
      <section className={`${blockPlain} grid gap-8 md:grid-cols-2`}>
        <div><h2 className="text-[19px] tracking-[-0.02em]">Start with the dataset</h2><p className="mt-3 max-w-[32rem] text-sm text-ink-600">Open a row for configuration, elapsed time, raw-file results and LFQ metrics. Counts from different samples are not a head-to-head score.</p></div>
        <div><h2 className="text-[19px] tracking-[-0.02em]">Follow changes over time</h2><p className="mt-3 text-sm text-ink-600">Keep the dataset fixed and inspect its recorded run history.</p><Link to="/benchmarks/history" className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline">LFQBench / Astral history</Link></div>
      </section>
      <details className="mb-12 rounded-md border border-ink-200 p-5 text-sm"><summary className="cursor-pointer font-medium focus-visible:outline-2 focus-visible:outline-brand-500">What do precursor and protein IDs mean?</summary><p className="mt-3 max-w-[48rem] text-ink-600">IDs means the number identified, not an identifier string. Precursors are peptide-ion forms; proteins are the protein entities reported by the pipeline. More identifications means broader coverage, not automatically more accurate quantities. The protein column preserves the source field total_proteins; its grouping definition still needs confirmation.</p></details>
    </div>
  )
}

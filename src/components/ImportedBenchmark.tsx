import { Link } from '@tanstack/react-router'
import type { ImportedRun } from '../data/benchmark-imports'
import { formatCount } from '../data/benchmark-catalog'
import { container } from '../ui'

export function ImportedBenchmark({ run }: { run: ImportedRun }) {
  const figure = run.figure ? `${import.meta.env.BASE_URL}images/benchmarks/${run.figure}` : null
  const facts = [
    ['Status', run.status], ['Commit (task label)', run.commit],
    ['Started (ClearML display)', run.started], ['Completed (ClearML display)', run.completed],
    ['Task elapsed time', `${Math.floor(run.runtimeMinutes / 60)} h ${run.runtimeMinutes % 60} min`],
    ['Resource tag', run.resource], ['Source Task ID', run.taskId], ['Artifact label', run.artifactId],
  ]
  return <div className={`${container} break-words py-10 md:py-14`}>
    <Link to="/benchmarks" className="text-sm text-brand-700 hover:underline">← Benchmarks</Link>
    <h1 className="mt-6 text-[26px] tracking-[-0.035em]">LFQBench / Orbitrap Astral</h1>
    <p className="mt-3 text-sm text-ink-600">SynapSpec · {run.started} · {run.commit}</p>
    <section className="mt-8 border-y border-ink-200 py-6" aria-label="Run results">
      <h2 className="text-xl">Results</h2>
      <p className="mt-4 text-2xl font-semibold tabular-nums">{formatCount(run.totalPrecursors)} <span className="text-sm font-normal">precursor IDs</span></p>
      <p className="mt-2 text-sm text-ink-600">{formatCount(run.totalProteins)} reported total_proteins. Both values are transcribed from the task’s Summary / summary table, not summed across files.</p>
      <p className="mt-3 text-sm text-ink-600">{figure ? 'The original figure below includes comparator reports used by this task. Their metrics have not been reconciled with the history table.' : 'No comparison figure has been imported for this execution.'} The archived comparison is a separate result bundle.</p>
    </section>
    {figure && <section className="border-b border-ink-200 py-8" aria-label="Run figures">
      <h2 className="text-xl">Analysis figures</h2>
      <p className="mt-3 text-sm text-ink-600">Original all_plots_summary from this ClearML task: SynapSpec, DIA-NN and Spectronaut reports. Source plotting definitions are preserved; comparator versions and settings are not independently reconciled.</p>
      <a href={figure} target="_blank" rel="noreferrer" className="mt-5 block"><img src={figure} width={4838} height={5121} className="h-auto w-full" alt={`Original analysis summary for SynapSpec ${run.commit}: identification counts, completeness, CV distributions and LFQ plots with comparator reports.`} /></a>
      <div className="mt-3 flex flex-wrap gap-5 text-sm text-brand-700"><a href={figure} target="_blank" rel="noreferrer" className="hover:underline">Open full-size figure</a><a href={figure} download className="hover:underline">Download figure</a></div>
    </section>}
    <section className="py-8"><h2 className="text-xl">Execution & source</h2>
      <dl className="mt-4">{facts.map(([label, value]) => <div key={label} className="grid gap-1 border-b border-ink-100 py-3 text-sm sm:grid-cols-[15rem_1fr]"><dt className="text-ink-600">{label}</dt><dd className="break-all">{value}</dd></div>)}</dl>
      <p className="mt-4 text-xs text-ink-600">Verified in ClearML on 2026-09-08. Dates preserve the browser’s displayed clock; timezone was not independently recorded. Task elapsed time includes orchestration and differs from tool-only Runtime. Resource is an instance tag, not verified allocated hardware. Release mapping and the meaning of total_proteins are not independently reconciled.</p>
    </section>
    <section className="border-t border-ink-200 py-8"><h2 className="text-xl">Inputs & recorded configuration</h2>
      <p className="mt-3 text-sm text-ink-600">Six RAW files: A and B, three replicates each. FASTA: napedro_3mixed_human_yeast_ecoli_20140403_iRT.fasta. Generated library; Trypsin/P; 2 missed cleavages; up to 5 variable modifications; peptide length 7–52; charge 1–6; MBR enabled; seed 42. Differential analysis and condition-aware precursor correction enabled, quantity level pg.</p>
      <ul className="mt-4 space-y-2 text-xs text-ink-600">{run.files.map(file => <li className="break-all" key={file}>{file}</li>)}</ul>
      <p className="mt-4 text-xs text-ink-600">Filenames match the Astral history. Input checksums, effective defaults and counting definitions across versions have not been reconciled; differences are not isolated software improvements.</p>
    </section>
  </div>
}

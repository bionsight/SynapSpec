import { benchmarks } from './benchmarks'
import { recordedRun } from './benchmark-catalog'
import { comparisonRecords } from './benchmark-comparisons'

export type LedgerRow = {
  id: string
  date: string | null
  label: string
  sourceSlug: string
  comparisonSlug: string | null
  counts: readonly (number | null)[]
  runtime: number | null
  resource: string | null
  commit: string | null
}

export function inputSignature(names: readonly string[]) {
  return names.map(name => name.replace(/\.raw$/i, '')).sort().join('|')
}

export const benchmarkLedgers = comparisonRecords.map(comparison => {
  const signature = inputSignature(comparison.files)
  const dated: LedgerRow[] = comparison.preset === 'bion_lfq_astral' ? benchmarks.runs
    .filter(run => inputSignature(run.files.map(file => file.name)) === signature)
    .map(run => ({ id: run.slug, date: run.date, label: 'SynapSpec run', sourceSlug: run.slug,
      comparisonSlug: null, counts: [run.total_precursors, null, null], runtime: run.runtime_hours,
      resource: run.instance, commit: null })) : []
  if (inputSignature(recordedRun.files.map(file => file.name)) === signature) {
    dated.push({ id: recordedRun.slug, date: recordedRun.date, label: 'SynapSpec run',
      sourceSlug: recordedRun.slug, comparisonSlug: null, counts: [recordedRun.total_precursors, null, null],
      runtime: recordedRun.runtime_hours, resource: recordedRun.instance, commit: '5d12a532' })
  }
  dated.sort((left, right) => (right.date ?? '').localeCompare(left.date ?? ''))
  const archived: LedgerRow = {
    id: comparison.slug, date: null, label: '3-tool comparison · v092 folder', sourceSlug: comparison.slug,
    comparisonSlug: comparison.slug,
    counts: ['synapspec', 'diann', 'spectronaut'].map(id => comparison.tools.find(tool => tool.id === id)?.precursors ?? null),
    runtime: null, resource: null, commit: null,
  }
  return { id: comparison.slug, name: comparison.name, files: comparison.files, comparison, rows: [...dated, archived] }
})

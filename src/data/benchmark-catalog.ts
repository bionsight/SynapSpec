import type { BenchmarkRun } from './benchmarks'

// A separate, manually verified record. Do not change the historical JSON or the home-page example.
// Evidence and import limitations are recorded in docs/benchmark-catalog.md.
export const recordedRunSlug = '2026-09-07-5d12a532'

export const ratioMeasurements = [
  { species: 'Human', count: 175289, target: 0, median: -0.0436154407, lower: -0.1432269684, upper: 0.0556670429 },
  { species: 'Yeast', count: 49859, target: 1, median: 0.9257236115, lower: 0.781527514, upper: 1.0472380995 },
  { species: 'E. coli', count: 19881, target: -2, median: -1.9276022874, lower: -2.0888655686, upper: -1.6823863232 },
] as const

const precursorCounts = [238452, 238003, 238445, 238198, 239372, 239578]
const proteinCounts = [18519, 18481, 18470, 18462, 18548, 18561]
export const formatCount = (value: number) => new Intl.NumberFormat('en-US').format(value)

export type RecordedRun = Omit<BenchmarkRun, 'has_accuracy' | 'accuracy'> & {
  quantification: typeof ratioMeasurements
}

export const recordedRun: RecordedRun = {
  slug: recordedRunSlug,
  date: '2026-09-07',
  instance: 'c7i.8xlarge',
  runtime_hours: 5 + 29 / 60,
  total_precursors: 252078,
  total_precursors_display: '252,078',
  total_proteins: 19671,
  total_proteins_display: '19,671',
  files_in_experiment: 6,
  // Quartiles have their own schema; do not pass them to legacy MAD-band renderers.
  quantification: ratioMeasurements,
  files: precursorCounts.map((precursors, index) => {
    const shortName = `${index < 3 ? 'A' : 'B'}_R${index % 3 + 1}`
    return {
      name: `20250206_OA_OP_LFQBench_${shortName}.raw`,
      short_name: shortName,
      precursors,
      precursors_display: formatCount(precursors),
      proteins: proteinCounts[index],
      proteins_display: formatCount(proteinCounts[index]),
      ms1_error: null, ms2_error: null, rt_error: null, fwhm_rt: null,
    }
  }),
  prev_slug: null, next_slug: null, month_label: 'Sep',
}

export const recordedConfig = [
  ['Library', 'Generated from FASTA'],
  ['Enzyme', 'Trypsin/P'],
  ['Missed cleavages', '2'],
  ['Match between runs', 'On'],
  ['Peptide length', '7–52 residues'],
  ['Precursor charge', '1–6'],
  ['Maximum variable modifications', '5'],
  ['Random seed', '42'],
] as const

export type DatasetRecord = {
  slug: string
  name: string
  instrument: string
  preset: string
  run: RecordedRun | null
  release: string | null
  commit: string | null
  keyConfig: string | null
}

export const datasetCatalog: readonly DatasetRecord[] = [
  { slug: 'lfqbench-astral', name: 'LFQBench', instrument: 'Orbitrap Astral', preset: 'bion_lfq_astral',
    run: recordedRun, release: null, commit: '5d12a532', keyConfig: 'MBR on · Trypsin/P · 2 missed cleavages' },
  { slug: 'lfqbench-oe480', name: 'LFQBench', instrument: 'OE480', preset: 'bion_lfq_oe480',
    run: null, release: null, commit: null, keyConfig: null },
  { slug: 'proteobench-2th-astral', name: 'ProteoBench 2 Th', instrument: 'Astral', preset: 'proteobench_2th_astral',
    run: null, release: null, commit: null, keyConfig: null },
]

export function catalogDestination(dataset: DatasetRecord) {
  return dataset.run?.slug ?? dataset.slug
}

export function filterDatasets(onlyWithResults: boolean) {
  return datasetCatalog.filter((dataset) => !onlyWithResults || dataset.run !== null)
}

export function relativeMedianDeviation(median: number, target: number) {
  return (2 ** (median - target) - 1) * 100
}

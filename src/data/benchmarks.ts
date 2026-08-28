import data from './benchmarks.json'

/* gh-page 브랜치의 `_data/benchmarks.json` 을 그대로 옮겨온 것이다.
   생성기는 그쪽 저장소의 `scripts/fetch_benchmarks.py` 이고, 여기서는 읽기만 한다.
   갱신하려면 그 스크립트를 다시 돌리고 JSON 을 다시 복사한다. */

export type AccuracyItem = {
  species: string
  label: string
  target_log2_ratio: number
  median_log2_ratio: number
  deviation: number
  mad_from_target: number
  count: number
  count_display: string
}

export type BenchmarkFile = {
  name: string
  short_name: string
  precursors: number
  precursors_display: string
  proteins: number
  proteins_display: string
  ms1_error: number | null
  ms2_error: number | null
  rt_error: number | null
  fwhm_rt: number | null
}

export type BenchmarkRun = {
  slug: string
  date: string
  instance: string
  runtime_hours: number | null
  total_precursors: number
  total_precursors_display: string
  total_proteins: number
  total_proteins_display: string
  files_in_experiment: number
  has_accuracy: boolean
  accuracy: AccuracyItem[]
  files: BenchmarkFile[]
  prev_slug: string | null
  next_slug: string | null
  month_label: string
}

export type Benchmarks = {
  generated_at: string
  dataset: {
    name: string
    instrument: string
    files: number
    conditions: string[]
    replicates: number
    target_log2_ratios: Record<string, number>
  }
  filter: { branch: string; project: string; tag: string }
  coverage: {
    date_from: string
    date_to: string
    run_count: number
    accuracy_count: number
    peak_precursors: number
    peak_precursors_display: string
  }
  runs: BenchmarkRun[]
}

export const benchmarks = data as unknown as Benchmarks

/* 목록 표는 최신순, 추세 막대는 시간순(원본 순서)으로 읽는다. */
export const runsNewestFirst = [...benchmarks.runs].sort((a, b) => b.date.localeCompare(a.date))

export function findRun(slug: string) {
  return benchmarks.runs.find((run) => run.slug === slug)
}

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

/* 홈의 실행 요약은 숨겨진 벤치마크 페이지와 같은 최신 LFQBench run에서 바로 만든다.
   임의의 예시값·손으로 그린 선·존재하지 않는 FDR 필드를 쓰지 않는다. */
export const latestBenchmarkRun = benchmarks.runs.at(-1)!

const perFilePrecursors = latestBenchmarkRun.files.map((file) => file.precursors)
const minPrecursors = Math.min(...perFilePrecursors)
const maxPrecursors = Math.max(...perFilePrecursors)
const maxDeviation = Math.max(...latestBenchmarkRun.accuracy.map((item) => Math.abs(item.deviation)))
const runtimeMinutes = Math.round((latestBenchmarkRun.runtime_hours ?? 0) * 60)

export const exampleRun = {
  title: `SynapSpec — ${benchmarks.dataset.name}, ${benchmarks.dataset.instrument}`,
  files: `${latestBenchmarkRun.files_in_experiment} files`,
  wallClock: `${Math.floor(runtimeMinutes / 60)}h ${runtimeMinutes % 60}m`,
  tiles: [
    ['Precursors', latestBenchmarkRun.total_precursors_display],
    ['Protein groups', latestBenchmarkRun.total_proteins_display],
    ['Median log₂ ratio deviation', `≤ ${maxDeviation.toFixed(3)}`],
  ],
  perFile: {
    label: 'Precursors per file',
    axis: [Math.floor(minPrecursors / 1000) * 1000 - 1000, Math.ceil(maxPrecursors / 1000) * 1000 + 1000],
    range: `${(minPrecursors / 1000).toFixed(1)}k – ${(maxPrecursors / 1000).toFixed(1)}k across ${latestBenchmarkRun.files_in_experiment} files`,
    values: latestBenchmarkRun.files.map((file) => [file.short_name, file.precursors] as const),
  },
  figures: [
    [latestBenchmarkRun.total_precursors_display, 'precursors identified'],
    [latestBenchmarkRun.total_proteins_display, 'protein groups'],
    [`${Math.floor(runtimeMinutes / 60)}h ${runtimeMinutes % 60}m`, `wall clock, ${latestBenchmarkRun.files_in_experiment} DIA files`],
    [`≤ ${maxDeviation.toFixed(3)}`, 'median log₂ ratio deviation from target'],
  ],
  footnote: `${benchmarks.dataset.name} on an ${benchmarks.dataset.instrument} · ${latestBenchmarkRun.files_in_experiment} files, two conditions × ${benchmarks.dataset.replicates} replicates · AWS ${latestBenchmarkRun.instance} · run ${latestBenchmarkRun.date}`,
} as const

export function findRun(slug: string) {
  return benchmarks.runs.find((run) => run.slug === slug)
}

/* ── 보드가 쓰는 파생값 ────────────────────────────────────────────────────
   전부 JSON 에서 계산한다. 수집 스크립트를 다시 돌려 run 이 늘어나면 보드의
   숫자도 같이 움직인다 — 손으로 적어 둔 값은 하나도 없다. */

export const oldestRun = benchmarks.runs[0]

/* 정확도는 LFQ 파서가 들어온 뒤의 run 에만 있다. 가장 최근에 잰 것을 고른다. */
export const latestAccuracyRun = [...benchmarks.runs].reverse().find((run) => run.has_accuracy) ?? null

/* 최대 편차와 그것을 낸 종. 숫자만 싣고 어느 종인지 빼면 확인할 길이 없다. */
export const worstAccuracySpecies = latestAccuracyRun
  ? latestAccuracyRun.accuracy.reduce((a, b) => (Math.abs(b.deviation) > Math.abs(a.deviation) ? b : a))
  : null

const percentChange = (from: number, to: number) => ((to - from) / from) * 100

export const signedPercent = (value: number) => `${value > 0 ? '+' : '−'}${Math.abs(value).toFixed(1)}%`

export const depthChangePercent = percentChange(oldestRun.total_precursors, latestBenchmarkRun.total_precursors)

/* 런타임은 인스턴스 타입이 다르면 비교되지 않는다. 최신 run 과 같은 타입의
   가장 오래된 run 을 찾아 그 둘만 견준다. 짝이 없으면 변화를 싣지 않는다. */
const sameInstanceRuns = benchmarks.runs.filter(
  (run) => run.instance === latestBenchmarkRun.instance && run.runtime_hours !== null,
)
export const runtimeBaselineRun = sameInstanceRuns.length > 1 ? sameInstanceRuns[0] : null
export const runtimeChangePercent =
  runtimeBaselineRun?.runtime_hours && latestBenchmarkRun.runtime_hours
    ? percentChange(runtimeBaselineRun.runtime_hours, latestBenchmarkRun.runtime_hours)
    : null

const ERROR_KEYS = ['ms1_error', 'ms2_error', 'rt_error', 'fwhm_rt'] as const

/* 상세 표의 합계 행. 개수는 중복을 제거한 run 전체 값이고, 오차 넷은 파일 평균이다.
   오차를 더하는 것은 뜻이 없으므로 평균만 낸다. */
export function combinedFileErrors(run: BenchmarkRun) {
  return Object.fromEntries(
    ERROR_KEYS.map((key) => {
      const values = run.files.map((file) => file[key]).filter((value): value is number => value !== null)
      const mean = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null
      return [key, mean === null ? null : Number(mean.toFixed(4))]
    }),
  ) as Record<(typeof ERROR_KEYS)[number], number | null>
}

/* 정확도 카드는 목표값 순으로 세운다. 세 트랙이 같은 축을 쓰므로 카드 순서가
   축 순서와 어긋나면 점이 왼쪽·가운데·오른쪽으로 흐르지 않는다.
   JSON 의 순서는 프리셋 딕셔너리 순서라 축과 무관하다. */
export function accuracyByAxis(run: BenchmarkRun) {
  return [...run.accuracy].sort((a, b) => a.target_log2_ratio - b.target_log2_ratio)
}

import type { AccuracyItem, BenchmarkRun } from '../data/benchmarks'
import { caps } from '../ui'

/* 벤치마크 두 화면이 같이 쓰는 조각들. 목록과 상세가 같은 자를 쓰지 않으면
   같은 숫자가 두 곳에서 다르게 보인다. */

export function Chips({ items }: { items: readonly string[] }) {
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          className="rounded-full border border-ink-200 px-3 py-0.5 font-mono text-[11.5px] text-ink-600"
          key={item}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

export type Figure = {
  label: string
  value: string
  unit: string
  delta?: string
  /* 비교 대상이 없는 칸. 증가로 읽히면 안 되므로 색을 뺀다. */
  deltaMuted?: boolean
}

/* 셋 아니면 넷이다. Tailwind 는 클래스 이름을 정적으로 훑으므로 폭을 문자열로 만들지 않는다. */
const figureColumns: Record<number, string> = { 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' }

export function Figures({ items }: { items: readonly Figure[] }) {
  return (
    <div className={`mt-7 grid grid-cols-2 border-t-2 border-brand-600 ${figureColumns[items.length] ?? 'md:grid-cols-3'}`}>
      {items.map((item, index) => (
        <div
          className={`py-5 pr-6 md:pb-6 ${index > 0 ? 'md:border-l md:border-ink-100 md:pl-6' : ''} ${index >= 2 ? 'border-t border-ink-100 md:border-t-0' : ''}`}
          key={item.label}
        >
          <p className={`${caps} font-semibold`}>{item.label}</p>
          <p className="mt-2 text-[25px]/[1.12] font-semibold tracking-[-0.035em] tabular-nums md:text-[34px]">
            {item.value}
          </p>
          <p className="mt-1 font-mono text-[11.5px] text-ink-500">{item.unit}</p>
          {item.delta ? (
            <p className={`mt-1 font-mono text-xs ${item.deltaMuted ? 'text-ink-500' : 'text-success-text'}`}>
              {item.delta}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  )
}

/* 표 한 열을 눈으로 읽게 만드는 막대. 값은 셀에 그대로 남긴다 — 막대가 값을
   대신하면 정확한 숫자를 못 읽는다. */
export function Spark({ value, max }: { value: number; max: number }) {
  return (
    <span className="me-3 hidden h-1.5 w-[76px] rounded-full bg-ink-200 align-middle sm:inline-block">
      <span
        className="block h-full rounded-full bg-brand-600"
        style={{ width: `${(value / max) * 100}%` }}
      />
    </span>
  )
}

const AXIS_MIN = -2.5
const AXIS_MAX = 1.5

/* 라이브 상세 페이지가 쓰던 축 그대로: log2 −2.5 … +1.5 를 0 … 100% 로 편다. */
const toPercent = (log2Ratio: number) => ((log2Ratio - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * 100

/* 띠는 목표에 건다. `mad_from_target` 은 목표 기준으로 잰 흩어짐이므로
   측정값에 중심을 두면 두 기준이 섞인다. */
export function AccuracyTrack({ item }: { item: AccuracyItem }) {
  const target = toPercent(item.target_log2_ratio)
  const value = toPercent(item.median_log2_ratio)
  const bandHalf = (item.mad_from_target / (AXIS_MAX - AXIS_MIN)) * 100

  return (
    <div className="border-t-2 border-brand-600 pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px]">{item.label}</h3>
        <span className="font-mono text-[11px] text-ink-500">{item.count_display}</span>
      </div>

      <div className="relative mt-6 mb-8 h-1.5 rounded-full bg-ink-200">
        <span
          className="absolute inset-y-0 rounded-full bg-brand-600/25"
          style={{ left: `${target - bandHalf}%`, width: `${bandHalf * 2}%` }}
        />
        <span className="absolute -top-1.5 h-4.5 w-px bg-ink-900" style={{ left: `${target}%` }}>
          <span className="absolute -bottom-0 left-1/2 mb-5 -translate-x-1/2 font-mono text-[10px] whitespace-nowrap text-ink-500">
            target {item.target_log2_ratio.toFixed(2)}
          </span>
        </span>
        <span
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand-600"
          style={{ left: `${value}%` }}
        >
          <span className="absolute top-3.5 left-1/2 -translate-x-1/2 font-mono text-[10.5px] whitespace-nowrap text-ink-900">
            {item.median_log2_ratio}
          </span>
        </span>
      </div>

      <div className="flex gap-5 font-mono text-[11.5px] text-ink-500">
        <span>dev <strong className="font-semibold text-ink-900">{item.deviation}</strong></span>
        <span>MAD <strong className="font-semibold text-ink-900">{item.mad_from_target}</strong></span>
      </div>
    </div>
  )
}

/* ── 추세 차트 ────────────────────────────────────────────────────────────
   막대가 아니라 선인 이유: 막대는 0 에서 시작해야 정직한데, 0 에서 시작하면
   18개 run 이 전부 위쪽 20% 안에 뭉쳐 변화가 보이지 않는다. 선은 축을 잘라도
   되지만 잘랐다는 사실을 각주로 말해야 한다. */

const VIEW_WIDTH = 1140
const VIEW_HEIGHT = 286
const PLOT = { left: 64, right: 1128, top: 34, bottom: 250 }
const GRID_STEP = 20000

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/* 눈금 탐색의 상한. 10년 치면 어떤 이력에도 넉넉하다. */
const MAX_TICK_MONTHS = 120

/* ISO 날짜만 넣는다. 날짜만 있는 ISO 문자열은 UTC 로 파싱되므로 시간대를 타지 않는다. */
const dayIndex = (date: string) => Date.parse(date) / 86_400_000

export function TrendChart({ runs }: { runs: readonly BenchmarkRun[] }) {
  const values = runs.map((run) => run.total_precursors)
  const low = Math.floor(Math.min(...values) / 10000) * 10000
  const high = Math.ceil(Math.max(...values) / 10000) * 10000

  const firstDay = dayIndex(runs[0].date)
  const span = dayIndex(runs[runs.length - 1].date) - firstDay || 1

  const x = (date: string) => PLOT.left + ((dayIndex(date) - firstDay) / span) * (PLOT.right - PLOT.left)
  const y = (value: number) => PLOT.bottom - ((value - low) / (high - low)) * (PLOT.bottom - PLOT.top)

  const points = runs.map((run) => ({ run, cx: x(run.date), cy: y(run.total_precursors) }))
  const lowest = points.reduce((a, b) => (b.run.total_precursors < a.run.total_precursors ? b : a))

  const gridValues: number[] = []
  for (let value = low; value <= high; value += GRID_STEP) gridValues.push(value)

  /* 눈금은 두 달에 하나. 매달 찍으면 좁은 폭에서 라벨이 겹친다.

     달 이름을 toLocaleString 으로 만들지 않고 배열에서 꺼낸다. prerender 는
     서버 런타임에서 돌고 hydration 은 브라우저에서 도는데, 두 쪽의 ICU 가
     다르면 같은 자리에 다른 글자가 나와 React 가 hydration 을 버린다.
     날짜 계산도 Date 의 지역시간 getter 대신 ISO 문자열 산술로 한다. */
  const ticks: { label: string; cx: number }[] = []
  const [firstYear, firstMonth] = runs[0].date.split('-').map(Number)
  const lastDay = dayIndex(runs[runs.length - 1].date)
  for (let step = 0; step < MAX_TICK_MONTHS; step += 2) {
    const monthIndex = firstMonth - 1 + step
    const year = firstYear + Math.floor(monthIndex / 12)
    const month = (monthIndex % 12) + 1
    const iso = `${year}-${String(month).padStart(2, '0')}-01`
    if (dayIndex(iso) > lastDay) break
    ticks.push({ label: MONTH_LABELS[month - 1], cx: x(iso) })
  }

  return (
    <div className="rounded-md border border-ink-200 bg-white">
      <div className="overflow-x-auto p-5 pb-3">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="block h-auto w-full min-w-[560px]"
          role="img"
          aria-label={`${runs[0].date}부터 ${runs[runs.length - 1].date}까지 ${runs.length}번의 벤치마크에서 식별한 precursor 수. ${runs[0].total_precursors_display}에서 시작해 ${lowest.run.date}에 ${lowest.run.total_precursors_display}까지 내려갔다가 ${runs[runs.length - 1].total_precursors_display}으로 올라선다.`}
        >
          <g>
            {gridValues.map((value) => (
              <g key={value}>
                <line x1={PLOT.left} y1={y(value)} x2={PLOT.right} y2={y(value)} className="stroke-ink-100" />
                <text x={PLOT.left - 8} y={y(value) + 4} textAnchor="end" className="fill-ink-500 font-mono text-[10.5px]">
                  {value / 1000}k
                </text>
              </g>
            ))}
          </g>

          <g>
            <line x1={lowest.cx} y1={PLOT.top} x2={lowest.cx} y2={PLOT.bottom} className="stroke-ink-400" strokeDasharray="3 3" />
            {/* 라벨은 골짜기 바로 위에 둔다. 축 꼭대기에 두면 무엇을 가리키는지 읽히지 않는다. */}
            <text
              x={lowest.cx + 8}
              y={Math.max(PLOT.top + 12, lowest.cy - 40)}
              className="fill-ink-500 font-mono text-[10.5px]"
            >
              min {lowest.run.total_precursors_display} · {lowest.run.date}
            </text>
          </g>

          <polyline
            points={points.map((point) => `${point.cx},${point.cy}`).join(' ')}
            className="fill-none stroke-brand-600"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {points.map((point, index) => (
            <circle
              cx={point.cx}
              cy={point.cy}
              r={index === points.length - 1 ? 4.5 : 3.5}
              className="fill-brand-600"
              key={point.run.slug}
            >
              <title>{point.run.date} · {point.run.total_precursors_display}</title>
            </circle>
          ))}

          <g>
            <line x1={PLOT.left} y1={PLOT.bottom + 12} x2={PLOT.right} y2={PLOT.bottom + 12} className="stroke-ink-400" />
            {ticks.map((tick) => (
              <text x={tick.cx} y={PLOT.bottom + 28} className="fill-ink-500 font-mono text-[10.5px]" key={tick.label}>
                {tick.label}
              </text>
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}

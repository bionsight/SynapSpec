# Benchmark 데이터 구조

`/benchmarks/` 아래 모든 페이지는 `site/data/benchmark_*.json` 여섯 개 파일을 읽습니다.
`docs/BENCHMARKS.md`는 예전 Jekyll 파이프라인(`_config.yml`, `_benchmarks/`)을 다루는
운영 문서이고, 이 문서는 지금 Astro 사이트가 실제로 읽는 JSON 스키마 자체를 다룹니다.
새 벤치마크 결과를 페이지에 반영할 때는 이 문서를 먼저 보면 됩니다.

## 파일 여섯 개와 역할

| 파일 | 역할 | 읽는 컴포넌트/페이지 |
|---|---|---|
| `benchmark_entries.json` | slug → kind. `[slug]/index.astro`의 라우팅 표 | `[slug]/index.astro` |
| `benchmark_catalog.json` | recorded 등급 run의 전체 데이터 + 프리셋 카탈로그 | `RecordedBenchmark.astro`, `RatioWidget.astro`, `PendingBenchmark.astro`, `history/index.astro` |
| `benchmark_imports.json` | ClearML summary만 가볍게 옮긴 run (imported 등급) | `ImportedBenchmark.astro` |
| `benchmark_ledger.json` | 데이터셋(OE480/Astral)별 run history 표 | `benchmarks/index.astro` |
| `benchmark_comparisons.json` + `benchmark_comparison_scatter.json` | SynapSpec·DIA-NN·Spectronaut 3-tool 비교 | `ComparisonBenchmark.astro` |
| `benchmarks.json` | Astral 전용 run 이력. `scripts/fetch_benchmarks.py` 산출물 | `history/index.astro`, `[slug]/index.astro`(kind: run) |

## 라우팅: kind 네 가지

`[slug]/index.astro`가 모든 `/benchmarks/:slug/` 요청을 받아 `benchmark_entries.json`에서
`slug`를 찾고, 그 항목의 `kind`로 컴포넌트를 고릅니다.

- **pending** — 프리셋은 있는데 아직 결과가 없음. `PendingBenchmark.astro`
- **imported** — ClearML Summary 표에서 가볍게 옮겨온 run. `ImportedBenchmark.astro`
- **recorded** — species별 log2 비율·CV·per-file 표까지 다 있는 완전판. `RecordedBenchmark.astro`
- **comparison** — 3-tool 비교 아카이브. `ComparisonBenchmark.astro`

**주의**: `benchmark_catalog.json`의 `dataset_catalog[].has_run`은 정보 표시용 필드일 뿐
라우팅에 관여하지 않습니다. 실제로 어떤 컴포넌트가 뜨는지는 오직 `benchmark_entries.json`의
`kind`가 결정합니다. `has_run`을 `true`로 바꿔도 `benchmark_entries.json`의 `kind`가
`pending`이면 여전히 "Results have not been imported" 화면이 뜹니다.

## `benchmark_catalog.json`

세 부분으로 나뉩니다.

### `recorded_runs` — slug로 찾는 맵

```json
{
  "recorded_runs": {
    "lfqbench-oe480": { ... },
    "2026-09-07-5d12a532": { ... }
  }
}
```

**키는 `benchmark_entries.json`에 등록된 실제 URL slug와 같아야 합니다.** `dataset_catalog`의
slug(`lfqbench-oe480`, `lfqbench-astral`)와 반드시 같지는 않습니다 — astral은 run이 여러 개
쌓일 수 있어서 날짜-커밋 슬러그(`2026-09-07-5d12a532`)를 따로 쓰고, oe480은 지금 recorded
run이 하나뿐이라 카탈로그 slug(`lfqbench-oe480`)를 그대로 재사용합니다. 새 run을 추가할 때
이 둘을 헷갈리면 빌드는 되는데(선택적 체이닝이 `undefined`를 그냥 통과시킴) 페이지가 빈
값만 렌더링합니다. `npm run build`로 끝나지 않고 실제 HTML에 값이 들어갔는지 확인하십시오.

각 항목의 필드:

| 필드 | 의미 |
|---|---|
| `title`, `instrument` | 페이지 제목("{title} / {instrument}") |
| `commit` | run을 만든 git 커밋 짧은 SHA |
| `config_file` | 이 run이 쓴 DeepMSFlow config 파일명(표시용) |
| `fasta` | 라이브러리 생성에 쓴 FASTA 파일명 |
| `time_range_display` | "Run date" 아래 보이는 시각 범위 텍스트. 소스 타임존이 불명확하면 "UTC"처럼 명시할 것 |
| `checked_display` | "Source record" 문단의 "checked on {…}" 날짜 텍스트 |
| `recorded_run` | run 요약 — 아래 참조 |
| `ratio_measurements` | species별 LFQ 정확도 — 아래 참조 |
| `recorded_config` | `[label, value]` 쌍 배열. "Run configuration" 표에 그대로 뿌려짐 |

`recorded_run` 구조:

```json
{
  "slug": "lfqbench-oe480",
  "date": "2026-09-14",
  "instance": "c7i.8xlarge",
  "runtime_hours": 4.2125,
  "runtime_display": "4 h 13 min",
  "total_precursors": 75346,
  "total_precursors_display": "75,346",
  "total_proteins": 9612,
  "total_proteins_display": "9,612",
  "files_in_experiment": 6,
  "files": [
    { "name": "...", "condition": "A", "replicate": 1,
      "precursors": 69455, "precursors_display": "69,455",
      "proteins": 9515, "proteins_display": "9,515" }
  ]
}
```

`total_precursors`/`total_proteins`는 ClearML의 `summary` 리포트 표(`total_precursors`,
`total_proteins`)에서, `files`는 `stats` 리포트 표(`run`, `precursors`, `proteins`)에서
가져옵니다. `_display` 필드는 천단위 콤마 문자열입니다 — Astro 템플릿에 숫자 포매팅
필터가 없어서 미리 만들어 둡니다.

### `ratio_measurements` — species별 LFQ 정확도

ClearML 리포트 표 `lfq_ratio_statistics`(species, median, target, `25%`, `75%`, count)에서
계산합니다.

| 필드 | 계산식 |
|---|---|
| `target` | `lfq_ratio_statistics.target` (species의 정답 log2(A/B) 비율) |
| `median` | `lfq_ratio_statistics.median` 그대로 |
| `lower` / `upper` | `lfq_ratio_statistics`의 `25%` / `75%` |
| `measured_ratio_display` | `2**median`을 소수 3자리로, 뒤에 `×` |
| `deviation_percent` | `round((2**(median-target) - 1) * 100, 1)` |
| `axis.actual.*` | 아래 "고정 축" 참조. `target`/`median`/`lower`/`upper` 각각의 log2 값을 좌표로 변환 |
| `axis.relative.*` | 마찬가지로, 단 `(값 - target)`의 편차를 좌표로 변환 |

**축은 고정 범위입니다.** `RatioWidget.astro`의 SVG는 매번 새로 계산하지 않고 이 좌표를
그대로 그립니다(viewBox `0 0 500 86`, 좌측 여백 24, 우측 여백 24, 그리는 폭 452).

- **actual** 패널: log2 범위 `[-2.5, 1.5]`(0.177×~2.83×) 고정. `x = 24 + (v + 2.5) * 113`
- **relative** 패널: 편차 범위 `[-0.5, 0.5]`(0.71×~1.41× 벗어남) 고정. `x = 24 + ((v - target) + 0.5) * 452`

두 공식 다 `ratio_axis_ticks`(같은 파일 최상위, 모든 recorded run이 공유)에 미리 계산된
눈금 위치와 일치해야 합니다. species 측정값이 이 고정 범위를 벗어나면 막대가 잘려
보이거나 축을 넘어갑니다 — 지금은 클리핑 처리를 안 하므로, 새 run의 편차가 유난히 크면
(예: 노이즈 많은 소수 species) 렌더링을 눈으로 한 번 확인하는 편이 안전합니다.

### `dataset_catalog` — 프리셋 목록

```json
{ "slug": "lfqbench-oe480", "name": "LFQBench", "instrument": "OE480",
  "preset": "bion_lfq_oe480", "has_run": true,
  "run_slug": "lfqbench-oe480", "commit": "fcaf6278",
  "key_config": "MBR on · Trypsin/P · 2 missed cleavages" }
```

`preset`은 DeepMSFlow `instrumentation/parsers/lfq_constants.py`의 `LFQ_BENCHMARK_PRESETS`
키와 일치해야 합니다. `has_run`/`run_slug`/`commit`/`key_config`는 앞서 말했듯 표시용이고,
실제 라우팅은 `benchmark_entries.json`이 합니다 — 이 파일을 고칠 때 `benchmark_entries.json`
갱신을 잊지 않도록 함께 체크하십시오.

## `benchmark_entries.json`

```json
{ "kind": "recorded", "slug": "lfqbench-oe480", "title": "LFQBench / OE480" }
```

`[slug]/index.astro`의 `getStaticPaths`가 이 배열과 `benchmarks.json.runs`를 합쳐서 정적
경로를 만듭니다. 두 소스의 slug는 서로 겹치지 않아야 합니다(런은 날짜만, 엔트리는
데이터셋 이름이거나 날짜+해시).

## `benchmark_imports.json`

```json
{ "slug": "2026-09-07-b4de5599", "commit": "b4de5599", "taskId": "...",
  "artifactId": "...", "started": "...", "completed": "...",
  "runtimeMinutes": 369, "totalPrecursors": 259474, "totalPrecursorsDisplay": "259,474",
  "totalProteins": 19464, "totalProteinsDisplay": "19,464", "status": "Completed",
  "resource": "c7i.8xlarge", "figure": null, "files": ["..."] }
```

recorded보다 가볍습니다 — species별 정확도 없이 ClearML Summary 표 숫자와(있으면) 원본
`all_plots_summary` 그림 링크만 옮깁니다. 정확도까지 필요 없고 빨리 올리고 싶은 run에
씁니다.

## `benchmark_ledger.json`

`benchmarks/index.astro`가 이 배열(데이터셋마다 하나, 지금은 OE480/Astral 둘)을
`const [oe480, astral] = ledgers`로 순서에 의존해서 구조분해합니다 — **배열 순서를
바꾸면 페이지의 두 탭이 뒤바뀝니다.**

각 항목의 `rows`가 "Run history" 표 한 줄씩입니다.

```json
{ "id": "lfqbench-oe480", "date": "2026-09-14", "label": "SynapSpec run · PXD028735 raw files",
  "sourceSlug": "lfqbench-oe480", "comparisonSlug": null,
  "counts": [75346, null, null], "counts_display": ["75,346", null, null],
  "runtime": 4.2125, "resource": "c7i.8xlarge", "commit": "fcaf6278" }
```

`counts`는 항상 `[SynapSpec, DIA-NN, Spectronaut]` 순서입니다. 비교 대상이 없으면 `null` —
표에는 "—"로 뜨고 "링크 없음"이지 "0"이 아니라는 뜻입니다. `sourceSlug`가
`/benchmarks/{sourceSlug}/`로 링크됩니다. 새 recorded run을 만들면 `sourceSlug`를 그
`recorded_runs` 키와 똑같이 맞추십시오.

**알려진 한계**: 항목 최상위의 `files`(고정 입력 파일 목록)는 데이터셋 그룹 전체에
걸리는 값이라, 같은 그룹 안에서 실제 run마다 원본 파일명이 다르면(예: PXD028735의
`LFQ_Orbitrap_AIF_Condition_*` vs 예전 아카이브 비교의 `20240910_LFQBench_120min_*`)
"Fixed input-file list"에 그 run 자신의 파일명이 아니라 그룹 대표 파일명이 뜹니다.
지금은 이 불일치를 표시하는 장치가 없습니다.

## `benchmark_comparisons.json` / `benchmark_comparison_scatter.json`

kind가 `comparison`인 두 항목(`lfqbench-202409-archived`, `lfqbench-202502-archived`)
전용입니다. `benchmark_comparisons.json`은 도구별 상세(파일별 precursor 수, CV, 완주율),
`benchmark_comparison_scatter.json`은 리더보드용으로 도구별 `median_epsilon`(log2 오차
중앙값)만 뽑아둔 것입니다. `ledger_slug`/`slug`로 서로 연결됩니다. 이번에 추가한 oe480
recorded run은 DIA-NN·Spectronaut 비교 데이터가 없어서 이 두 파일에는 손대지 않았습니다.

## `benchmarks.json`

`scripts/fetch_benchmarks.py`가 ClearML 프로젝트 `DeepMSFlow/lfq/astral`(태그
`bion-lfq-astral`)만 긁어서 만드는 Astral 전용 run 이력입니다. `history/index.astro`의
"Identification history" 차트와 표가 여기서 나옵니다. oe480·다른 프리셋은 아직 이
스크립트가 다루지 않습니다 — `docs/BENCHMARKS.md`의 TODO에도 "oe480 장비 추가"가
미완으로 남아 있습니다.

## 새 recorded run을 추가하는 절차

**대부분은 `scripts/manage_benchmarks.py`를 쓰면 아래 6단계를 대신합니다.**

```bash
uv run --with pyyaml python3 scripts/manage_benchmarks.py new recorded <slug>
# scripts/benchmark_runs/<slug>.yaml 생성됨 — 에디터로 값을 채운다

uv run --with pyyaml python3 scripts/manage_benchmarks.py apply scripts/benchmark_runs/<slug>.yaml --dry-run
uv run --with pyyaml python3 scripts/manage_benchmarks.py apply scripts/benchmark_runs/<slug>.yaml

uv run --with pyyaml python3 scripts/manage_benchmarks.py validate   # 6개 JSON 정합성 검사
uv run --with pyyaml python3 scripts/manage_benchmarks.py list       # 등록된 프리셋·항목 조회
```

값만 채우면 세 파일(`benchmark_catalog.json`의 `recorded_runs`/`dataset_catalog`,
`benchmark_entries.json`, 필요하면 `benchmark_ledger.json`)을 정합성 맞춰 한 번에
갱신하고, 비율 위젯 축 좌표(`axis.actual`/`axis.relative`)와
`measured_ratio_display`/`deviation_percent`도 "고정 축" 절의 공식으로 자동 계산합니다.
`imported` 등급은 `new imported <slug>` → `apply`로 등록합니다. 채운 YAML은
`scripts/benchmark_runs/`에 남으니 JSON 변경과 함께 커밋해 두면 숫자의 출처가
기록으로 남습니다. 아래 수동 절차는 CLI가 다루지 않는 필드(`diagnostics`,
`quartile_measurements` 등 이미지·통계 파이프라인)를 직접 만질 때, 또는 각 필드가
어떤 의미인지 확인할 때 참고하면 됩니다.

**`total_precursors`/`total_proteins`/`ratio_measurements`/파일별 표까지 손으로 옮기지
않으려면** `new meta <slug>`로 (parquet에 없는 값만 담는) 짧은 사이드카를 만들고,
`from-parquet <precursors.parquet> <meta.yaml>`로 나머지를 계산해서 채운 recorded
YAML을 생성할 수 있습니다 (`uv run --with pandas --with pyarrow --with numpy` 필요).
DeepMSFlow `instrumentation/parsers/lfq.py`의 계산 로직을 pandas로 옮긴 것이라
ClearML의 실제 summary/stats 리포트 표와 정확히 같은 숫자가 나온다는 보장은
없습니다 — 처음 쓸 때는 이미 검증된 run의 parquet으로 한 번 돌려서 기존 숫자와
맞는지 확인하세요. 만들어진 YAML은 그대로 `apply`하지 말고 한 번 검토할 것
(특히 파일별 `replicate`는 parquet만으로 못 채워서 항상 비어 있습니다).

1. ClearML task에서 `summary`, `stats`, `lfq_ratio_statistics` 리포트 표를 가져옵니다
   (`task.get_reported_plots()`로 plotly 표를 읽는 방식은 `scripts/fetch_benchmarks.py`의
   `reported_tables()`를 그대로 재사용할 수 있습니다).
2. 위 공식으로 `recorded_run`과 `ratio_measurements`를 만듭니다.
3. `benchmark_catalog.json`의 `recorded_runs`에 새 키로 추가합니다. 키는 이 run이 실제로
   보일 URL slug와 같아야 합니다. `dataset_catalog`의 해당 프리셋도 `has_run`/`run_slug`/
   `commit`을 갱신합니다(표시용이지만 최신 상태로 유지).
4. `benchmark_entries.json`에 `{ "kind": "recorded", "slug": "...", "title": "..." }`를
   추가하거나, 기존 `pending` 항목의 `kind`만 `recorded`로 바꿉니다.
5. 필요하면 `benchmark_ledger.json`의 해당 데이터셋 `rows`에 행을 추가합니다(메인
   `/benchmarks/` 목록에 노출하고 싶을 때).
6. `npm run check`와 `npm run build`로 검증하고, 새 페이지를 브라우저로 직접 열어
   비율 위젯이 잘리지 않는지 확인합니다.

## 요약

여섯 개 JSON은 각자 역할이 다르지만 실제 라우팅의 유일한 진실은 `benchmark_entries.json`의
`kind`입니다. `benchmark_catalog.json`의 `has_run`이나 `dataset_catalog`는 문서화·표시용
부가 정보일 뿐이라는 점을 놓치면, 데이터는 다 채웠는데 페이지는 그대로 "not imported"로
남는 원인을 못 찾고 헤매게 됩니다. `RecordedBenchmark.astro`/`RatioWidget.astro`는
astral 하나만 가정하고 만들어졌다가 이번에 slug 기반으로 일반화됐으니, 앞으로 recorded
run을 추가하는 작업은 새 컴포넌트를 만들 필요 없이 데이터만 채우면 됩니다.

# Benchmarks 페이지 — 현황과 TODO

> 최종 갱신 2026-09-30. 관련 파일은 이 문서 맨 아래 목록 참조.

## 현재 상태

`/benchmarks/` 와 run별 상세 페이지는 **팀장 승인을 받아 공개 상태**다.

처음(2026-08-26)에는 팀장 검토 전이라 내비게이션 링크, `noindex`, sitemap 세 가지로
가려 두었다. 내비게이션 링크는 Astro 이관(PR #5, 2026-09-18) 때 `site/data/nav.ts` 에
들어가면서 먼저 열렸다. 나머지 둘은 2026-09-30 에 풀었다.

**주의:** 2026-08-26 08:55~09:13 UTC(약 18분) 동안은 내비게이션에 링크가 있었고
sitemap.xml 에도 포함돼 있었다. 또한 이 저장소는 public 이므로 커밋 이력에
벤치마크 수치와 내부 ClearML 프로젝트 경로(`DeepMSFlow/lfq/astral`)가 남아 있다.
자격증명은 커밋되지 않았다. 내부 ClearML 호스트명과 task 링크는 PXD055927 comparison JSON의
출처(`sources[].url`)로 커밋돼 있고, 의도적으로 유지한다.

**2026-09-18: `/benchmarks/leaderboard/` 페이지를 지웠다.** 도구별 순위표라
OE480에서 SynapSpec이 2위(DIA-NN보다 낮은 정확도), Astral에서도 2위
(Spectronaut보다 낮은 정확도)로 나왔는데, 회사 포지셔닝과 맞지 않는다는
판단이었다. 근거 데이터(`benchmark_comparisons.json`,
`benchmark_comparison_scatter.json`)는 그대로 남아 있고 `ComparisonBenchmark.astro`의
"Accuracy vs. depth" 차트에서 계속 쓴다 — 지워진 건 그 데이터를 등수로 요약해
보여주던 페이지 하나뿐이다.

**2026-09-30: 목록에서 닿지 않는 상세 페이지 26개를 지웠다.** 날짜별 run 페이지 18개
(`benchmarks.json`), archived comparison 2개, 9월 초 import·recorded run 5개,
`lfqbench-oe480` 1개다. 공개 전환으로 sitemap에 올라가자 옛 기준의 숫자가 색인될 수
있었다. `ComparisonBenchmark.astro`와 `RunBenchmark.astro`도 함께 지웠다.
`benchmark_comparisons.json`은 목록의 `ComparisonWidget.astro`가 계속 읽는다.
`benchmark_comparison_scatter.json`과 `benchmarks.json`은 이제 사이트에서 읽는 곳이
없지만, 스크립트가 쓰고 읽으므로 남겨 두었다.

## TODO

### 1. 공개 전환 (완료)

- [x] `site/data/nav.ts` 의 `navigation` 에 `{ name: "Benchmarks", url: "/benchmarks/" }` 추가 (2026-09-18)
- [x] `site/pages/benchmarks/` 아래 세 페이지의 `BaseLayout` 에서 `noindex` 삭제 (2026-09-30)
- [x] `astro.config.mjs` 의 `sitemap()` 에서 `/benchmarks/` 제외 `filter` 삭제 (2026-09-30)

### 2. 개발 환경

- [x] **로컬 빌드.** Astro 이관으로 해결됐다. `npm run check`, `npm run build`,
      `npm run dev` 로 배포 전에 확인한다. Ruby 설치와 Liquid 검증 스크립트는 더
      필요 없다.

### 3. 데이터

- [x] **DIA-NN 단발 수치 import (2026-09-18).** `DiaNN/lfq/oe480/PXD028735`,
      `DiaNN/lfq/astral` 에서 유효한 DIA-NN run을 각각 하나씩 찾아 `report.parquet` 을
      S3(`s3://bionlab-clearml/DiaNN/...`)에서 직접 내려받고 duckdb로 집계해
      `site/data/benchmark_imports.json` 에 `imported` 등급으로 넣었다
      (`pxd028735-diann`, `proteobench-2th-astral-diann`). ClearML 쪽 `summary`
      리포트 테이블은 이 두 task 모두 생성되지 않았다 — 콘솔 로그에
      `Precursors file not found: /root/output/precursors.parquet` 에러가 있고,
      `parsers.metric.parse_metrics` 가 SynapSpec 쪽 비교 파서를 재사용하다가 실패한
      것으로 보인다(아래 "경쟁 도구 비교" 항목과 같은 근본 원인). 그래서 숫자는 ClearML
      Summary 표가 아니라 report.parquet 을 직접 파싱해서 얻었다:
      - PXD028735 (task `5d5ec6c2…`, commit `14c551d4`, 2026-02-04, 2:07h):
        precursors 103,433 · protein groups 9,951
      - ProteoBench 2 Th mix, HYE / Astral (task `9c5cbc9e…`, commit `0f88c370`,
        2026-06-26, 4:16h): precursors 286,311 · protein groups 16,858
      - Spectronaut 쪽은 ClearML 전체를 뒤져도(프로젝트/태스크/태그 어디에도)
        run이 없다. `benchmark_ledger.json` 의 Spectronaut 칸은 계속 "—". 대신
        `/export/data_ms/reports/LFQBench/PXD028735/Alpha/` 에 Spectronaut
        DirectDIA 리포트(`spectronaut_v19_7`, `spectronaut_v19_7_hybrid`)가 완주
        상태로 있는 걸 확인했다 — precursor 99,562 / protein group 8,302
        (hybrid는 112,053 / 8,674). 아직 사이트에는 반영 안 했다.
      - **이 두 숫자는 species별 ratio·CV·completeness가 없는 단순 집계일 뿐이다.**
        진짜 3-tool 비교(`lfqbench-202409-archived`/`lfqbench-202502-archived`
        같은 급)를 만들려면 아래 "경쟁 도구 비교" 항목에 있는 대로 DeepMSFlow
        `instrumentation/parsers/lfq.py` 의 4-tool 비교 코드를 이 report.parquet
        에 대해 직접 돌려야 한다 — 아직 안 했다.
- [ ] **정확도 지표 커버리지.** 18건 중 1건(2026-07-22)만 `lfq_ratio_statistics` 를 갖는다.
      LFQ 파서가 2026-07 에 도입돼서 그 이전 run 에는 없다. main 에 벤치마크가 더 돌면
      스크립트 재실행만으로 채워진다.
- [ ] **릴리스 대응 run.** SynapSpec 0.11.0(2026-08-19) 릴리스 커밋으로 돌린 벤치마크가 없어
      제품 버전과 수치가 대응되지 않는다. 릴리스 커밋으로 한 번 돌리면 가장 깔끔하다(약 7~10시간).
- [ ] **`TARGET_LOG2_RATIOS` 이중 관리.** `scripts/fetch_benchmarks.py` 의 상수는
      DeepMSFlow `instrumentation/parsers/lfq_constants.py` 의 `bion_lfq_astral` 프리셋을
      옮겨 적은 것이다. 저쪽이 바뀌면 여기도 고쳐야 한다.

### 4. 페이지 확장

- [ ] **런타임 추세 차트.** 지금은 depth 만 그린다. 런타임을 그리려면 인스턴스 타입별로
      분리해야 한다 — main run 이 `c7i.8xlarge`(CPU) 13건과 `g5.4xlarge`(GPU) 11건으로
      섞여 있어 한 선에 올리면 무의미하다.
- [ ] **oe480 장비 추가.** `DeepMSFlow/lfq/oe480` 에 108건이 있다. 두 번째 장비 섹션 가능.
- [ ] **경쟁 도구 비교.** `DiaNN/lfq/astral` 13건, `AlphaDIA/lfq/astral` 2건이 같은
      LFQBench 데이터로 돌아가 있다. 다만 이 run 들은 ClearML 리포트 테이블이 없고
      결과가 parquet 아티팩트에만 있어서, 비교하려면 LFQBench 분석을 직접 돌려야 한다.
      DeepMSFlow `instrumentation/parsers/lfq.py` 에 4-tool 비교 코드
      (`Previous SynapSpec` / `Current SynapSpec` / `DIA-NN` / `Spectronaut`)가 이미 있다.
      위 "데이터" 절의 DIA-NN 단발 수치 import는 이 4-tool 비교를 대신하는 게 아니라,
      precursor/protein 총계만 급하게 뽑아 둔 것이다. Spectronaut 은 이제 원본 리포트
      위치(`/export/data_ms/reports/LFQBench/PXD028735/Alpha/`)를 알고 있으니, DIA-NN
      쪽까지 포함해 이 4-tool 비교 코드를 직접 돌리는 게 다음 단계다.

### 5. 운영

- [ ] **자동 갱신.** 지금은 수동이다. ClearML 이 사내망(`clearml.bionsight.internal`)이라
      GitHub 호스팅 러너에서 접근할 수 없기 때문. DeepMSFlow 가 쓰는 ARC 온프레미스 러너
      (`on-premise-cpu`)를 이 저장소에서도 쓸 수 있으면 cron 워크플로우로 자동화 가능하다.
- [x] **사이트 이관.** TanStack Start 대신 Astro 로 옮겼다(PR #5, 2026-09-18).
      수집 결과는 `site/data/benchmarks.json` 으로 옮겨 그대로 재사용한다.

### 6. 무관하지만 위험한 것

- [ ] **`feat/tanstack-start-site` 브랜치의 upstream 이 `origin/gh-page` 로 잡혀 있다.**
      그 브랜치에서 인자 없이 `git push` 하면 라이브 사이트 브랜치로 밀린다.
      `git push -u origin feat/tanstack-start-site` 로 바로잡을 것.

## 갱신 방법

```bash
cd <이 저장소의 gh-page 작업 트리>
uv run --with clearml python scripts/fetch_benchmarks.py
git add -A && git commit -m "chore: update benchmarks" && git push origin gh-page
```

최초 1회 `clearml-init` 필요 (ClearML UI → Settings → Workspace → Create new credentials).

스크립트 옵션: `--branch` (기본 `main`, `*` 는 전체), `--since`, `--limit`, `--dry-run`.

## 관련 파일

| 파일 | 역할 |
|---|---|
| `scripts/fetch_benchmarks.py` | ClearML SDK 로 수집 → JSON 생성 |
| `site/data/benchmarks.json` | 수집 결과. 커밋되므로 빌드에 네트워크가 필요 없다 |
| `site/pages/benchmarks/index.astro` | 리스트 페이지 |
| `site/pages/benchmarks/[slug]/index.astro` | 상세 페이지. `getStaticPaths` 가 `benchmark_entries.json` 에서 만든다 |
| `site/components/benchmark/` | 상세 페이지 컴포넌트와 차트 위젯 |
| `site/styles/_benchmark.scss` | 스타일 |

## 데이터 출처

- ClearML 프로젝트 `DeepMSFlow/lfq/astral`, 태그 `bion-lfq-astral`, 상태 `completed`, 브랜치 `main`
- 데이터셋: LFQBench (human/yeast/E. coli 3종 혼합, A/B 조건 × 3 replicate = 6 raw file)
- 정답 log2(A/B) 비율: HUMAN 0.0, ECOLI -2.0, YEAS8 1.0
- 지표는 ClearML 리포트 테이블(`events.get_task_plots`)에서 읽는다. S3 접근은 필요 없다.

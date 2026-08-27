# Benchmarks 페이지 — 현황과 TODO

> 최종 갱신 2026-08-27. 관련 파일은 이 문서 맨 아래 목록 참조.

## 현재 상태

`/benchmarks/` 와 run별 상세 페이지가 **라이브에 배포돼 있지만 비공개 상태**다.
팀장 검토 전이라 다음 세 가지로 가려 놓았다.

| 방법 | 위치 |
|---|---|
| 내비게이션 링크 제거 | `_config.yml` 의 `navigation` (헤더·푸터가 함께 참조) |
| 검색엔진 색인 차단 | `noindex: true` → `_layouts/default.html` 의 robots 메타 |
| 사이트맵 제외 | `sitemap: false` |

링크를 아는 사람만 접근할 수 있고, 사이트를 돌아다니다 발견할 수는 없다.

**주의:** 2026-08-26 08:55~09:13 UTC(약 18분) 동안은 내비게이션에 링크가 있었고
sitemap.xml 에도 포함돼 있었다. 또한 이 저장소는 public 이므로 커밋 이력에
벤치마크 수치와 내부 ClearML 프로젝트 경로(`DeepMSFlow/lfq/astral`)가 남아 있다.
자격증명과 내부 호스트명은 커밋되지 않았다.

## TODO

### 1. 공개 전환 (팀장 승인 후)

네 군데를 되돌리면 된다. 하나라도 빠지면 어중간하게 노출된다.

- [ ] `_config.yml` → `navigation` 에 `- name: "Benchmarks" / url: "/benchmarks/"` 추가
- [ ] `_config.yml` → benchmarks 컬렉션 `defaults` 에서 `noindex` / `sitemap` 두 줄 삭제
- [ ] `benchmarks/index.md` front matter 에서 `noindex` / `sitemap` 두 줄 삭제
- [ ] `scripts/fetch_benchmarks.py` 의 `write_collection()` 에서 stub front matter 두 줄 삭제 후 스크립트 재실행

### 2. 개발 환경

- [ ] **Ruby 3.x 설치.** 시스템 Ruby 2.6 이 `Gemfile.lock` 의 bundler 2.7.1 을 못 써서
      `bundle exec jekyll serve` 가 안 된다. 지금은 배포 후 브라우저로만 확인 가능한 상태다.
      `brew install ruby` 또는 rbenv.
- [ ] **Liquid 검증 스크립트를 저장소로 옮기기.** python-liquid 로 템플릿을 렌더해
      문법 오류·미치환 태그·style 퍼센트 범위를 검사하는 스크립트를 임시로 썼는데
      저장소에 없다. Jekyll 로컬 빌드가 되면 불필요해질 수도 있다.

### 3. 데이터

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

### 5. 운영

- [ ] **자동 갱신.** 지금은 수동이다. ClearML 이 사내망(`clearml.bionsight.internal`)이라
      GitHub 호스팅 러너에서 접근할 수 없기 때문. DeepMSFlow 가 쓰는 ARC 온프레미스 러너
      (`on-premise-cpu`)를 이 저장소에서도 쓸 수 있으면 cron 워크플로우로 자동화 가능하다.
- [ ] **TanStack Start 이관 대비.** 신버전 사이트로 넘어가면 `_data/benchmarks.json` 은
      그대로 재사용하고 템플릿만 `.tsx` 로 다시 쓰면 된다. 수집 스크립트는 손댈 필요 없다.

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
| `scripts/fetch_benchmarks.py` | ClearML SDK 로 수집 → JSON + 컬렉션 stub 생성 |
| `_data/benchmarks.json` | 수집 결과. 커밋되므로 빌드에 네트워크가 필요 없다 |
| `_benchmarks/<날짜>.md` | 상세 페이지 stub. 스크립트가 생성·삭제하므로 직접 수정 금지 |
| `benchmarks/index.md` | 리스트 페이지 |
| `_layouts/benchmark_run.html` | 상세 페이지 레이아웃 |
| `_sass/_benchmark.scss` | 스타일 |

## 데이터 출처

- ClearML 프로젝트 `DeepMSFlow/lfq/astral`, 태그 `bion-lfq-astral`, 상태 `completed`, 브랜치 `main`
- 데이터셋: LFQBench (human/yeast/E. coli 3종 혼합, A/B 조건 × 3 replicate = 6 raw file)
- 정답 log2(A/B) 비율: HUMAN 0.0, ECOLI -2.0, YEAS8 1.0
- 지표는 ClearML 리포트 테이블(`events.get_task_plots`)에서 읽는다. S3 접근은 필요 없다.

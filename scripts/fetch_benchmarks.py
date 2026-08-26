#!/usr/bin/env python3
"""ClearML에서 SynapSpec LFQBench 벤치마크 이력을 긁어 _data/benchmarks.json 생성.

읽기 전용 — ClearML의 어떤 데이터도 수정하지 않습니다.

준비 (최초 1회):
    uv tool install clearml        # 또는 pip install clearml
    clearml-init                   # ClearML UI의 credentials 블록을 붙여넣기
                                   # http://clearml.bionsight.internal:8080/settings/workspace-configuration

실행:
    uv run --with clearml python scripts/fetch_benchmarks.py
    # 또는 clearml이 이미 깔린 환경에서
    python3 scripts/fetch_benchmarks.py

옵션:
    --since YYYY-MM-DD   해당 날짜 이후의 run만 수집
    --limit N            최근 N개만 수집 (테스트용)
    --dry-run            파일을 쓰지 않고 요약만 출력
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    from clearml import Task
except ImportError:
    sys.exit("clearml이 필요합니다.  uv run --with clearml python scripts/fetch_benchmarks.py")

PROJECT = "DeepMSFlow/lfq/astral"
BENCHMARK_TAG = "bion-lfq-astral"
OUT_PATH = Path(__file__).resolve().parent.parent / "_data" / "benchmarks.json"

# DeepMSFlow instrumentation/parsers/lfq_constants.py 의 bion_lfq_astral 프리셋과 일치해야 함.
# 이 값이 바뀌면 여기도 같이 고쳐야 합니다.
TARGET_LOG2_RATIOS = {"HUMAN": 0.0, "ECOLI": -2.0, "YEAS8": 1.0}
SPECIES_LABELS = {"HUMAN": "Human", "ECOLI": "E. coli", "YEAS8": "Yeast"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument(
        "--branch",
        default="main",
        help='이 git 브랜치의 run만 수집 (기본: main). "*" 를 주면 브랜치 무관',
    )
    parser.add_argument("--since", metavar="YYYY-MM-DD", help="이 날짜 이후의 run만 수집")
    parser.add_argument("--limit", type=int, metavar="N", help="최근 N개만 수집 (테스트용)")
    parser.add_argument("--dry-run", action="store_true", help="파일을 쓰지 않고 요약만 출력")
    return parser.parse_args()


def log(message: str) -> None:
    print(message, file=sys.stderr)


def as_date(value: object) -> str | None:
    """ClearML의 started 필드를 YYYY-MM-DD 로 정규화."""
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, str) and len(value) >= 10:
        return value[:10]
    return None


def thousands(value: int) -> str:
    """Liquid 에는 천단위 구분자 필터가 없으므로 표시용 문자열을 미리 만든다."""
    return f"{value:,}"


def git_branch(task: Task) -> str | None:
    """hyperparams.metadata.git_branch 를 읽는다. 없으면 None."""
    metadata = (getattr(task.data, "hyperparams", None) or {}).get("metadata") or {}
    return getattr(metadata.get("git_branch"), "value", None)


def reported_tables(task: Task) -> dict[str, list[dict]]:
    """리포트된 플롯 중 테이블 형태인 것만 {variant: [row, ...]} 로 변환."""
    tables: dict[str, list[dict]] = {}
    for plot in task.get_reported_plots():
        variant = plot.get("variant")
        raw = plot.get("plot_str")
        if not variant or not isinstance(raw, str):
            continue
        try:
            trace = json.loads(raw)["data"][0]
            headers = [h[0] if isinstance(h, list) else h for h in trace["header"]["values"]]
            columns = trace["cells"]["values"]
        except (KeyError, IndexError, ValueError, TypeError):
            continue  # 테이블이 아닌 일반 그래프
        if not columns or not headers:
            continue
        tables[variant] = [
            {header: columns[col][row] for col, header in enumerate(headers)} for row in range(len(columns[0]))
        ]
    return tables


def build_accuracy(ratio_rows: list[dict]) -> list[dict]:
    """lfq_ratio_statistics 를 종별 정확도 항목으로 변환."""
    accuracy = []
    for row in ratio_rows:
        species = row.get("species")
        if species not in TARGET_LOG2_RATIOS:
            continue
        target = TARGET_LOG2_RATIOS[species]
        median = round(float(row["median"]), 4)
        accuracy.append(
            {
                "species": species,
                "label": SPECIES_LABELS[species],
                "target_log2_ratio": target,
                "median_log2_ratio": median,
                # Liquid에서 빼면 부동소수점 찌꺼기가 노출되므로 여기서 계산한다.
                "deviation": round(median - target, 4),
                "mad_from_target": round(float(row["MAD_target"]), 4),
                "count": int(row["count"]),
                "count_display": thousands(int(row["count"])),
            }
        )
    # 사람 눈에 익은 순서로
    order = list(TARGET_LOG2_RATIOS)
    accuracy.sort(key=lambda item: order.index(item["species"]))
    return accuracy


def build_run(task_id: str, branch: str) -> dict | None:
    """Task 하나를 사이트가 쓸 run 레코드로 변환. 브랜치가 다르거나 지표가 없으면 None."""
    task = Task.get_task(task_id=task_id)

    # 개발 브랜치의 실험 결과를 제품 성능으로 게재하지 않기 위한 필터.
    # 같은 데이터셋이라도 브랜치마다 설정이 달라 수치가 크게 흔들린다.
    if branch != "*" and git_branch(task) != branch:
        return None

    tables = reported_tables(task)

    ratio_rows = tables.get("lfq_ratio_statistics")
    summary_rows = tables.get("summary")
    if not ratio_rows or not summary_rows:
        return None  # 파서 도입 이전의 오래된 run

    accuracy = build_accuracy(ratio_rows)
    if not accuracy:
        return None

    data = task.data
    started = as_date(getattr(data, "started", None))
    if started is None:
        return None

    duration = getattr(data, "active_duration", None)
    instance = next(
        (tag.split(":", 1)[1] for tag in (task.get_tags() or []) if tag.startswith("instance:")),
        None,
    )
    summary = summary_rows[0]

    return {
        # 커밋 SHA는 의도적으로 제외 — 비공개 저장소 정보
        "date": started,
        "instance": instance,
        "runtime_hours": round(duration / 3600, 2) if duration else None,
        "total_precursors": int(summary["total_precursors"]),
        "total_precursors_display": thousands(int(summary["total_precursors"])),
        "total_proteins": int(summary["total_proteins"]),
        "total_proteins_display": thousands(int(summary["total_proteins"])),
        "files_in_experiment": len(tables.get("stats") or []),
        "accuracy": accuracy,
    }


def main() -> None:
    args = parse_args()

    log(f"ClearML 조회: {PROJECT}  (tag: {BENCHMARK_TAG}, branch: {args.branch})")
    task_ids = Task.query_tasks(
        project_name=PROJECT,
        tags=[BENCHMARK_TAG],
        task_filter={
            "status": ["completed"],
            "order_by": ["-started"],
            "page": 0,
            "page_size": 1000,
        },
    )
    if not task_ids:
        sys.exit("조건에 맞는 task가 없습니다. 프로젝트 이름과 태그를 확인하세요.")

    if args.limit:
        task_ids = task_ids[: args.limit]
    log(f"완료된 task {len(task_ids)}개\n")

    runs: list[dict] = []
    skipped = 0
    failed = 0

    for index, task_id in enumerate(task_ids, 1):
        try:
            run = build_run(task_id, args.branch)
        except Exception as exc:  # noqa: BLE001 — 한 건 실패로 전체를 멈추지 않음
            log(f"  [{index}/{len(task_ids)}] {task_id}  실패: {exc}")
            failed += 1
            continue

        if run is None:
            skipped += 1
            continue
        if args.since and run["date"] < args.since:
            continue

        runs.append(run)
        log(f"  [{index}/{len(task_ids)}] {run['date']}  precursors={run['total_precursors']:,}")

    runs.sort(key=lambda item: item["date"])

    log("")
    log(f"수집 {len(runs)}개 / 브랜치·지표 불일치 {skipped}개 / 실패 {failed}개")
    if not runs:
        sys.exit("수집된 run이 없습니다. 중단합니다.")

    payload = {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "dataset": {
            "name": "LFQBench",
            "description": "Human/yeast/E. coli 3종 혼합물을 A/B 두 조건에 알려진 비율로 섞은 표준 벤치마크",
            "instrument": "Orbitrap Astral",
            "files": 6,
            "conditions": ["A", "B"],
            "replicates": 3,
            "target_log2_ratios": TARGET_LOG2_RATIOS,
        },
        "filter": {"branch": args.branch, "project": PROJECT, "tag": BENCHMARK_TAG},
        "coverage": {
            "date_from": runs[0]["date"],
            "date_to": runs[-1]["date"],
            "run_count": len(runs),
        },
        "runs": runs,
    }

    if args.dry_run:
        log("\n--dry-run: 파일을 쓰지 않습니다. 최신 run:")
        print(json.dumps(runs[-1], indent=2, ensure_ascii=False))
        return

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    log(f"\n작성 완료: {OUT_PATH}")
    log(f"  {len(runs)} runs,  {runs[0]['date']} ~ {runs[-1]['date']}")


if __name__ == "__main__":
    main()

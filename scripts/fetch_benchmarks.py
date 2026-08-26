#!/usr/bin/env python3
"""ClearML에서 SynapSpec LFQBench 벤치마크 이력을 긁어 사이트 데이터로 만든다.

읽기 전용 — ClearML의 어떤 데이터도 수정하지 않는다.

생성물:
    _data/benchmarks.json      전체 이력 (리스트 페이지가 읽음)
    _benchmarks/<날짜>.md      run 하나당 상세 페이지 stub

준비 (최초 1회):
    clearml-init      # ClearML UI 의 credentials 블록을 붙여넣기

실행:
    uv run --with clearml python scripts/fetch_benchmarks.py

옵션:
    --branch NAME        수집할 git 브랜치 (기본 main, "*" 는 전체)
    --since YYYY-MM-DD   해당 날짜 이후만
    --limit N            최근 N개만 (테스트용)
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

ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT / "_data" / "benchmarks.json"
COLLECTION_DIR = ROOT / "_benchmarks"

# DeepMSFlow instrumentation/parsers/lfq_constants.py 의 bion_lfq_astral 프리셋과 일치해야 한다.
TARGET_LOG2_RATIOS = {"HUMAN": 0.0, "ECOLI": -2.0, "YEAS8": 1.0}
SPECIES_LABELS = {"HUMAN": "Human", "ECOLI": "E. coli", "YEAS8": "Yeast"}

# 상세 페이지의 파일별 표에 싣는 지표
PER_FILE_METRICS = ("precursors", "proteins", "ms1_error", "ms2_error", "rt_error", "fwhm_rt")

MONTH_NAMES = ("", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--branch", default="main", help='수집할 git 브랜치 (기본 main, "*" 는 전체)')
    parser.add_argument("--since", metavar="YYYY-MM-DD", help="이 날짜 이후의 run만 수집")
    parser.add_argument("--limit", type=int, metavar="N", help="최근 N개만 수집 (테스트용)")
    parser.add_argument("--dry-run", action="store_true", help="파일을 쓰지 않고 요약만 출력")
    return parser.parse_args()


def log(message: str) -> None:
    print(message, file=sys.stderr)


def thousands(value: int) -> str:
    """Liquid 에는 천단위 구분자 필터가 없으므로 표시용 문자열을 미리 만든다."""
    return f"{value:,}"


def as_date(value: object) -> str | None:
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, str) and len(value) >= 10:
        return value[:10]
    return None


def git_branch(task: Task) -> str | None:
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
                # Liquid 에서 빼면 부동소수점 찌꺼기가 노출되므로 여기서 계산한다.
                "deviation": round(median - target, 4),
                "mad_from_target": round(float(row["MAD_target"]), 4),
                "count": int(row["count"]),
                "count_display": thousands(int(row["count"])),
            }
        )
    order = list(TARGET_LOG2_RATIOS)
    accuracy.sort(key=lambda item: order.index(item["species"]))
    return accuracy


def build_files(stat_rows: list[dict]) -> list[dict]:
    """파일별 지표. 값이 전부 비어 있는 컬럼(예: Astral 의 mobility)은 싣지 않는다."""
    files = []
    for row in stat_rows:
        name = str(row.get("run", ""))
        entry = {"name": name, "short_name": "_".join(name.split("_")[-2:]) or name}
        for metric in PER_FILE_METRICS:
            value = row.get(metric)
            if value is None:
                continue
            if metric in ("precursors", "proteins"):
                entry[metric] = int(value)
                entry[f"{metric}_display"] = thousands(int(value))
            else:
                entry[metric] = round(float(value), 4)
        files.append(entry)
    return files


def build_run(task_id: str, branch: str) -> dict | None:
    """Task 하나를 사이트가 쓸 run 레코드로 변환. 조건에 안 맞으면 None."""
    task = Task.get_task(task_id=task_id)

    # 개발 브랜치의 실험 결과를 제품 성능으로 게재하지 않기 위한 필터.
    # 같은 데이터셋이라도 브랜치마다 설정이 달라 수치가 크게 흔들린다.
    if branch != "*" and git_branch(task) != branch:
        return None

    tables = reported_tables(task)
    summary_rows = tables.get("summary")
    stat_rows = tables.get("stats")
    if not summary_rows or not stat_rows:
        return None  # 지표 리포트가 없는 오래된 run

    date = as_date(getattr(task.data, "started", None))
    if date is None:
        return None

    # 정확도는 LFQ 파서가 도입된 이후 run 에만 존재한다.
    accuracy = build_accuracy(tables.get("lfq_ratio_statistics") or [])
    duration = getattr(task.data, "active_duration", None)
    instance = next(
        (tag.split(":", 1)[1] for tag in (task.get_tags() or []) if tag.startswith("instance:")),
        None,
    )
    summary = summary_rows[0]
    precursors = int(summary["total_precursors"])
    proteins = int(summary["total_proteins"])

    return {
        # 커밋 SHA 는 의도적으로 제외 — 비공개 저장소 정보
        "slug": date,
        "date": date,
        "instance": instance,
        "runtime_hours": round(duration / 3600, 2) if duration else None,
        "total_precursors": precursors,
        "total_precursors_display": thousands(precursors),
        "total_proteins": proteins,
        "total_proteins_display": thousands(proteins),
        "files_in_experiment": len(stat_rows),
        "has_accuracy": bool(accuracy),
        "accuracy": accuracy,
        "files": build_files(stat_rows),
    }


def write_collection(runs: list[dict]) -> None:
    """run 마다 상세 페이지 stub 을 쓰고, 더 이상 없는 stub 은 지운다."""
    COLLECTION_DIR.mkdir(parents=True, exist_ok=True)
    wanted = set()

    for run in runs:
        path = COLLECTION_DIR / f"{run['slug']}.md"
        wanted.add(path.name)
        path.write_text(
            "---\n"
            "# 이 파일은 scripts/fetch_benchmarks.py 가 생성합니다. 직접 수정하지 마세요.\n"
            "layout: benchmark_run\n"
            f"slug: \"{run['slug']}\"\n"
            f"date: {run['date']}\n"
            f"title: \"Benchmark run {run['date']}\"\n"
            "noindex: true\n"
            "sitemap: false\n"
            "---\n",
            encoding="utf-8",
        )

    for stale in COLLECTION_DIR.glob("*.md"):
        if stale.name not in wanted:
            stale.unlink()
            log(f"  제거: {stale.name}")


def main() -> None:
    args = parse_args()

    log(f"ClearML 조회: {PROJECT}  (tag: {BENCHMARK_TAG}, branch: {args.branch})")
    task_ids = Task.query_tasks(
        project_name=PROJECT,
        tags=[BENCHMARK_TAG],
        task_filter={"status": ["completed"], "order_by": ["-started"], "page": 0, "page_size": 1000},
    )
    if not task_ids:
        sys.exit("조건에 맞는 task가 없습니다. 프로젝트 이름과 태그를 확인하세요.")

    if args.limit:
        task_ids = task_ids[: args.limit]
    log(f"완료된 task {len(task_ids)}개\n")

    runs: list[dict] = []
    skipped = failed = 0

    for index, task_id in enumerate(task_ids, 1):
        try:
            run = build_run(task_id, args.branch)
        except Exception as exc:  # noqa: BLE001 — 한 건 실패로 전체를 멈추지 않는다
            log(f"  [{index}/{len(task_ids)}] {task_id}  실패: {exc}")
            failed += 1
            continue

        if run is None:
            skipped += 1
            continue
        if args.since and run["date"] < args.since:
            continue

        runs.append(run)
        mark = "정확도 O" if run["has_accuracy"] else "depth only"
        log(f"  [{index}/{len(task_ids)}] {run['date']}  {run['total_precursors_display']} precursors  ({mark})")

    runs.sort(key=lambda item: item["date"])

    # 같은 날짜에 두 건 이상이면 slug 가 충돌한다. 지금은 없지만 방어해 둔다.
    seen: dict[str, int] = {}
    for run in runs:
        seen[run["date"]] = seen.get(run["date"], 0) + 1
        if seen[run["date"]] > 1:
            run["slug"] = f"{run['date']}-{seen[run['date']]}"

    # 상세 페이지의 이전/다음 이동용. Liquid 에서 인덱스를 다루기 번거로워 미리 넣는다.
    for index, run in enumerate(runs):
        run["prev_slug"] = runs[index - 1]["slug"] if index > 0 else None
        run["next_slug"] = runs[index + 1]["slug"] if index < len(runs) - 1 else None

    previous_month = None
    for run in runs:
        month = run["date"][:7]
        run["month_label"] = MONTH_NAMES[int(run["date"][5:7])] if month != previous_month else ""
        previous_month = month

    with_accuracy = sum(1 for run in runs if run["has_accuracy"])
    log(f"\n수집 {len(runs)}개 (정확도 보유 {with_accuracy}개) / 제외 {skipped}개 / 실패 {failed}개")
    if not runs:
        sys.exit("수집된 run이 없습니다. 중단합니다.")

    latest = runs[-1]
    payload = {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "dataset": {
            "name": "LFQBench",
            "instrument": "Orbitrap Astral",
            "files": latest["files_in_experiment"],
            "conditions": ["A", "B"],
            "replicates": 3,
            "target_log2_ratios": TARGET_LOG2_RATIOS,
        },
        "filter": {"branch": args.branch, "project": PROJECT, "tag": BENCHMARK_TAG},
        "coverage": {
            "date_from": runs[0]["date"],
            "date_to": latest["date"],
            "run_count": len(runs),
            "accuracy_count": with_accuracy,
            "peak_precursors": max(run["total_precursors"] for run in runs),
            "peak_precursors_display": thousands(max(run["total_precursors"] for run in runs)),
        },
        "runs": runs,
    }

    if args.dry_run:
        log("\n--dry-run: 파일을 쓰지 않습니다. 최신 run:")
        print(json.dumps({k: v for k, v in latest.items() if k != "files"}, indent=2, ensure_ascii=False))
        return

    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    DATA_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    write_collection(runs)

    log(f"\n작성 완료: {DATA_PATH}")
    log(f"          {COLLECTION_DIR}/  ({len(runs)}개 stub)")
    log(f"  {len(runs)} runs,  {runs[0]['date']} ~ {latest['date']}")


if __name__ == "__main__":
    main()

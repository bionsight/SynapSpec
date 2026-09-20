#!/usr/bin/env python3
"""Benchmarks 페이지 데이터(site/data/benchmark_*.json)를 YAML 파일로 편집하는 도구.

지금까지는 docs/BENCHMARK_DATA_MODEL.md의 "새 recorded run을 추가하는 절차"를 매번
LLM 에이전트에게 시켜서 6개 JSON 파일을 손으로 정합성 맞춰 고쳤다. 이 스크립트는 그
절차를 "YAML 템플릿을 채우고 apply한다"로 대신한다 — 터미널 대화형 프롬프트 대신
에디터로 값을 채우고, 실수하면 그 줄만 고쳐서 다시 apply하면 된다. 채운 YAML은
scripts/benchmark_runs/ 에 남겨서 JSON과 함께 커밋한다 — "이 숫자가 어디서 왔는지"의
사람이 읽을 수 있는 기록이 된다.

사용법:
    uv run --with pyyaml python3 scripts/manage_benchmarks.py new recorded <slug>
    uv run --with pyyaml python3 scripts/manage_benchmarks.py new imported <slug>
        # scripts/benchmark_runs/<slug>.yaml 템플릿 생성. 에디터로 값을 채운다.

    uv run --with pyyaml python3 scripts/manage_benchmarks.py apply scripts/benchmark_runs/<slug>.yaml
        # 채운 YAML을 site/data/benchmark_*.json에 반영. --dry-run으로 미리보기.

    uv run --with pyyaml python3 scripts/manage_benchmarks.py validate
        # 6개 JSON 파일의 정합성 검사 (+ 축 좌표 재계산 검증)

    uv run --with pyyaml python3 scripts/manage_benchmarks.py list
        # 현재 등록된 데이터셋 프리셋 · entries · imports 조회

    uv run --with pyyaml python3 scripts/manage_benchmarks.py new meta <slug>
    uv run --with pyyaml --with pandas --with pyarrow --with numpy python3 \\
        scripts/manage_benchmarks.py from-parquet <precursors.parquet> scripts/benchmark_runs/<slug>.yaml
        # meta.yaml(파일 위치·commit 등 parquet에 없는 값만)과 precursors.parquet을 합쳐서
        # ratio_measurements/총계/파일별 표를 자동 계산한 recorded YAML을 만든다.
        # 사람이 숫자를 안 넣게 하려는 것 — 대신 만들어진 YAML을 apply 전에 검토할 것.
        # DeepMSFlow instrumentation/parsers/lfq.py 로직을 pandas로 옮긴 것이라
        # ClearML의 실제 summary/stats 리포트 표와 정확히 같은 숫자가 나온다는 보장은
        # 없다 — 처음 쓸 때는 이미 검증된 run의 parquet으로 돌려서 기존 숫자와 맞는지
        # 확인할 것.

다루는 파일:
    site/data/benchmark_catalog.json   recorded_runs 맵 + dataset_catalog 프리셋 목록
    site/data/benchmark_entries.json   slug → kind 라우팅 표
    site/data/benchmark_imports.json   imported 등급 run 목록
    site/data/benchmark_ledger.json    데이터셋별 release run 이력(선택)

다루지 않는 것 (여전히 수동):
    diagnostics / quartile_measurements — QuartileWidget·DiagnosticsWidget·
    ScatterWidget·DensityWidget이 쓰는 이미지·통계 파이프라인. release-tag-pinned
    run(예: pxd028735-v0.12.4) 몇 개에만 있고, scripts/render_*_images.py와 묶여
    있어서 이 도구가 다루기엔 범위가 다르다. recorded_runs 항목을 만든 뒤 필요하면
    그 필드는 직접 추가할 것.
    benchmark_comparisons.json / benchmark_comparison_scatter.json (kind: comparison) —
    지금 2건뿐이고 갱신 빈도가 낮아 범위에서 뺐다.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:
    sys.exit("pyyaml이 필요합니다.  uv run --with pyyaml python3 scripts/manage_benchmarks.py ...")

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "site" / "data"
CATALOG_PATH = DATA_DIR / "benchmark_catalog.json"
ENTRIES_PATH = DATA_DIR / "benchmark_entries.json"
IMPORTS_PATH = DATA_DIR / "benchmark_imports.json"
LEDGER_PATH = DATA_DIR / "benchmark_ledger.json"
COMPARISONS_PATH = DATA_DIR / "benchmark_comparisons.json"
BENCHMARKS_PATH = DATA_DIR / "benchmarks.json"
FIGURES_DIR = ROOT / "site" / "public" / "assets" / "images" / "benchmarks"
RUNS_DIR = ROOT / "scripts" / "benchmark_runs"


# ---------------------------------------------------------------------------
# 공용 유틸
# ---------------------------------------------------------------------------


def load_json(path: Path) -> Any:
    if not path.exists():
        sys.exit(f"파일이 없습니다: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def thousands(value: int) -> str:
    return f"{value:,}"


def today_iso() -> str:
    return datetime.now().strftime("%Y-%m-%d")


def today_display() -> str:
    return datetime.now().strftime("%-d %B %Y")


def require(data: dict, *path: str) -> Any:
    """중첩 dict에서 path를 따라가며 값을 꺼낸다. 없거나 None이면 에러."""
    node = data
    for key in path:
        if not isinstance(node, dict) or key not in node or node[key] is None:
            sys.exit(f"YAML에 '{'.'.join(path)}' 값이 없습니다.")
        node = node[key]
    return node


def optional(data: dict, *path: str, default: Any = None) -> Any:
    node = data
    for key in path:
        if not isinstance(node, dict) or key not in node:
            return default
        node = node[key]
    return node if node is not None else default


# ---------------------------------------------------------------------------
# 비율 위젯 축 좌표 계산 — docs/BENCHMARK_DATA_MODEL.md "고정 축" 절 공식 그대로.
# validate 커맨드가 저장된 값을 재계산해 검증할 때도 이 함수들을 재사용한다.
# ---------------------------------------------------------------------------


def actual_x(log2_value: float) -> float:
    return round(24 + (log2_value + 2.5) * 113, 3)


def relative_x(log2_value: float, target: float) -> float:
    return round(24 + ((log2_value - target) + 0.5) * 452, 3)


def build_ratio_measurement(label: str, target: float, count: int, median: float, lower: float, upper: float) -> dict:
    target, median, lower, upper = float(target), float(median), float(lower), float(upper)
    count = int(count)
    measured_ratio = 2**median
    deviation_percent = round((2 ** (median - target) - 1) * 100, 1)
    return {
        "species": label,
        "count": count,
        "count_display": thousands(count),
        "target": target,
        "median": round(median, 10),
        "lower": round(lower, 10),
        "upper": round(upper, 10),
        "measured_ratio_display": f"{measured_ratio:.3f}×",
        "deviation_percent": deviation_percent,
        "axis": {
            "actual": {
                "target": actual_x(target),
                "median": actual_x(median),
                "lower": actual_x(lower),
                "upper": actual_x(upper),
            },
            "relative": {
                "target": relative_x(target, target),
                "median": relative_x(median, target),
                "lower": relative_x(lower, target),
                "upper": relative_x(upper, target),
            },
        },
    }


def runtime_display(hours: float) -> str:
    total_minutes = round(float(hours) * 60)
    h, m = divmod(total_minutes, 60)
    return f"{h} h {m} min"


# ---------------------------------------------------------------------------
# new — YAML 템플릿 생성
# ---------------------------------------------------------------------------

RECORDED_TEMPLATE = """\
kind: recorded

# 데이터셋 프리셋. `python3 scripts/manage_benchmarks.py list`로 기존 프리셋과 slug를
# 확인하세요. 기존 프리셋에 새 run을 붙이려면 dataset.slug를 그 프리셋 slug와 똑같이
# 쓰면 됩니다(name/instrument/preset/key_config는 무시되고 기존 값을 그대로 씁니다).
# 새 프리셋을 만들려면 새로운 slug를 쓰고 name/instrument/preset을 채우세요.
dataset:
  slug: "{slug}"
  name: "LFQBench"
  instrument: "OE480"
  preset: "bion_lfq_oe480"                 # DeepMSFlow LFQ_BENCHMARK_PRESETS 키
  key_config: "MBR on · Trypsin/P · 2 missed cleavages"   # 카드 요약 문구, 없으면 지우기

# 이 run 자체의 정보. run.slug가 recorded_runs의 키 & URL(/benchmarks/<slug>/)이 됩니다.
# 단일 카드형 데이터셋(dataset_catalog에 카드가 하나뿐)이면 dataset.slug와 같게 써도 됩니다.
run:
  slug: "{slug}"
  commit: "TODO"                            # git 짧은 SHA, 예: fcaf6278
  date: "{date}"
  instance: "c7i.8xlarge"
  runtime_hours: 0.0                        # 예: 4.2125
  total_precursors: 0                       # summary 표의 total_precursors
  total_proteins: 0                         # summary 표의 total_proteins
  config_file: null                         # 예: bion_lfq_oe480.yaml (선택)
  fasta: null                               # 예: napedro_3mixed_human_yeast_ecoli.fasta (선택)
  time_range_display: null                  # 예: "05:44–09:57 UTC" (선택)
  checked_display: "{checked_display}"      # Source record "checked on ..." 문구
  source_url: null                          # PRIDE 등 소스 링크 (선택)

# stats 표의 파일별 지표. 없으면 빈 리스트로 둘 수 있지만 페이지 표가 비게 됩니다.
files:
  - name: "TODO_Condition_A_R1"
    condition: "A"
    replicate: 1
    precursors: 0
    proteins: 0
  - name: "TODO_Condition_A_R2"
    condition: "A"
    replicate: 2
    precursors: 0
    proteins: 0
  - name: "TODO_Condition_B_R1"
    condition: "B"
    replicate: 1
    precursors: 0
    proteins: 0
  - name: "TODO_Condition_B_R2"
    condition: "B"
    replicate: 2
    precursors: 0
    proteins: 0

# species별 LFQ 정확도. lfq_ratio_statistics 표(species, median, target, 25%, 75%, count)에서
# 그대로 옮기면 됩니다 — measured_ratio_display/deviation_percent/axis 좌표는 apply가 계산합니다.
# 없는 species는 이 리스트에서 지우세요. target은 정답 log2(A/B) 비율(HUMAN 0, ECOLI -2, YEAS8 1)입니다.
ratio_measurements:
  - species: "Human"
    target: 0.0
    count: 0
    median: 0.0
    lower: 0.0
    upper: 0.0
  - species: "Yeast"
    target: 1.0
    count: 0
    median: 0.0
    lower: 0.0
    upper: 0.0
  - species: "E. coli"
    target: -2.0
    count: 0
    median: 0.0
    lower: 0.0
    upper: 0.0

# Run configuration 표에 그대로 뿌려지는 [라벨, 값] 쌍. 필요 없는 줄은 지우세요.
recorded_config:
  - ["Library", "Generated from FASTA"]
  - ["Enzyme", "Trypsin/P"]
  - ["Missed cleavages", "2"]
  - ["Match between runs", "On"]
  - ["Peptide length", "7–52 residues"]
  - ["Precursor charge", "1–6"]
  - ["Maximum variable modifications", "5"]
  - ["Random seed", "42"]

# Run history(release 비교) 표에도 행을 추가하려면 주석을 풀고 채우세요.
# group_id는 benchmark_ledger.json 최상위 항목의 id (`list`로 확인).
# ledger:
#   group_id: "lfqbench-202409-archived"
#   label: "SynapSpec run · PXD028735 raw files"
#   diann_precursors: null
#   spectronaut_precursors: null
#   release_version: null
"""

IMPORTED_TEMPLATE = """\
kind: imported

slug: "{slug}"
commit: "TODO"                    # git 짧은 SHA
task_id: null                     # ClearML Task ID (선택)
artifact_id: null                 # Artifact 라벨 (선택)
started: null                     # "YYYY-MM-DD HH:MM" — started/completed 둘 다 있으면
completed: null                   # runtime_minutes를 자동 계산합니다.
runtime_minutes: null             # started/completed가 없으면 직접 채우세요.
total_precursors: 0
total_proteins: 0
status: "Completed"
resource: "c7i.8xlarge"
dataset_subtitle: null            # 예: "OE480". Astral이면 비워두기(null).
figure: null                      # site/public/assets/images/benchmarks/<파일명>. 먼저 그 경로에 올려둘 것.
title: null                       # benchmark_entries.json 제목. 비우면 "Benchmark run {slug}".
files: []                         # 원본 raw 파일명 목록
"""

META_TEMPLATE = """\
kind: recorded

# 이건 meta.yaml(사이드카)입니다 — files/ratio_measurements/total_precursors/total_proteins는
# `from-parquet`이 precursors.parquet에서 직접 계산해서 채웁니다. 여기엔 parquet에
# 없는 값(실행 환경·메타데이터)만 채우세요.

dataset:
  slug: "{slug}"
  name: "LFQBench"
  instrument: "OE480"
  preset: "bion_lfq_oe480"          # LFQ_BENCHMARK_PRESETS 키 — from-parquet이 이 값으로 species target ratio를 고른다
  key_config: "MBR on · Trypsin/P · 2 missed cleavages"

run:
  slug: "{slug}"
  commit: "TODO"
  date: "{date}"
  instance: "c7i.8xlarge"
  runtime_hours: 0.0
  config_file: null
  fasta: null
  time_range_display: null
  checked_display: "{checked_display}"
  source_url: null

recorded_config:
  - ["Library", "Generated from FASTA"]
  - ["Enzyme", "Trypsin/P"]
  - ["Missed cleavages", "2"]
  - ["Match between runs", "On"]
  - ["Peptide length", "7–52 residues"]
  - ["Precursor charge", "1–6"]
  - ["Maximum variable modifications", "5"]
  - ["Random seed", "42"]

# ledger:
#   group_id: "lfqbench-202409-archived"
#   label: "SynapSpec run · ... raw files"
#   diann_precursors: null
#   spectronaut_precursors: null
#   release_version: null
"""

TEMPLATE_KIND_CHOICES = ("recorded", "imported", "meta")


def cmd_new(args: argparse.Namespace) -> None:
    RUNS_DIR.mkdir(parents=True, exist_ok=True)
    path = RUNS_DIR / f"{args.slug}.yaml"
    if path.exists() and not args.force:
        sys.exit(f"이미 있습니다: {path.relative_to(ROOT)} (덮어쓰려면 --force)")

    if args.template_kind == "recorded":
        content = RECORDED_TEMPLATE.format(slug=args.slug, date=today_iso(), checked_display=today_display())
    elif args.template_kind == "meta":
        content = META_TEMPLATE.format(slug=args.slug, date=today_iso(), checked_display=today_display())
    else:
        content = IMPORTED_TEMPLATE.format(slug=args.slug)

    path.write_text(content, encoding="utf-8")
    print(f"템플릿 생성: {path.relative_to(ROOT)}")
    print("값을 채운 뒤:")
    print(f"  uv run --with pyyaml python3 scripts/manage_benchmarks.py apply {path.relative_to(ROOT)} --dry-run")
    print(f"  uv run --with pyyaml python3 scripts/manage_benchmarks.py apply {path.relative_to(ROOT)}")


# ---------------------------------------------------------------------------
# apply — recorded
# ---------------------------------------------------------------------------


def apply_recorded(data: dict, source: Path, dry_run: bool) -> None:
    catalog = load_json(CATALOG_PATH)
    entries = load_json(ENTRIES_PATH)
    dataset_catalog: list[dict] = catalog["dataset_catalog"]
    recorded_runs: dict = catalog["recorded_runs"]

    ds_slug = require(data, "dataset", "slug")
    run_slug = require(data, "run", "slug")
    commit = require(data, "run", "commit")
    date = require(data, "run", "date")
    instance = require(data, "run", "instance")
    hours = float(require(data, "run", "runtime_hours"))
    total_precursors = int(require(data, "run", "total_precursors"))
    total_proteins = int(require(data, "run", "total_proteins"))

    ds_entry = next((d for d in dataset_catalog if d["slug"] == ds_slug), None)
    if ds_entry is None:
        ds_entry = {
            "slug": ds_slug,
            "name": require(data, "dataset", "name"),
            "instrument": require(data, "dataset", "instrument"),
            "preset": require(data, "dataset", "preset"),
            "has_run": False,
            "run_slug": None,
            "commit": None,
            "key_config": optional(data, "dataset", "key_config"),
        }
        dataset_catalog.append(ds_entry)
        print(f"  새 프리셋 생성: dataset_catalog['{ds_slug}']")
    else:
        print(f"  기존 프리셋 사용: dataset_catalog['{ds_slug}'] ({ds_entry['name']} / {ds_entry['instrument']})")
    title = ds_entry["name"]
    instrument = ds_entry["instrument"]

    files = []
    for f in data.get("files") or []:
        if "name" not in f or "precursors" not in f or "proteins" not in f:
            sys.exit(f"files 항목에 name/precursors/proteins가 모두 있어야 합니다: {f!r}")
        precursors = int(f["precursors"])
        proteins = int(f["proteins"])
        files.append(
            {
                "name": f["name"],
                "condition": f.get("condition"),
                "replicate": f.get("replicate"),
                "precursors": precursors,
                "proteins": proteins,
                "precursors_display": thousands(precursors),
                "proteins_display": thousands(proteins),
            }
        )
    if not files:
        print("  경고: files가 비어 있습니다. files_in_experiment가 0이 됩니다.")

    ratio_measurements = []
    for m in data.get("ratio_measurements") or []:
        ratio_measurements.append(
            build_ratio_measurement(m["species"], m["target"], m["count"], m["median"], m["lower"], m["upper"])
        )

    recorded_config = [[str(label), str(value)] for label, value in (data.get("recorded_config") or [])]

    recorded_run = {
        "slug": run_slug,
        "date": date,
        "instance": instance,
        "runtime_hours": hours,
        "runtime_display": runtime_display(hours),
        "total_precursors": total_precursors,
        "total_precursors_display": thousands(total_precursors),
        "total_proteins": total_proteins,
        "total_proteins_display": thousands(total_proteins),
        "files_in_experiment": len(files),
        "files": files,
    }

    catalog_entry = {
        "run_slug": run_slug,
        "title": title,
        "instrument": instrument,
        "commit": commit,
        "config_file": optional(data, "run", "config_file"),
        "fasta": optional(data, "run", "fasta"),
        "time_range_display": optional(data, "run", "time_range_display"),
        "checked_display": optional(data, "run", "checked_display"),
        "recorded_run": recorded_run,
        "ratio_measurements": ratio_measurements,
        "recorded_config": recorded_config,
    }
    source_url = optional(data, "run", "source_url")
    if source_url:
        catalog_entry["source_url"] = source_url

    ds_entry["has_run"] = True
    ds_entry["run_slug"] = run_slug
    ds_entry["commit"] = commit

    is_update = run_slug in recorded_runs
    recorded_runs[run_slug] = catalog_entry

    entry_title = f"{title} / {instrument}"
    matched_entry = next((e for e in entries if e["slug"] == run_slug), None)
    if matched_entry:
        matched_entry["kind"] = "recorded"
        matched_entry["title"] = entry_title
    else:
        entries.append({"kind": "recorded", "slug": run_slug, "title": entry_title})

    summary = [
        f"{'갱신' if is_update else '신규'}: benchmark_catalog.json → recorded_runs['{run_slug}']",
        f"benchmark_catalog.json → dataset_catalog['{ds_slug}'] (has_run/run_slug/commit 갱신)",
        f"benchmark_entries.json → {'갱신' if matched_entry else '추가'} ({{kind: recorded, slug: {run_slug}}})",
    ]

    ledger = None
    ledger_block = data.get("ledger")
    if ledger_block:
        ledger = load_json(LEDGER_PATH)
        group_id = require(ledger_block, "group_id")
        group = next((g for g in ledger if g["id"] == group_id), None)
        if group is None:
            sys.exit(f"ledger.group_id '{group_id}'가 benchmark_ledger.json에 없습니다.")
        diann = ledger_block.get("diann_precursors")
        spectronaut = ledger_block.get("spectronaut_precursors")
        row = {
            "id": run_slug,
            "date": date,
            "label": ledger_block.get("label") or f"SynapSpec run · {title} raw files",
            "sourceSlug": run_slug,
            "comparisonSlug": None,
            "counts": [total_precursors, diann, spectronaut],
            "counts_display": [
                thousands(total_precursors),
                thousands(diann) if diann is not None else None,
                thousands(spectronaut) if spectronaut is not None else None,
            ],
            "runtime": hours,
            "resource": instance,
            "commit": commit,
        }
        release_version = ledger_block.get("release_version")
        if release_version:
            row["release_version"] = release_version
        group["rows"].insert(0, row)
        summary.append(f"benchmark_ledger.json → '{group_id}'.rows 맨 앞에 '{run_slug}' 행 추가")

    print("\n--- 변경 요약 ---")
    for line in summary:
        print(f"  {line}")

    if dry_run:
        print("\n--dry-run: 파일을 쓰지 않습니다.")
        return

    save_json(CATALOG_PATH, catalog)
    save_json(ENTRIES_PATH, entries)
    written = [CATALOG_PATH, ENTRIES_PATH]
    if ledger is not None:
        save_json(LEDGER_PATH, ledger)
        written.append(LEDGER_PATH)
    print("\n저장 완료: " + ", ".join(str(p.relative_to(ROOT)) for p in written))
    print(f"\n다음: npm run check && npm run build 로 검증하고, /benchmarks/{run_slug}/ 페이지를 브라우저로 직접 열어")
    print("비율 위젯이 잘리지 않는지 확인하세요. 이 YAML도 함께 커밋해 두면 값의 출처가 남습니다:")
    print(f"  git add {source.relative_to(ROOT)} site/data/benchmark_catalog.json site/data/benchmark_entries.json")


# ---------------------------------------------------------------------------
# apply — imported
# ---------------------------------------------------------------------------


def apply_imported(data: dict, source: Path, dry_run: bool) -> None:
    imports: list[dict] = load_json(IMPORTS_PATH)
    entries: list[dict] = load_json(ENTRIES_PATH)

    slug = require(data, "slug")
    commit = require(data, "commit")
    total_precursors = int(require(data, "total_precursors"))
    total_proteins = int(require(data, "total_proteins"))

    started = data.get("started")
    completed = data.get("completed")
    runtime_minutes = data.get("runtime_minutes")
    if runtime_minutes is None and started and completed:
        try:
            t0 = datetime.strptime(started, "%Y-%m-%d %H:%M")
            t1 = datetime.strptime(completed, "%Y-%m-%d %H:%M")
            runtime_minutes = round((t1 - t0).total_seconds() / 60)
            print(f"  실행 시간 자동 계산: {runtime_minutes}분")
        except ValueError:
            sys.exit("started/completed 형식을 못 읽었습니다 (\"YYYY-MM-DD HH:MM\").")
    if runtime_minutes is None:
        sys.exit("runtime_minutes가 없고 started/completed로도 계산할 수 없습니다.")

    figure = data.get("figure")
    if figure and not (FIGURES_DIR / figure).exists():
        print(f"  경고: {FIGURES_DIR / figure} 파일이 없습니다. 이미지를 먼저 그 경로에 올려두세요.")

    record = {
        "slug": slug,
        "commit": commit,
        "taskId": data.get("task_id"),
        "artifactId": data.get("artifact_id"),
        "started": started,
        "completed": completed,
        "runtimeMinutes": int(runtime_minutes),
        "totalPrecursors": total_precursors,
        "totalPrecursorsDisplay": thousands(total_precursors),
        "totalProteins": total_proteins,
        "totalProteinsDisplay": thousands(total_proteins),
        "status": data.get("status") or "Completed",
        "resource": data.get("resource"),
        "figure": figure,
        "files": list(data.get("files") or []),
    }
    dataset_subtitle = data.get("dataset_subtitle")
    if dataset_subtitle:
        record["datasetSubtitle"] = dataset_subtitle

    is_update = any(r["slug"] == slug for r in imports)
    if is_update:
        imports[:] = [record if r["slug"] == slug else r for r in imports]
    else:
        imports.insert(0, record)

    entry_title = data.get("title") or f"Benchmark run {slug}"
    matched_entry = next((e for e in entries if e["slug"] == slug), None)
    if matched_entry:
        matched_entry["kind"] = "imported"
        matched_entry["title"] = entry_title
    else:
        entries.append({"kind": "imported", "slug": slug, "title": entry_title})

    summary = [
        f"{'갱신' if is_update else '신규'}: benchmark_imports.json → '{slug}'",
        f"benchmark_entries.json → {'갱신' if matched_entry else '추가'} ({{kind: imported, slug: {slug}}})",
    ]
    print("\n--- 변경 요약 ---")
    for line in summary:
        print(f"  {line}")

    if dry_run:
        print("\n--dry-run: 파일을 쓰지 않습니다.")
        return

    save_json(IMPORTS_PATH, imports)
    save_json(ENTRIES_PATH, entries)
    print(f"\n저장 완료: {IMPORTS_PATH.relative_to(ROOT)}, {ENTRIES_PATH.relative_to(ROOT)}")
    print(f"이 YAML도 함께 커밋해 두면 값의 출처가 남습니다: git add {source.relative_to(ROOT)}")


def cmd_apply(args: argparse.Namespace) -> None:
    path = Path(args.file).resolve()
    if not path.exists():
        sys.exit(f"파일이 없습니다: {path}")
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        sys.exit(f"{path}가 올바른 YAML 매핑이 아닙니다.")

    kind = data.get("kind")
    if kind == "recorded":
        apply_recorded(data, path, args.dry_run)
    elif kind == "imported":
        apply_imported(data, path, args.dry_run)
    else:
        sys.exit(f"YAML 최상위 'kind'가 'recorded' 또는 'imported'여야 합니다 (지금: {kind!r}).")


# ---------------------------------------------------------------------------
# from-parquet — precursors.parquet에서 ratio_measurements/총계/파일별 표 계산
#
# DeepMSFlow instrumentation/parsers/lfq.py의 prepare_lfq_dataframe /
# get_lfq_quantification / get_lfq_ratio_statistics를 pandas만으로 다시 구현한 것.
# 저쪽이 바뀌면 여기도 맞춰야 한다 — TARGET_LOG2_RATIOS와 같은 "이중 관리" 문제.
# ClearML의 실제 summary/stats 리포트 표와 정확히 같은 숫자가 나온다는 보장은 없다.
# pandas/pyarrow/numpy가 필요하다 (uv run --with pandas --with pyarrow --with numpy).
# ---------------------------------------------------------------------------

# DeepMSFlow instrumentation/parsers/lfq_constants.py의 LFQ_BENCHMARK_PRESETS와 일치해야 한다.
LFQ_BENCHMARK_PRESETS = {
    "bion_lfq_astral": {"HUMAN": 0.0, "ECOLI": -2.0, "YEAS8": 1.0},
    "bion_lfq_oe480": {"HUMAN": 0.0, "ECOLI": -2.0, "YEAS8": 1.0},
    "proteobench_2th_astral": {"HUMAN": 0.0, "ECOLI": -2.0, "YEAST": 1.0},
}
SPECIES_LABELS = {"HUMAN": "Human", "YEAS8": "Yeast", "YEAST": "Yeast", "ECOLI": "E. coli"}
LFQ_REQUIRED_COLUMNS = {"filename", "protein_names", "protein_accessions", "modified_sequence", "precursor_charge"}


def _extract_species(protein_names: object) -> str | None:
    if not isinstance(protein_names, str) or not protein_names.strip():
        return None
    species = {name.rsplit("_", 1)[-1] for name in protein_names.split(";") if name.strip()}
    species.discard("")
    return ";".join(sorted(species)) if species else None


def _extract_condition(filename: object) -> str | None:
    if not isinstance(filename, str) or not filename.strip():
        return None
    stem = Path(filename.replace("\\", "/")).stem
    parts = stem.split("_")
    for i, part in enumerate(parts[:-1]):
        if part.lower() == "condition" and parts[i + 1] in {"A", "B"}:
            return parts[i + 1]
    for part in reversed(parts):
        if part in {"A", "B"}:
            return part
    match = re.search(r"(?:^|_)([AB])(?:_|$)", stem)
    return match.group(1) if match else None


def parse_precursors_parquet(parquet_path: Path, preset_key: str) -> dict:
    """precursors.parquet에서 총계·파일별 표·species별 ratio_measurements를 계산한다."""
    try:
        import numpy as np
        import pandas as pd
    except ImportError:
        sys.exit("pandas/pyarrow/numpy가 필요합니다.  uv run --with pandas --with pyarrow --with numpy ...")

    if preset_key not in LFQ_BENCHMARK_PRESETS:
        sys.exit(f"모르는 preset '{preset_key}'. 알려진 값: {sorted(LFQ_BENCHMARK_PRESETS)}")
    target_log2_ratios = LFQ_BENCHMARK_PRESETS[preset_key]

    df = pd.read_parquet(parquet_path)
    missing = LFQ_REQUIRED_COLUMNS - set(df.columns)
    if missing:
        sys.exit(f"parquet에 필요한 컬럼이 없습니다: {sorted(missing)}")

    base = df.dropna(subset=["protein_names"]).copy()
    if "precursor_qvalue" in base.columns:
        base = base[base["precursor_qvalue"] < 0.01]
    protein_col = "protein_group" if "protein_group" in base.columns else "protein_accessions"
    charges = base["precursor_charge"].astype("Int64").astype(str)
    base["_precursor_key"] = base["modified_sequence"].astype(str) + "_" + charges
    if "condition" in base.columns:
        base["_condition"] = base["condition"].astype("string").str.strip()
    else:
        base["_condition"] = base["filename"].apply(_extract_condition)

    total_precursors = int(base["_precursor_key"].nunique())
    total_proteins = int(base[protein_col].nunique())

    per_file = (
        base.groupby("filename")
        .agg(precursors=("_precursor_key", "nunique"), proteins=(protein_col, "nunique"), condition=("_condition", "first"))
        .reset_index()
        .sort_values("filename")
    )
    files = [
        {
            "name": row.filename,
            "condition": row.condition,
            "replicate": None,  # parquet만으로는 신뢰성 있게 못 뽑음 — 필요하면 검토 시 채울 것
            "precursors": int(row.precursors),
            "proteins": int(row.proteins),
        }
        for row in per_file.itertuples()
    ]

    species_df = base.assign(species=base["protein_names"].apply(_extract_species))
    multi_species = species_df["species"].fillna("").str.contains(";", regex=False)
    species_df = species_df[~multi_species & species_df["species"].isin(target_log2_ratios)]
    species_df = species_df[species_df["_condition"].isin(["A", "B"])]

    ratio_measurements = []
    warnings: list[str] = []
    if "ms2_quantity" not in species_df.columns:
        warnings.append("ms2_quantity 컬럼이 없어 ratio_measurements를 계산할 수 없습니다.")
    else:
        for species, target in target_log2_ratios.items():
            sub = species_df[species_df["species"] == species]
            if not sub["_condition"].eq("A").any() or not sub["_condition"].eq("B").any():
                warnings.append(f"{species}: A/B 양쪽 조건이 다 있지 않아 건너뜀")
                continue
            entity_run = sub.drop_duplicates(subset=["_precursor_key", "filename"])
            grouped = entity_run.groupby(["_condition", "_precursor_key"])[["ms2_quantity"]].mean()
            wide = grouped.unstack(level=0)
            wide.columns = wide.columns.droplevel(0)
            if "A" not in wide.columns or "B" not in wide.columns:
                warnings.append(f"{species}: 짝지어진 A/B 측정값이 없어 건너뜀")
                continue
            wide = wide[(wide["A"] > 0) & (wide["B"] > 0)]
            log2_ratio = np.log2(wide["A"] / wide["B"]).replace([np.inf, -np.inf], np.nan).dropna()
            if log2_ratio.empty:
                warnings.append(f"{species}: 유효한 log2 ratio가 없어 건너뜀")
                continue
            ratio_measurements.append(
                build_ratio_measurement(
                    SPECIES_LABELS.get(species, species),
                    target,
                    int(log2_ratio.count()),
                    float(log2_ratio.median()),
                    float(log2_ratio.quantile(0.25)),
                    float(log2_ratio.quantile(0.75)),
                )
            )

    return {
        "total_precursors": total_precursors,
        "total_proteins": total_proteins,
        "files": files,
        "ratio_measurements": ratio_measurements,
        "warnings": warnings,
    }


def cmd_from_parquet(args: argparse.Namespace) -> None:
    meta_path = Path(args.meta).resolve()
    if not meta_path.exists():
        sys.exit(f"파일이 없습니다: {meta_path}")
    meta = yaml.safe_load(meta_path.read_text(encoding="utf-8"))
    if not isinstance(meta, dict) or meta.get("kind") != "recorded":
        sys.exit("meta.yaml의 최상위 'kind'는 'recorded'여야 합니다.")

    preset_key = require(meta, "dataset", "preset")
    run_slug = require(meta, "run", "slug")

    computed = parse_precursors_parquet(Path(args.parquet).resolve(), preset_key)
    for w in computed["warnings"]:
        print(f"  경고: {w}")

    merged = dict(meta)
    merged["run"] = dict(meta["run"])
    merged["run"]["total_precursors"] = computed["total_precursors"]
    merged["run"]["total_proteins"] = computed["total_proteins"]
    merged["files"] = computed["files"]
    merged["ratio_measurements"] = [
        {
            "species": m["species"],
            "target": m["target"],
            "count": m["count"],
            "median": m["median"],
            "lower": m["lower"],
            "upper": m["upper"],
        }
        for m in computed["ratio_measurements"]
    ]

    out_path = Path(args.out).resolve() if args.out else RUNS_DIR / f"{run_slug}.yaml"
    if out_path.exists() and not args.force:
        sys.exit(f"이미 있습니다: {out_path} (덮어쓰려면 --force)")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(yaml.safe_dump(merged, allow_unicode=True, sort_keys=False), encoding="utf-8")

    print(
        f"\n계산 결과: precursors={computed['total_precursors']:,}  proteins={computed['total_proteins']:,}"
        f"  파일 {len(computed['files'])}개  species {len(computed['ratio_measurements'])}개"
    )
    print(f"생성: {out_path.relative_to(ROOT) if out_path.is_relative_to(ROOT) else out_path}")
    print("값을 검토한 뒤(특히 files의 replicate는 비어 있음):")
    print(f"  python3 scripts/manage_benchmarks.py apply {out_path} --dry-run")


# ---------------------------------------------------------------------------
# validate
# ---------------------------------------------------------------------------


def cmd_validate(args: argparse.Namespace) -> None:
    catalog = load_json(CATALOG_PATH)
    entries = load_json(ENTRIES_PATH)
    imports = load_json(IMPORTS_PATH)
    ledger = load_json(LEDGER_PATH)
    comparisons = load_json(COMPARISONS_PATH)
    benchmarks = load_json(BENCHMARKS_PATH)

    errors: list[str] = []
    warnings: list[str] = []

    entry_slugs = [e["slug"] for e in entries]
    run_slugs = [r["slug"] for r in benchmarks["runs"]]

    # 1. slug 중복 — entries 내부, entries와 benchmarks.json 사이
    dup_entries = {s for s in entry_slugs if entry_slugs.count(s) > 1}
    for s in dup_entries:
        errors.append(f"benchmark_entries.json에 slug '{s}'가 중복 등록됨")
    overlap = set(entry_slugs) & set(run_slugs)
    for s in overlap:
        errors.append(f"slug '{s}'가 benchmark_entries.json과 benchmarks.json 양쪽에 있음 (겹치면 안 됨)")

    # 2. kind별 참조 무결성
    recorded_runs = catalog["recorded_runs"]
    for e in entries:
        if e["kind"] == "recorded" and e["slug"] not in recorded_runs:
            errors.append(f"entries의 recorded slug '{e['slug']}'가 benchmark_catalog.json.recorded_runs에 없음")
        if e["kind"] == "imported" and not any(r["slug"] == e["slug"] for r in imports):
            errors.append(f"entries의 imported slug '{e['slug']}'가 benchmark_imports.json에 없음")
        if e["kind"] == "comparison" and not any(c["slug"] == e["slug"] for c in comparisons):
            errors.append(f"entries의 comparison slug '{e['slug']}'가 benchmark_comparisons.json에 없음")

    for slug in recorded_runs:
        if not any(e["slug"] == slug and e["kind"] == "recorded" for e in entries):
            warnings.append(f"recorded_runs['{slug}']를 가리키는 recorded entries 항목이 없음 (고아 데이터)")
    for r in imports:
        if not any(e["slug"] == r["slug"] and e["kind"] == "imported" for e in entries):
            warnings.append(f"benchmark_imports.json의 '{r['slug']}'를 가리키는 imported entries 항목이 없음 (고아 데이터)")

    # 3. dataset_catalog → recorded_runs 링크
    for ds in catalog["dataset_catalog"]:
        if ds.get("has_run") and ds.get("run_slug") not in recorded_runs:
            errors.append(f"dataset_catalog['{ds['slug']}'].run_slug='{ds.get('run_slug')}'가 recorded_runs에 없음")

    # 4. recorded_run 내부 정합성 + 비율 축 좌표 재계산 검증
    for slug, entry in recorded_runs.items():
        run = entry.get("recorded_run", {})
        files = run.get("files", [])
        if run.get("files_in_experiment") != len(files):
            errors.append(f"recorded_runs['{slug}'].recorded_run.files_in_experiment={run.get('files_in_experiment')}가 실제 files 개수({len(files)})와 다름")
        for field in ("total_precursors", "total_proteins"):
            value = run.get(field)
            display = run.get(f"{field}_display")
            if value is not None and display != thousands(value):
                errors.append(f"recorded_runs['{slug}'].recorded_run.{field}_display='{display}'가 {thousands(value)}와 불일치")

        for m in entry.get("ratio_measurements", []):
            recomputed = build_ratio_measurement(m["species"], m["target"], m["count"], m["median"], m["lower"], m["upper"])
            if recomputed["axis"] != m.get("axis"):
                errors.append(f"recorded_runs['{slug}'] species '{m['species']}'의 axis 좌표가 median/lower/upper로 재계산한 값과 다름 (손으로 고쳤을 가능성)")
            if recomputed["measured_ratio_display"] != m.get("measured_ratio_display"):
                warnings.append(f"recorded_runs['{slug}'] species '{m['species']}'의 measured_ratio_display가 재계산 값({recomputed['measured_ratio_display']})과 다름")
            actual_range = (-2.5, 1.5)
            for key in ("target", "median", "lower", "upper"):
                v = m[key]
                if not (actual_range[0] <= v <= actual_range[1]):
                    warnings.append(f"recorded_runs['{slug}'] species '{m['species']}'.{key}={v}가 actual 축 고정 범위 {actual_range}를 벗어남 — RatioWidget에서 잘릴 수 있음")

    # 5. ledger — 두 그룹 가정(사이트가 [oe480, astral] = ledgers로 위치 구조분해)
    if len(ledger) != 2:
        warnings.append(f"benchmark_ledger.json 그룹이 {len(ledger)}개 — benchmarks/index.astro는 정확히 2개([oe480, astral])를 가정하고 위치로 구조분해함")
    known_slugs = set(entry_slugs) | set(run_slugs)
    for group in ledger:
        for row in group["rows"]:
            if row.get("sourceSlug") and row["sourceSlug"] not in known_slugs:
                warnings.append(f"benchmark_ledger.json['{group['id']}'] 행 '{row['id']}'의 sourceSlug='{row['sourceSlug']}'가 어떤 recorded/imported/run slug와도 안 맞음")

    print(f"검사 완료 — 오류 {len(errors)}건, 경고 {len(warnings)}건\n")
    for e in errors:
        print(f"  [오류] {e}")
    for w in warnings:
        print(f"  [경고] {w}")
    if not errors and not warnings:
        print("  문제 없음.")

    if errors:
        sys.exit(1)


# ---------------------------------------------------------------------------
# list
# ---------------------------------------------------------------------------


def cmd_list(args: argparse.Namespace) -> None:
    catalog = load_json(CATALOG_PATH)
    entries = load_json(ENTRIES_PATH)
    imports = load_json(IMPORTS_PATH)

    print("=== dataset_catalog 프리셋 ===")
    for ds in catalog["dataset_catalog"]:
        print(f"  {ds['slug']:<28} {ds['name']} / {ds['instrument']}  최근 run={ds.get('run_slug')}  commit={ds.get('commit')}")

    print("\n=== benchmark_entries.json (kind별) ===")
    by_kind: dict[str, list[dict]] = {}
    for e in entries:
        by_kind.setdefault(e["kind"], []).append(e)
    for kind in ("recorded", "imported", "comparison", "pending"):
        rows = by_kind.get(kind, [])
        if not rows:
            continue
        print(f"  [{kind}] {len(rows)}건")
        for e in rows:
            print(f"    {e['slug']:<28} {e['title']}")

    print(f"\n=== benchmark_imports.json ({len(imports)}건) ===")
    for r in imports:
        print(f"  {r['slug']:<28} {r['totalPrecursorsDisplay']} precursors  commit={r['commit']}")


# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)

    p_new = sub.add_parser("new", help="YAML 템플릿 생성")
    p_new.add_argument("template_kind", choices=list(TEMPLATE_KIND_CHOICES))
    p_new.add_argument("slug", help="scripts/benchmark_runs/<slug>.yaml로 생성")
    p_new.add_argument("--force", action="store_true", help="이미 있으면 덮어쓰기")
    p_new.set_defaults(func=cmd_new)

    p_apply = sub.add_parser("apply", help="채운 YAML을 JSON 파일에 반영")
    p_apply.add_argument("file", help="scripts/benchmark_runs/<slug>.yaml 경로")
    p_apply.add_argument("--dry-run", action="store_true", help="파일을 쓰지 않고 요약만 출력")
    p_apply.set_defaults(func=cmd_apply)

    p_from_parquet = sub.add_parser(
        "from-parquet", help="precursors.parquet + meta.yaml → ratio_measurements/총계가 채워진 recorded YAML 생성"
    )
    p_from_parquet.add_argument("parquet", help="precursors.parquet 경로")
    p_from_parquet.add_argument("meta", help="new meta로 만든 사이드카 YAML 경로")
    p_from_parquet.add_argument("--out", help="출력 경로 (기본: scripts/benchmark_runs/<run.slug>.yaml)")
    p_from_parquet.add_argument("--force", action="store_true", help="이미 있으면 덮어쓰기")
    p_from_parquet.set_defaults(func=cmd_from_parquet)

    p_validate = sub.add_parser("validate", help="6개 JSON 파일의 정합성 검사")
    p_validate.set_defaults(func=cmd_validate)

    p_list = sub.add_parser("list", help="현재 등록된 프리셋·항목 조회")
    p_list.set_defaults(func=cmd_list)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()

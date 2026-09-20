#!/usr/bin/env python3
"""apply 직후 benchmark_catalog.json에서 한 recorded run을 사람이 읽을 markdown으로 요약한다.

raw JSON diff는 축 좌표 같은 숫자 때문에 리뷰어가 읽고 판단하기 어렵다(축 좌표는
median/lower/upper에서 기계적으로 재계산되는 값이라 diff로 봐도 맞는지 틀린지 알 수
없다). 대신 PR 본문에는 이 요약 표 + 렌더링된 페이지 스크린샷만 보여준다.

GitHub Actions(.github/workflows/benchmark-from-parquet.yml)에서
`python3 scripts/pr_summary.py <slug> > pr-body.md`로 쓴다.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOG_PATH = ROOT / "site" / "data" / "benchmark_catalog.json"

# 스크린샷을 PR 브랜치에 커밋한 뒤 raw.githubusercontent.com으로 참조한다 —
# 이 저장소는 public이라 별도 이미지 호스팅 없이 인라인으로 보인다.
REPO = "bionsight/SynapSpec"


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit("사용법: pr_summary.py <slug>")
    slug = sys.argv[1]
    branch = f"benchmark-update/{slug}"

    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    entry = catalog["recorded_runs"].get(slug)
    if entry is None:
        sys.exit(f"recorded_runs에 '{slug}'가 없습니다 — apply를 먼저 실행했는지 확인하세요.")

    run = entry["recorded_run"]
    lines = [
        f"## Benchmark run `{slug}`",
        "",
        f"**{entry['title']} / {entry['instrument']}** · {run['date']} · {run['instance']} · {run['runtime_display']}",
        "",
        f"- Precursors: **{run['total_precursors_display']}**",
        f"- Protein groups: **{run['total_proteins_display']}**",
        f"- 입력 파일 {run['files_in_experiment']}개",
        "",
    ]

    ratio_measurements = entry.get("ratio_measurements") or []
    if ratio_measurements:
        lines.append("| species | measured ratio | target | deviation |")
        lines.append("|---|---|---|---|")
        for m in ratio_measurements:
            lines.append(f"| {m['species']} | {m['measured_ratio_display']} | log2={m['target']:g} | {m['deviation_percent']:+.1f}% |")
        lines.append("")
    else:
        lines.append("_species별 ratio 데이터 없음 (parquet에 ms2_quantity가 없었거나 A/B 짝이 없음)_")
        lines.append("")

    lines.append(f"![benchmark page screenshot](https://raw.githubusercontent.com/{REPO}/{branch}/benchmark-screenshots/{slug}.png)")
    lines.append("")
    lines.append(f"merge 전까지는 아직 라이브가 아닙니다. 로컬에서 `npm run dev` 후 `/benchmarks/{slug}/`로 직접 확인할 수도 있습니다.")
    lines.append("")
    lines.append("이 PR을 만든 값의 출처: 같이 올라온 `scripts/benchmark_runs/*.yaml` 참조.")

    print("\n".join(lines))


if __name__ == "__main__":
    main()

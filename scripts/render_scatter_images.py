#!/usr/bin/env python3
"""Run detail 페이지의 LFQ precursor scatter를 정적 PNG로 미리 렌더링한다.

Plotly scattergl + client-side fetch로 그리던 방식은 100k~300k점짜리 JSON을
브라우저에서 매번 내려받고 WebGL로 그려야 해서 페이지 진입 시 멈추는 원인이었다.
이 스크립트는 같은 site/public/data/benchmarks/scatter-*.json 포인트 클라우드를
빌드 시점에 한 번 Plotly(Python) + kaleido로 이미지화해서
site/public/data/benchmarks/scatter-{slug}.png로 저장한다 — 런타임엔 <img> 하나만
내려받으면 된다.

여러 툴(SynapSpec/DIA-NN/Spectronaut)을 한 Figure의 subplot으로 묶고, 축 range는
세 클라우드를 합쳐 한 번만 계산해 전부에 동일 적용한다 (공유 range).

사전 준비 (최초 1회, 로컬 전용 — 사이트/CI엔 영향 없음):
    brew install --cask font-pretendard   # 이미지 속 텍스트가 site와 같은 폰트로 나오게

실행:
    uv run --with plotly --with kaleido python scripts/render_scatter_images.py

옵션:
    --slug NAME   해당 run만 다시 렌더링 (기본: diagnostics 있는 모든 run)
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import plotly.graph_objects as go
from plotly.subplots import make_subplots

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "site" / "data"
BENCH_DIR = ROOT / "site" / "public" / "data" / "benchmarks"

# site/lib/plotlyTheme.ts와 맞춰뒀다 — 값이 바뀌면 여기도 손으로 맞춰야 한다.
FONT_FAMILY = "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif"
COLOR_TEXT = "#1a1f26"
COLOR_TEXT_LIGHT = "#5c6773"
COLOR_BORDER = "#e7eaee"
SPECIES_COLORS = {"Human": "#106a9e", "Yeast": "#d97706", "E. coli": "#0f9b8e"}
TARGETS = {"Human": 0, "Yeast": 1, "E. coli": -2}

PANEL_WIDTH = 420
PANEL_HEIGHT = 480


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--slug", help="해당 run만 다시 렌더링 (기본: diagnostics 있는 모든 run)")
    return parser.parse_args()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text())


def panels_for(slug: str, ledgers: list) -> list[dict]:
    panels = [{"tool": "SynapSpec", "path": BENCH_DIR / f"scatter-{slug}.json"}]
    ledger = next((l for l in ledgers if any(r.get("sourceSlug") == slug for r in l["rows"])), None)
    if ledger:
        for tool in ("DIA-NN", "Spectronaut"):
            ref = next((r for r in ledger["toolReferences"] if r["tool"] == tool and r.get("sourceSlug")), None)
            if ref:
                panels.append({"tool": tool, "path": BENCH_DIR / f"scatter-{ref['sourceSlug']}.json"})
    return [p for p in panels if p["path"].exists()]


def shared_range(clouds: list[dict], pad_fraction: float = 0.04) -> tuple[list[float], list[float]]:
    xs = [v for cloud in clouds for pts in cloud.values() for v in pts["x"]]
    ys = [v for cloud in clouds for pts in cloud.values() for v in pts["y"]]

    def padded(values: list[float]) -> list[float]:
        lo, hi = min(values), max(values)
        pad = (hi - lo) * pad_fraction
        return [lo - pad, hi + pad]

    return padded(xs), padded(ys)


def render(slug: str, panels: list[dict]) -> None:
    clouds = [load_json(p["path"]) for p in panels]
    x_range, y_range = shared_range(clouds)

    fig = make_subplots(rows=1, cols=len(panels), subplot_titles=[p["tool"] for p in panels], horizontal_spacing=0.06)

    for i, (panel, cloud) in enumerate(zip(panels, clouds), start=1):
        axis_suffix = "" if i == 1 else str(i)

        for species, pts in cloud.items():
            fig.add_trace(
                go.Scattergl(
                    x=pts["x"],
                    y=pts["y"],
                    mode="markers",
                    name=species,
                    legendgroup=species,
                    showlegend=(i == 1),
                    marker=dict(color=SPECIES_COLORS.get(species, COLOR_TEXT), size=4, opacity=0.45),
                ),
                row=1,
                col=i,
            )

        for species, target in TARGETS.items():
            if species not in cloud:
                continue
            fig.add_shape(
                type="line",
                xref=f"x{axis_suffix} domain",
                x0=0,
                x1=1,
                yref=f"y{axis_suffix}",
                y0=target,
                y1=target,
                line=dict(color=SPECIES_COLORS.get(species, COLOR_TEXT), width=1, dash="dot"),
            )

        fig.update_xaxes(
            range=x_range,
            title_text="log₂(mean quantity in B)",
            row=1,
            col=i,
            gridcolor=COLOR_BORDER,
            zerolinecolor=COLOR_BORDER,
            linecolor=COLOR_BORDER,
            tickfont=dict(color=COLOR_TEXT_LIGHT, size=11),
        )
        fig.update_yaxes(
            range=y_range,
            row=1,
            col=i,
            gridcolor=COLOR_BORDER,
            zerolinecolor=COLOR_BORDER,
            linecolor=COLOR_BORDER,
            tickfont=dict(color=COLOR_TEXT_LIGHT, size=11),
        )
        if i == 1:
            fig.update_yaxes(title_text="log₂(A/B)", row=1, col=i)

    fig.update_layout(
        font=dict(family=FONT_FAMILY, color=COLOR_TEXT, size=12),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        showlegend=True,
        legend=dict(orientation="h", x=0.5, xanchor="center", y=-0.18),
        margin=dict(t=40, r=20, b=90, l=60),
        width=PANEL_WIDTH * len(panels),
        height=PANEL_HEIGHT,
    )
    fig.update_annotations(font=dict(size=13, color=COLOR_TEXT_LIGHT))

    out_path = BENCH_DIR / f"scatter-{slug}.png"
    fig.write_image(str(out_path), scale=2)
    print(f"wrote {out_path.relative_to(ROOT)} ({len(panels)} panel(s): {', '.join(p['tool'] for p in panels)})")


def main() -> None:
    args = parse_args()
    catalog = load_json(DATA_DIR / "benchmark_catalog.json")
    ledgers = load_json(DATA_DIR / "benchmark_ledger.json")

    if args.slug:
        slugs = [args.slug]
    else:
        slugs = [
            slug
            for slug, entry in catalog["recorded_runs"].items()
            if "diagnostics" in entry and "ratio_measurements" in entry
        ]

    for slug in slugs:
        panels = panels_for(slug, ledgers)
        if not panels:
            print(f"skip {slug}: no scatter data")
            continue
        render(slug, panels)


if __name__ == "__main__":
    main()

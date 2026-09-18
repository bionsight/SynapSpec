#!/usr/bin/env python3
"""Run detail 페이지의 species별 log2(A/B) ratio 분포를 정적 PNG로 렌더링한다.

RatioWidget이 보여주던 "종별 한 점 추정치 + 오차범위"와는 다른 정보다 — 이건
전체 분포의 모양(퍼짐, 꼬리, 종 간 overlap)을 보여준다. render_scatter_images.py와
같은 site/public/data/benchmarks/scatter-*.json 포인트 클라우드를 그대로 재사용해서
(각 species의 y값이 이미 precursor별 log2(A/B)다) scipy로 KDE를 계산하고,
Plotly(Python) + kaleido로 site/public/data/benchmarks/density-{slug}.png에 저장한다.

여러 툴(SynapSpec/DIA-NN/Spectronaut)은 subplot으로 나란히 두고, x축(log2 ratio)과
y축(density) 모두 한 번에 공유 range를 계산해 전부에 동일 적용한다 — 정적 이미지라
render_scatter_images.py의 예전 "새 패널이 열릴 때마다 이미 그려진 패널이 다시
그려져서 축이 흔들리는" 문제 자체가 없다.

사전 준비 (최초 1회, 로컬 전용 — 사이트/CI엔 영향 없음):
    brew install --cask font-pretendard

실행:
    uv run --with plotly --with kaleido --with scipy python scripts/render_density_images.py

옵션:
    --slug NAME   해당 run만 다시 렌더링 (기본: diagnostics 있는 모든 run)
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from scipy.stats import gaussian_kde

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
GRID_POINTS = 400


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--slug", help="해당 run만 다시 렌더링 (기본: diagnostics 있는 모든 run)")
    return parser.parse_args()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text())


def with_alpha(hex_color: str, alpha: float) -> str:
    n = int(hex_color.lstrip("#"), 16)
    r, g, b = (n >> 16) & 255, (n >> 8) & 255, n & 255
    return f"rgba({r}, {g}, {b}, {alpha})"


def panels_for(slug: str, ledgers: list) -> list[dict]:
    panels = [{"tool": "SynapSpec", "path": BENCH_DIR / f"scatter-{slug}.json"}]
    ledger = next((l for l in ledgers if any(r.get("sourceSlug") == slug for r in l["rows"])), None)
    if ledger:
        for tool in ("DIA-NN", "Spectronaut"):
            ref = next((r for r in ledger["toolReferences"] if r["tool"] == tool and r.get("sourceSlug")), None)
            if ref:
                panels.append({"tool": tool, "path": BENCH_DIR / f"scatter-{ref['sourceSlug']}.json"})
    return [p for p in panels if p["path"].exists()]


def x_range_for(clouds: list[dict], pad_fraction: float = 0.15) -> list[float]:
    # 1~99 percentile로 잘라낸다 — 산점도와 달리 KDE는 극단 outlier precursor
    # 몇 개 때문에 대부분의 곡선이 x축 가운데로 뭉개지면 안 되니, 실제 밀도가
    # 몰려있는 구간을 기준으로 범위를 잡고 KDE 꼬리가 자연스럽게 빠질 여백만 둔다.
    ys = np.concatenate([pts["y"] for cloud in clouds for pts in cloud.values()])
    lo, hi = np.percentile(ys, [1, 99])
    pad = (hi - lo) * pad_fraction
    return [float(lo - pad), float(hi + pad)]


def render(slug: str, panels: list[dict]) -> None:
    clouds = [load_json(p["path"]) for p in panels]
    x_range = x_range_for(clouds)
    grid = np.linspace(x_range[0], x_range[1], GRID_POINTS)

    curves = []  # (panel index, species, density array)
    for i, cloud in enumerate(clouds):
        for species, pts in cloud.items():
            kde = gaussian_kde(pts["y"])
            curves.append((i, species, kde(grid)))
    y_max = max(curve.max() for _, _, curve in curves) * 1.08

    fig = make_subplots(rows=1, cols=len(panels), subplot_titles=[p["tool"] for p in panels], horizontal_spacing=0.06)

    seen_species: set[str] = set()
    for i, species, density in curves:
        col = i + 1
        color = SPECIES_COLORS.get(species, COLOR_TEXT)
        fig.add_trace(
            go.Scatter(
                x=grid,
                y=density,
                mode="lines",
                name=species,
                legendgroup=species,
                showlegend=species not in seen_species,
                line=dict(color=color, width=2),
                fill="tozeroy",
                fillcolor=with_alpha(color, 0.35),
            ),
            row=1,
            col=col,
        )
        seen_species.add(species)

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

    for i, panel in enumerate(panels, start=1):
        axis_suffix = "" if i == 1 else str(i)
        for species, target in TARGETS.items():
            fig.add_shape(
                type="line",
                xref=f"x{axis_suffix}",
                x0=target,
                x1=target,
                yref=f"y{axis_suffix}",
                y0=0,
                y1=y_max,
                line=dict(color=SPECIES_COLORS.get(species, COLOR_TEXT), width=1, dash="dot"),
            )
        fig.update_xaxes(
            range=x_range,
            title_text="log₂(A/B)",
            row=1,
            col=i,
            gridcolor=COLOR_BORDER,
            zerolinecolor=COLOR_BORDER,
            linecolor=COLOR_BORDER,
            tickfont=dict(color=COLOR_TEXT_LIGHT, size=11),
        )
        fig.update_yaxes(
            range=[0, y_max],
            row=1,
            col=i,
            gridcolor=COLOR_BORDER,
            zerolinecolor=COLOR_BORDER,
            linecolor=COLOR_BORDER,
            tickfont=dict(color=COLOR_TEXT_LIGHT, size=11),
        )
        if i == 1:
            fig.update_yaxes(title_text="Density", row=1, col=i)

    out_path = BENCH_DIR / f"density-{slug}.png"
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

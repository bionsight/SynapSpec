#!/usr/bin/env python3
"""Render species-level log2(A/B) distributions as static PNG files.

These plots show the full distribution shape, including spread, tails, and species
overlap, rather than the point estimate and error interval previously shown by
RatioWidget. The script reuses the same
site/public/data/benchmarks/scatter-*.json point clouds as
render_scatter_images.py. Each species y value is already a precursor-level
log2(A/B) ratio, so SciPy computes the KDE and Plotly (Python) with Kaleido writes
site/public/data/benchmarks/density-{slug}.png.

SynapSpec, DIA-NN, and Spectronaut are shown as adjacent subplots. Every panel
uses the SynapSpec run's log2 ratio range and a shared density range. Static
rendering also prevents axes from shifting as additional panels load.

One-time local setup (does not affect the site or CI):
    brew install --cask font-pretendard

Run:
    uv run --with plotly --with kaleido --with scipy python scripts/render_density_images.py

Options:
    --slug NAME   Render only this run (default: every run with diagnostics).
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

# Keep these values aligned with the benchmark PNGs already published on the site.
FONT_FAMILY = "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif"
COLOR_TEXT = "#1a1f26"
COLOR_TEXT_LIGHT = "#5c6773"
COLOR_BORDER = "#e7eaee"
SPECIES_COLORS = {"Human": "#c96a5e", "Yeast": "#5a8aa7", "E. coli": "#6da89a"}
SPECIES_ORDER = ("Human", "Yeast", "E. coli")
TARGETS = {"Human": 0, "Yeast": 1, "E. coli": -2}

PANEL_WIDTH = 420
PANEL_HEIGHT = 480
GRID_POINTS = 400


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--slug", help="Render only this run (default: every run with diagnostics)")
    return parser.parse_args()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text())


def panels_for(slug: str, ledgers: list) -> list[dict]:
    ledger = next((l for l in ledgers if any(r.get("sourceSlug") == slug for r in l["rows"])), None)
    row = next((r for r in ledger["rows"] if r.get("sourceSlug") == slug), None) if ledger else None
    version = str(row.get("release_version") or "").removeprefix("v") if row else ""
    title = f"SynapSpec {version}" if version else "SynapSpec"
    panels = [{"tool": title, "path": BENCH_DIR / f"scatter-{slug}.json"}]
    if ledger:
        for tool in ("DIA-NN", "Spectronaut"):
            ref = next((r for r in ledger["toolReferences"] if r["tool"] == tool and r.get("sourceSlug")), None)
            if ref:
                panels.append({"tool": tool, "path": BENCH_DIR / f"scatter-{ref['sourceSlug']}.json"})
    return [p for p in panels if p["path"].exists()]


def x_range_for(cloud: dict, pad_fraction: float = 0.04) -> list[float]:
    ys = np.concatenate([points["y"] for points in cloud.values()])
    lo, hi = float(ys.min()), float(ys.max())
    pad = (hi - lo) * pad_fraction
    return [float(lo - pad), float(hi + pad)]


def render(slug: str, panels: list[dict]) -> None:
    clouds = [load_json(p["path"]) for p in panels]
    x_range = x_range_for(clouds[0])
    grid = np.linspace(x_range[0], x_range[1], GRID_POINTS)

    curves = []  # (panel index, species, density array)
    for i, cloud in enumerate(clouds):
        for species in SPECIES_ORDER:
            pts = cloud.get(species)
            if not pts:
                continue
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

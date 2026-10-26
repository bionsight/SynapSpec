#!/usr/bin/env python3
"""Pre-render the run detail LFQ precursor scatter plots as static PNG files.

Rendering 100k-300k point JSON files in the browser with Plotly scattergl caused
the page to stall while downloading the data and initializing WebGL. This script
renders the existing site/public/data/benchmarks/scatter-*.json point clouds once
with Plotly (Python) and Kaleido, then writes each result to
site/public/data/benchmarks/scatter-{slug}.png. At runtime, the page only needs to
download a single image.

SynapSpec, DIA-NN, and Spectronaut are shown as subplots in one figure. Releases
in the same benchmark ledger reuse the v1.0.0 axes when that baseline is
available, so version pages remain directly comparable.

One-time local setup (does not affect the site or CI):
    brew install --cask font-pretendard   # Match the site's font in generated images.

Run:
    uv run --with plotly --with kaleido python scripts/render_scatter_images.py

Options:
    --slug NAME   Render only this run (default: every run with diagnostics).
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

# Keep these values aligned with the benchmark PNGs already published on the site.
FONT_FAMILY = "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif"
COLOR_TEXT = "#1a1f26"
COLOR_TEXT_LIGHT = "#5c6773"
COLOR_BORDER = "#e7eaee"
SPECIES_COLORS = {"Human": "#c96a5e", "Yeast": "#5a8aa7", "E. coli": "#6da89a"}
SPECIES_ORDER = ("Human", "Yeast", "E. coli")
TARGETS = {"Human": 0, "Yeast": 1, "E. coli": -2}
MARKER_SIZE = 2
MARKER_OPACITY = 0.25
AXIS_REFERENCE_VERSION = "v1.0.0"

PANEL_WIDTH = 420
PANEL_HEIGHT = 480


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        "--slug", help="Render only this run (default: every run with diagnostics)"
    )
    return parser.parse_args()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text())


def panels_for(slug: str, ledgers: list) -> list[dict]:
    ledger = next(
        (l for l in ledgers if any(r.get("sourceSlug") == slug for r in l["rows"])),
        None,
    )
    row = (
        next((r for r in ledger["rows"] if r.get("sourceSlug") == slug), None)
        if ledger
        else None
    )
    version = str(row.get("release_version") or "").removeprefix("v") if row else ""
    title = f"SynapSpec {version}" if version else "SynapSpec"
    panels = [{"tool": title, "path": BENCH_DIR / f"scatter-{slug}.json"}]
    if ledger:
        for tool in ("DIA-NN", "Spectronaut"):
            ref = next(
                (
                    r
                    for r in ledger["toolReferences"]
                    if r["tool"] == tool and r.get("sourceSlug")
                ),
                None,
            )
            if ref:
                panels.append(
                    {
                        "tool": tool,
                        "path": BENCH_DIR / f"scatter-{ref['sourceSlug']}.json",
                    }
                )
    return [p for p in panels if p["path"].exists()]


def reference_slug_for(slug: str, ledgers: list) -> str:
    ledger = next(
        (
            item
            for item in ledgers
            if any(row.get("sourceSlug") == slug for row in item["rows"])
        ),
        None,
    )
    if not ledger:
        return slug
    reference = next(
        (
            row
            for row in ledger["rows"]
            if row.get("release_version") == AXIS_REFERENCE_VERSION
        ),
        None,
    )
    return (
        reference.get("sourceSlug")
        if reference and reference.get("sourceSlug")
        else slug
    )


def padded_range(cloud: dict, coordinate: str, pad_fraction: float) -> list[float]:
    values = [value for points in cloud.values() for value in points[coordinate]]
    lo, hi = min(values), max(values)
    pad = (hi - lo) * pad_fraction
    return [lo - pad, hi + pad]


def primary_y_range(cloud: dict, pad_fraction: float = 0.04) -> list[float]:
    return padded_range(cloud, "y", pad_fraction)


def panel_x_range(cloud: dict, pad_fraction: float = 0.067520483957424) -> list[float]:
    return padded_range(cloud, "x", pad_fraction)


def render(slug: str, panels: list[dict], reference_panels: list[dict]) -> None:
    clouds = [load_json(p["path"]) for p in panels]
    reference_clouds = [load_json(panel["path"]) for panel in reference_panels]
    y_range = primary_y_range(reference_clouds[0])
    x_ranges = [panel_x_range(cloud) for cloud in reference_clouds]

    fig = make_subplots(
        rows=1,
        cols=len(panels),
        subplot_titles=[p["tool"] for p in panels],
        horizontal_spacing=0.06,
    )

    for i, (panel, cloud) in enumerate(zip(panels, clouds), start=1):
        axis_suffix = "" if i == 1 else str(i)

        for species in SPECIES_ORDER:
            pts = cloud.get(species)
            if not pts:
                continue
            fig.add_trace(
                go.Scattergl(
                    x=pts["x"],
                    y=pts["y"],
                    mode="markers",
                    name=species,
                    legendgroup=species,
                    showlegend=(i == 1),
                    marker=dict(
                        color=SPECIES_COLORS.get(species, COLOR_TEXT),
                        size=MARKER_SIZE,
                        opacity=MARKER_OPACITY,
                    ),
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
                line=dict(
                    color=SPECIES_COLORS.get(species, COLOR_TEXT), width=1, dash="dot"
                ),
            )

        fig.update_xaxes(
            range=x_ranges[i - 1] if i <= len(x_ranges) else panel_x_range(cloud),
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
        legend=dict(
            orientation="h", x=0.5, xanchor="center", y=-0.18, itemsizing="constant"
        ),
        margin=dict(t=40, r=20, b=90, l=60),
        width=PANEL_WIDTH * len(panels),
        height=PANEL_HEIGHT,
    )
    fig.update_annotations(font=dict(size=13, color=COLOR_TEXT_LIGHT))

    out_path = BENCH_DIR / f"scatter-{slug}.png"
    fig.write_image(str(out_path), scale=2)
    print(
        f"wrote {out_path.relative_to(ROOT)} ({len(panels)} panel(s): {', '.join(p['tool'] for p in panels)})"
    )


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
        reference_panels = panels_for(reference_slug_for(slug, ledgers), ledgers)
        render(slug, panels, reference_panels or panels)


if __name__ == "__main__":
    main()

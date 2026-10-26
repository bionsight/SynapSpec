#!/usr/bin/env python3
"""Build diagnostic metadata and LFQ scatter data from a recorded benchmark.

Usage:
    uv run --with pandas --with pyarrow --with numpy \
        python3 scripts/build_benchmark_artifacts.py \
        <precursors.parquet> <recorded-run-slug>
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "site/data/benchmark_catalog.json"
BENCHMARK_DATA_DIR = ROOT / "site/public/data/benchmarks"
SPECIES_LABELS = {
    "HUMAN": "Human",
    "YEAS8": "Yeast",
    "YEAST": "Yeast",
    "ECOLI": "E. coli",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "parquet", type=Path, help="SynapSpec precursors.parquet result"
    )
    parser.add_argument(
        "slug", help="Recorded run slug already present in benchmark_catalog.json"
    )
    return parser.parse_args()


def precursor_key(df):
    charges = df["precursor_charge"].astype("Int64").astype(str)
    return df["modified_sequence"].astype(str) + "_" + charges


def extract_species(protein_names: object) -> str | None:
    if not isinstance(protein_names, str) or not protein_names.strip():
        return None
    species = {
        name.rsplit("_", 1)[-1] for name in protein_names.split(";") if name.strip()
    }
    species.discard("")
    return ";".join(sorted(species)) if species else None


def summarize_cv(values) -> dict[str, int | float | str]:
    values = values.replace([float("inf"), float("-inf")], None).dropna()
    median = float(values.median())
    return {
        "count": int(values.size),
        "median": round(median, 5),
        "median_display": f"{median:.1%}",
        "p5": round(float(values.quantile(0.05)), 5),
        "p25": round(float(values.quantile(0.25)), 5),
        "p75": round(float(values.quantile(0.75)), 5),
        "p95": round(float(values.quantile(0.95)), 5),
    }


def condition_cv(df, level: str):
    import pandas as pd

    values = []
    for _, condition_df in df.groupby("condition"):
        if level == "precursor":
            matrix = condition_df.pivot_table(
                index="unique_key",
                columns="filename",
                values="ms2_quantity",
            )
        elif "protein_quantity" in condition_df.columns:
            matrix = condition_df.pivot_table(
                index="protein_group",
                columns="filename",
                values="protein_quantity",
                aggfunc="max",
            )
        else:
            matrix = (
                condition_df.groupby(["protein_group", "filename"])["ms2_quantity"]
                .sum()
                .unstack()
            )
        values.append(matrix.std(axis=1) / matrix.mean(axis=1))
    return pd.concat(values, ignore_index=True)


def build_diagnostics(df) -> dict:
    frequency = (
        df.groupby("unique_key")["filename"].nunique().value_counts().sort_index()
    )
    n_files = int(df["filename"].nunique())
    bars = [
        {
            "n": n,
            "count": int(frequency.get(n, 0)),
            "count_display": f"{int(frequency.get(n, 0)):,}",
        }
        for n in range(1, n_files + 1)
    ]
    return {
        "data_completeness": {"n_files": n_files, "bars": bars},
        "cv_distribution": {
            "precursor": summarize_cv(condition_cv(df, "precursor")),
            "protein": summarize_cv(condition_cv(df, "protein")),
        },
    }


def build_scatter(df, species_keys: list[str]) -> dict:
    import numpy as np

    species_df = df.assign(species=df["protein_names"].apply(extract_species))
    species_df = species_df[
        ~species_df["species"].fillna("").str.contains(";", regex=False)
        & species_df["species"].isin(species_keys)
    ]

    result = {}
    for species_key in species_keys:
        selected = species_df[species_df["species"].eq(species_key)].drop_duplicates(
            subset=["unique_key", "filename"]
        )
        quantities = (
            selected.groupby(["condition", "unique_key"])["ms2_quantity"]
            .mean()
            .unstack(level=0)
        )
        if not {"A", "B"}.issubset(quantities.columns):
            continue
        quantities = quantities[quantities["A"].gt(0) & quantities["B"].gt(0)]
        x = np.log2(quantities["B"].to_numpy(dtype=float))
        y = np.log2((quantities["A"] / quantities["B"]).to_numpy(dtype=float))
        finite = np.isfinite(x) & np.isfinite(y)
        result[SPECIES_LABELS.get(species_key, species_key)] = {
            "x": np.round(x[finite], 3).tolist(),
            "y": np.round(y[finite], 3).tolist(),
        }
    return result


def main() -> None:
    import pandas as pd

    args = parse_args()
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    try:
        run = catalog["recorded_runs"][args.slug]
    except KeyError as exc:
        raise SystemExit(f"Unknown recorded run slug: {args.slug}") from exc

    frame = pd.read_parquet(args.parquet)
    required = {
        "condition",
        "filename",
        "modified_sequence",
        "ms2_quantity",
        "precursor_charge",
        "protein_names",
    }
    missing = sorted(required - set(frame.columns))
    if missing:
        raise SystemExit(f"Missing required parquet columns: {', '.join(missing)}")
    if "precursor_qvalue" in frame.columns:
        frame = frame[frame["precursor_qvalue"].lt(0.01)].copy()

    protein_column = next(
        (
            column
            for column in ("protein_group", "protein_accession", "protein_accessions")
            if column in frame.columns
        ),
        None,
    )
    if protein_column is None:
        raise SystemExit("Missing a protein group column")
    frame["unique_key"] = precursor_key(frame)
    frame["protein_group"] = frame[protein_column]

    preset = next(
        item["preset"]
        for item in catalog["dataset_catalog"]
        if item["slug"] == args.slug
    )
    species_keys = (
        ["HUMAN", "YEAS8", "ECOLI"]
        if preset == "bion_lfq_oe480"
        else ["HUMAN", "YEAST", "ECOLI"]
    )
    run["diagnostics"] = build_diagnostics(frame)

    CATALOG_PATH.write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    BENCHMARK_DATA_DIR.mkdir(parents=True, exist_ok=True)
    scatter_path = BENCHMARK_DATA_DIR / f"scatter-{args.slug}.json"
    scatter_path.write_text(
        json.dumps(
            build_scatter(frame, species_keys),
            ensure_ascii=False,
            separators=(",", ":"),
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"Updated {CATALOG_PATH.relative_to(ROOT)}")
    print(f"Created {scatter_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

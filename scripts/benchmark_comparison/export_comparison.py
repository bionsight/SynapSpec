"""Export audited historical LFQ comparisons without rerunning an analysis engine."""

import argparse
import hashlib
import itertools
import json
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from audit_inputs import audit_report
from parsers.lfq import prepare_lfq_dataframe, get_lfq_quantification
from parsers.lfq_constants import LFQ_BENCHMARK_PRESETS


TOOLS = ["synapspec", "diann", "spectronaut"]
LABELS = ["SynapSpec (v092 folder)", "DIA-NN (archived)", "Spectronaut (v21_0 folder)"]
COLORS = ["#106a9e", "#b07d21", "#9b5180"]
MAPPING = {
    "Run": "filename", "Modified.Sequence": "modified_sequence", "Precursor.Charge": "precursor_charge",
    "Q.Value": "precursor_qvalue", "Decoy": "is_decoy", "Precursor.Quantity": "ms2_quantity",
    "Protein.Names": "protein_names", "Protein.Ids": "protein_accessions", "Protein.Group": "protein_group",
    "PG.MaxLFQ": "protein_quantity", "Ms1.Area": "ms1_quantity", "RT": "rt",
    "Predicted.RT": "empirical_rt", "Precursor.Mz": "precursor_mz",
}


def load_report(path: Path) -> pd.DataFrame:
    audit = audit_report(path)
    if audit["status"] != "input_checks_passed":
        raise ValueError(f"Input audit failed: {audit}")
    frame = pd.read_parquet(path).rename(columns=MAPPING)
    frame = frame[frame.precursor_qvalue.lt(0.01) & frame.is_decoy.eq(False)].copy()
    frame["unique_key"] = frame.modified_sequence + "_" + frame.precursor_charge.astype("Int64").astype(str)
    frame["condition"] = frame.filename.str.extract(r"_([AB])_R[123]$", expand=False)
    if frame.condition.isna().any():
        raise ValueError("Unrecognized condition or replicate")
    return frame.drop_duplicates(["filename", "unique_key"])


def summarize(frame: pd.DataFrame, preset, prepare_lfq_dataframe, get_lfq_quantification) -> dict:
    quantities = frame.pivot(index="unique_key", columns="filename", values="ms2_quantity")
    quantities = quantities.where(np.isfinite(quantities) & quantities.gt(0))
    cv = {}
    for condition in ["A", "B"]:
        columns = [name for name in quantities.columns if f"_{condition}_R" in name]
        complete = quantities[columns].dropna()
        values = complete.std(axis=1, ddof=1) / complete.mean(axis=1) * 100
        cv[condition] = {"median_percent": float(values.median()), "count": values.shape[0]}
    prepared = prepare_lfq_dataframe(frame, preset)
    ratios = get_lfq_quantification(prepared, level="precursor", specieses=preset.species)
    ratio_summary = []
    for species, (_, values) in ratios.items():
        values = values[np.isfinite(values)]
        if values.size == 0:
            raise ValueError(f"No LFQ ratios for {species}")
        lower, median, upper = np.quantile(values, [0.25, 0.5, 0.75])
        ratio_summary.append({"species": species, "count": int(values.size),
                              "target": preset.target_log2_ratios[species],
                              "median": float(median), "lower": float(lower), "upper": float(upper)})
    detections = frame.groupby("unique_key").filename.nunique()
    per_file = frame.groupby("filename").agg(precursors=("unique_key", "nunique"))
    # Independent row-key counting must agree with the vectorized aggregation.
    independent = frame[["filename", "modified_sequence", "precursor_charge"]].drop_duplicates().groupby("filename").size()
    if not per_file.precursors.equals(independent.rename("precursors")):
        raise ValueError("Independent per-file counts disagree")
    protein_column = "protein_group" if "protein_group" in frame else "protein_accession" if "protein_accession" in frame else "protein_accessions"
    return {"precursors": int(frame.unique_key.nunique()),
            "reported_protein_entities": int(frame[protein_column].nunique()), "protein_field": protein_column,
            "files": [{"name": name, "precursors": int(count)} for name, count in per_file.precursors.items()],
            "complete_six": int(detections.eq(6).sum()),
            "complete_six_percent": float(detections.eq(6).mean() * 100),
            "cv": cv, "ratios": ratio_summary}


def draw_summary(record: dict, destination: Path) -> None:
    plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 10, "axes.spines.top": False,
                         "axes.spines.right": False, "axes.titleweight": "bold"})
    figure, axes = plt.subplots(2, 3, figsize=(18, 10), layout="constrained")
    results = record["tools"]
    labels = ["SynapSpec", "DIA-NN", "Spectronaut"]
    for axis, field, title, unit in [
        (axes[0, 0], "precursors", "Unique precursor IDs", "Modified sequence + charge"),
        (axes[0, 1], "complete_six_percent", "Detected in all six runs", "% of each tool's identified precursors"),
    ]:
        bars = axis.bar(labels, [tool[field] for tool in results], color=COLORS)
        axis.bar_label(bars, fmt="%.1f" if "percent" in field else "%.0f", padding=3)
        axis.set_title(title)
        axis.set_ylabel(unit)
        axis.set_ylim(0, max(tool[field] for tool in results) * 1.18)
    axis = axes[0, 2]
    for index, condition in enumerate(["A", "B"]):
        positions = np.arange(3) + (index - 0.5) * 0.35
        bars = axis.bar(positions, [tool["cv"][condition]["median_percent"] for tool in results],
                        width=0.35, color=COLORS, alpha=1 if index == 0 else 0.45,
                        hatch="" if index == 0 else "//", label=f"Condition {condition}")
        axis.bar_label(bars, fmt="%.1f", padding=3)
    axis.set_xticks(range(3), labels)
    axis.set_title("Within-condition median CV")
    axis.set_ylabel("% · positive quantity in all 3 replicates")
    axis.legend()
    for axis, species in zip(axes[1], ["HUMAN", "YEAS8", "ECOLI"], strict=True):
        for index, tool in enumerate(results):
            ratio = next(item for item in tool["ratios"] if item["species"] == species)
            axis.errorbar(index, ratio["median"], yerr=[[ratio["median"] - ratio["lower"]],
                                                       [ratio["upper"] - ratio["median"]]],
                          fmt="o", capsize=6, color=COLORS[index])
            axis.annotate(f'{ratio["median"]:.3f}', (index, ratio["median"]), xytext=(6, 4), textcoords="offset points")
        axis.axhline(ratio["target"], color="#404040", linestyle="--", label="Expected")
        axis.set_xticks(range(3), labels)
        axis.set_title(f"{species}: LFQ ratio median and IQR")
        axis.set_ylabel("log₂(mean A / mean B) · precursor MS2")
        axis.set_xlim(-0.5, 2.7)
        axis.legend()
    figure.suptitle(f'{record["name"]} — archived report comparison\n'
                     'Precursor q-value < 0.01; decoys excluded. Versions/settings not fully reconciled; not a ranking.', fontsize=15)
    figure.savefig(destination, dpi=160)
    plt.close(figure)


def export(input_directory: Path, output_directory: Path) -> list[dict]:
    output_directory.mkdir(parents=True, exist_ok=False)
    records = []
    provenance = json.loads((input_directory / "manifest.json").read_text())
    for period, instrument, preset_name in [("202409", "OE480", "bion_lfq_oe480"),
                                             ("202502", "Orbitrap Astral", "bion_lfq_astral")]:
        frames = [load_report(input_directory / f"{period}-{tool}.parquet") for tool in TOOLS]
        filenames = [sorted(frame.filename.unique().tolist()) for frame in frames]
        if not filenames[0] == filenames[1] == filenames[2] or len(filenames[0]) != 6:
            raise ValueError("The reports do not cover the same six inputs")
        preset = LFQ_BENCHMARK_PRESETS[preset_name]
        record = {"slug": f"lfqbench-{period}-archived", "name": f"LFQBench / {instrument}",
                  "instrument": instrument, "preset": preset_name, "files": filenames[0],
                  "release": None, "runtime_hours": None, "resource": None, "analysis_date": None,
                  "status": "share-with-caveats", "tools": [], "overlap": []}
        for label, tool, frame in zip(LABELS, TOOLS, frames, strict=True):
            result = summarize(frame, preset, prepare_lfq_dataframe, get_lfq_quantification)
            record["tools"].append({"id": tool, "label": label, **result})
        for left, right in itertools.combinations(range(3), 2):
            shared = frames[left][["modified_sequence", "precursor_charge"]].drop_duplicates().merge(
                frames[right][["modified_sequence", "precursor_charge"]].drop_duplicates(),
                on=["modified_sequence", "precursor_charge"], validate="one_to_one")
            record["overlap"].append({"left": TOOLS[left], "right": TOOLS[right], "precursors": shared.shape[0]})
        record["figure"] = f'{record["slug"]}.png'
        draw_summary(record, output_directory / record["figure"])
        records.append(record)
        print(record["name"], [(item["id"], item["precursors"]) for item in record["tools"]], flush=True)
    (output_directory / "comparisons.json").write_text(json.dumps(records, indent=2, allow_nan=False))
    hashes = {path.name: hashlib.sha256(path.read_bytes()).hexdigest() for path in input_directory.glob("*.parquet")}
    (output_directory / "provenance.private.json").write_text(json.dumps({"sources": provenance, "extract_sha256": hashes}, indent=2))
    return records


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("inputs", type=Path)
    parser.add_argument("output", type=Path)
    arguments = parser.parse_args()
    export(arguments.inputs, arguments.output)

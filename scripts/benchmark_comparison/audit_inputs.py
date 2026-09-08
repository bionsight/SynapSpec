"""Check extracted LFQBench reports before comparing tools.

Run with the DeepMSFlow Python environment:
    python audit_inputs.py /path/to/benchmark-inputs --output /path/to/audit.json
"""

import argparse
import json
from pathlib import Path

import pandas as pd


COLUMN_MAPPING = {
    "Run": "filename",
    "Modified.Sequence": "modified_sequence",
    "Precursor.Charge": "precursor_charge",
    "Q.Value": "precursor_qvalue",
    "Decoy": "is_decoy",
    "Precursor.Quantity": "ms2_quantity",
}
KEY_COLUMNS = ["filename", "modified_sequence", "precursor_charge"]


def audit_report(path: Path) -> dict:
    """Report missing keys and conflicting per-precursor quantities without resolving them."""
    path = Path(path)
    frame = pd.read_parquet(path).rename(columns=COLUMN_MAPPING)
    required = {*KEY_COLUMNS, "precursor_qvalue", "is_decoy", "ms2_quantity"}
    missing = sorted(required - set(frame.columns))
    if missing:
        return {"file": path.name, "status": "blocked", "missing_columns": missing}
    valid = frame[frame.precursor_qvalue.lt(0.01) & frame.is_decoy.eq(False)]
    conflicts = valid.groupby(KEY_COLUMNS).ms2_quantity.nunique(dropna=False).gt(1)
    null_keys = int(valid[KEY_COLUMNS].isna().any(axis=1).sum())
    return {
        "file": path.name,
        "status": "blocked" if conflicts.any() or null_keys or valid.empty else "input_checks_passed",
        "extracted_rows": frame.shape[0],
        "filtered_rows": valid.shape[0],
        "precursor_runs": valid.drop_duplicates(KEY_COLUMNS).shape[0],
        "quantity_conflicts": int(conflicts.sum()),
        "null_keys": null_keys,
        "input_files": sorted(frame.filename.dropna().unique().tolist()),
        "filter": "precursor q-value < 0.01 and decoy == false",
    }


def main() -> None:
    """Write an audit artifact; never modify source reports."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input_directory", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    arguments = parser.parse_args()
    reports = [audit_report(path) for path in sorted(arguments.input_directory.glob("*.parquet"))]
    if not reports:
        raise ValueError("No parquet extracts found")
    with arguments.output.open("x") as output:
        json.dump(reports, output, indent=2, allow_nan=False)
    print(json.dumps(reports, indent=2))


if __name__ == "__main__":
    main()

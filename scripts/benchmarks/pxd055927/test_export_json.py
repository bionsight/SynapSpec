"""Regression coverage adapted from DeepMSFlow's PXD055927 exporter tests.

Synthetic parquet fixtures exercise calculations without network or private data.
"""

import json
import subprocess
import sys
from pathlib import Path

import duckdb
import pytest
from export_json import Comparison, CvSummary, ToolData, _cv_summary, _prepare_source
from pydantic import ValidationError

REFERENCE = Path(__file__).resolve().parents[3] / "site/data/pxd055927/external_reference.json"
EXPORTER = Path(__file__).with_name("export_json.py")


@pytest.fixture
def parquet(tmp_path: Path) -> Path:
    """Create 24 runs with two charge states and a known triplicate CV of 0.5."""
    path = tmp_path / "source.parquet"
    with duckdb.connect() as connection:
        connection.execute("""
            CREATE TABLE fixture AS
            SELECT 'Elmo_20230331_TKO_HSdia_' || replicate || dose AS filename,
                   'PEPTIDE' AS modified_sequence, charge AS precursor_charge,
                   0.009 AS precursor_qvalue, false AS is_decoy,
                   'specific' AS precursor_class,
                   CASE replicate WHEN 'A' THEN 1.0 WHEN 'B' THEN 2.0 ELSE 3.0 END AS ms2_quantity,
                   'P1' AS protein_accession
            FROM (VALUES ('A'), ('B'), ('C')) replicates(replicate)
            CROSS JOIN range(1, 9) doses(dose) CROSS JOIN range(2, 4) charges(charge)
        """)
        connection.execute("COPY fixture TO ? (FORMAT PARQUET)", [str(path)])
    return path


def _changed_parquet(parquet: Path, change_sql: str) -> Path:
    changed = parquet.with_name("changed.parquet")
    with duckdb.connect() as connection:
        connection.execute("CREATE TABLE fixture AS SELECT * FROM read_parquet(?)", [str(parquet)])
        connection.execute(change_sql)
        connection.execute("COPY fixture TO ? (FORMAT PARQUET)", [str(changed)])
    return changed


def test_positive_quantities_sum_charges_and_match_doses(parquet: Path) -> None:
    with duckdb.connect() as connection:
        _prepare_source(connection, parquet)
        summary = _cv_summary(connection)
        assert summary.n == 8
        assert summary.peptide_count == 1
        assert summary.median == pytest.approx(0.5)
        assert connection.execute(
            "SELECT quantity FROM peptide_quantities ORDER BY filename LIMIT 1"
        ).fetchone() == (2.0,)


def test_decoys_and_threshold_boundary_are_excluded(parquet: Path) -> None:
    changed = _changed_parquet(parquet, """
        INSERT INTO fixture SELECT * REPLACE(true AS is_decoy) FROM fixture;
        INSERT INTO fixture SELECT * REPLACE(0.01 AS precursor_qvalue) FROM fixture WHERE NOT is_decoy;
    """)
    with duckdb.connect() as connection:
        _prepare_source(connection, changed)
        assert connection.execute("SELECT count(*) FROM hits").fetchone() == (48,)


@pytest.mark.parametrize(("change_sql", "message"), [
    ("ALTER TABLE fixture DROP ms2_quantity", "Missing required"),
    ("DELETE FROM fixture WHERE filename LIKE '%A1'", "24 PXD055927"),
    ("INSERT INTO fixture SELECT * FROM fixture LIMIT 1", "Duplicate"),
    ("UPDATE fixture SET precursor_class = 'unknown'", "Unknown or inconsistent"),
    ("UPDATE fixture SET precursor_class = 'semi_specific' WHERE filename LIKE '%A1'", "Unknown or inconsistent"),
    ("UPDATE fixture SET ms2_quantity = -1", "Negative or non-finite"),
    ("UPDATE fixture SET precursor_qvalue = NULL", "Invalid required"),
])
def test_invalid_inputs_raise(parquet: Path, change_sql: str, message: str) -> None:
    changed = _changed_parquet(parquet, change_sql)
    with duckdb.connect() as connection, pytest.raises(ValueError, match=message):
        _prepare_source(connection, changed)


def test_missing_complete_case_cv_is_not_zero(parquet: Path) -> None:
    changed = _changed_parquet(parquet, "UPDATE fixture SET ms2_quantity = NULL WHERE filename LIKE '%A1'")
    with duckdb.connect() as connection:
        _prepare_source(connection, changed)
        with pytest.raises(ValueError, match="complete-case CV is unavailable"):
            _cv_summary(connection)


def test_manual_data_partition_is_validated() -> None:
    references = json.loads(REFERENCE.read_text())
    for reference in references:
        ToolData.model_validate(reference)
    references[0]["specificity"]["semi_specific"] += 1
    with pytest.raises(ValidationError, match="must equal precursor_count"):
        ToolData.model_validate(references[0])


def test_invalid_cv_summary_is_rejected() -> None:
    with pytest.raises(ValidationError):
        CvSummary(n=8, peptide_count=1, q1=0.3, median=0.2, q3=0.4, lowerfence=0, upperfence=0.5)


def test_cli_exports_calculated_values_and_preserves_external_references(parquet: Path, tmp_path: Path) -> None:
    output = tmp_path / "comparison.json"
    subprocess.run(
        [sys.executable, str(EXPORTER), str(parquet), "--external", str(REFERENCE), "--output", str(output)],
        check=True, capture_output=True, text=True,
    )
    comparison = Comparison.model_validate_json(output.read_text())
    assert comparison.tools[0].peptide_count == 1
    assert comparison.tools[0].precursor_count == 2
    assert comparison.tools[0].cv.median == pytest.approx(0.5)
    assert json.loads(output.read_text())["tools"][1:] == json.loads(REFERENCE.read_text())


def test_cli_failure_leaves_existing_output_unchanged(parquet: Path, tmp_path: Path) -> None:
    changed = _changed_parquet(parquet, "ALTER TABLE fixture DROP ms2_quantity")
    output = tmp_path / "comparison.json"
    output.write_text("previous publication")
    result = subprocess.run(
        [sys.executable, str(EXPORTER), str(changed), "--external", str(REFERENCE), "--output", str(output)],
        check=False, capture_output=True, text=True,
    )
    assert result.returncode != 0
    assert "Missing required" in result.stderr
    assert output.read_text() == "previous publication"


def test_cli_rejects_overwriting_input(parquet: Path) -> None:
    before = parquet.read_bytes()
    result = subprocess.run(
        [sys.executable, str(EXPORTER), str(parquet), "--external", str(REFERENCE), "--output", str(parquet)],
        check=False, capture_output=True, text=True,
    )
    assert result.returncode != 0
    assert "Output must not overwrite an input" in result.stderr
    assert parquet.read_bytes() == before

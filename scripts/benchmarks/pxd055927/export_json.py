# /// script
# requires-python = ">=3.13"
# dependencies = ["duckdb==1.5.5", "pydantic==2.13.5"]
# ///
"""Export the PXD055927 comparison, not a general benchmark import.

Preserved from DeepMSFlow datasets/bion-semi-specific-pxd055927/export_json.py.
The original calculation and strict data contract are retained.
"""

import argparse
import hashlib
import json
from pathlib import Path
from typing import Annotated, Literal

import duckdb
from pydantic import BaseModel, ConfigDict, Field, model_validator

Count = Annotated[int, Field(strict=True, ge=0)]
Finite = Annotated[float, Field(allow_inf_nan=False, ge=0)]
DOSES_NM = (0, 0.1, 1, 10, 100, 1000, 10000, 50000)
INPUT_COLUMNS = {
    "filename",
    "modified_sequence",
    "precursor_charge",
    "precursor_qvalue",
    "is_decoy",
    "precursor_class",
    "ms2_quantity",
    "protein_accession",
}


class Record(BaseModel):
    """Strict JSON boundary, including rejection of misspelled fields."""

    model_config = ConfigDict(extra="forbid")


class Source(Record):
    """Provenance retained with every tool's metrics."""

    title: str
    url: str
    sha256: str | None = None


class CvSummary(Record):
    """Peptide-by-dose CV distribution, in fractions rather than percentages."""

    n: Annotated[int, Field(strict=True, gt=0)]
    peptide_count: Annotated[int, Field(strict=True, gt=0)]
    q1: Finite
    median: Finite
    q3: Finite
    lowerfence: Finite
    upperfence: Finite

    @model_validator(mode="after")
    def check_distribution(self) -> "CvSummary":
        """Reject inconsistent sample counts or unordered box statistics."""
        if self.n != self.peptide_count * 8:
            raise ValueError("CV n must equal complete-case peptide count times eight doses")
        if not self.lowerfence <= self.q1 <= self.median <= self.q3 <= self.upperfence:
            raise ValueError("CV box statistics must be ordered")
        return self


class Specificity(Record):
    """Two plotted slices and separately retained, unplotted exclusions."""

    specific: Count
    semi_specific: Count
    non_specific_excluded: Count
    unmapped_excluded: Count
    method: str


class RunCount(Record):
    """One of the 24 explicitly mapped runs; dose is not a replicate ID."""

    filename: str
    dose_nm: Finite
    biological_replicate: Literal[1, 2, 3]
    precursors: Count


class ConditionCv(Record):
    """Within-dose peptide CV over three positive biological replicates."""

    dose_nm: Finite
    n: Annotated[int, Field(strict=True, gt=0)]
    median: Finite


class ConditionDetection(Record):
    """Identified precursor union and three-replicate intersection at one dose."""

    dose_nm: Finite
    precursor_count: Annotated[int, Field(strict=True, gt=0)]
    complete_count: Count

    @model_validator(mode="after")
    def check_intersection(self) -> "ConditionDetection":
        """Reject an intersection larger than the identified union."""
        if self.complete_count > self.precursor_count:
            raise ValueError("Complete precursor count cannot exceed the condition union")
        return self


class ToolData(Record):
    """Plot-ready data for one workflow, with comparison limitations attached."""

    tool: Literal["SynapSpec", "FragPipe + DIA-NN", "Spectronaut"]
    software_version: Annotated[str, Field(min_length=1)] | None = None
    entry_method: Literal["parquet_computed", "manual_transcription"]
    sources: list[Source]
    peptide_count: Count
    precursor_count: Count
    protein_accession_count: Count | None
    identification_scope: str
    cv: CvSummary
    cv_method: str
    specificity: Specificity
    per_run: list[RunCount] | None
    caveats: list[str]
    detection_frequency: list[Count] | None
    condition_cv: list[ConditionCv] | None
    condition_detection: list[ConditionDetection] | None

    @model_validator(mode="after")
    def check_specificity_total(self) -> "ToolData":
        """Reject a pie partition that does not reconcile with its source total."""
        values = self.specificity
        total = values.specific + values.semi_specific + values.non_specific_excluded + values.unmapped_excluded
        if total != self.precursor_count:
            raise ValueError("Specificity slices plus exclusions must equal precursor_count")
        if not self.sources or not self.caveats:
            raise ValueError("Sources and comparison caveats are required")
        if self.detection_frequency is not None:
            if len(self.detection_frequency) != 24 or sum(self.detection_frequency) != self.precursor_count:
                raise ValueError("Detection frequency must partition precursors across 24 runs")
        if self.condition_cv is not None and [item.dose_nm for item in self.condition_cv] != list(DOSES_NM):
            raise ValueError("Condition CV must contain all eight doses in order")
        if self.condition_detection is not None:
            if [item.dose_nm for item in self.condition_detection] != list(DOSES_NM):
                raise ValueError("Condition detection must contain all eight doses in order")
            if any(item.precursor_count > self.precursor_count for item in self.condition_detection):
                raise ValueError("Condition precursor union cannot exceed the overall union")
        return self


class Comparison(Record):
    """Dedicated static JSON input for the PXD055927 page, not the LFQ schema."""

    dataset: Literal["bion-semi-specific-pxd055927"] = "bion-semi-specific-pxd055927"
    status: Literal["reference_comparison_not_matched_benchmark"] = "reference_comparison_not_matched_benchmark"
    tools: list[ToolData]

    @model_validator(mode="after")
    def check_tools(self) -> "Comparison":
        """Require each of the three intended workflows exactly once."""
        if [tool.tool for tool in self.tools] != ["SynapSpec", "FragPipe + DIA-NN", "Spectronaut"]:
            raise ValueError("Expected SynapSpec, FragPipe + DIA-NN, and Spectronaut in that order")
        return self


def _prepare_source(connection: duckdb.DuckDBPyConnection, parquet: Path) -> None:
    columns = {
        column[0] for column in connection.execute("DESCRIBE SELECT * FROM read_parquet(?)", [str(parquet)]).fetchall()
    }
    if missing := INPUT_COLUMNS - columns:
        raise ValueError(f"Missing required parquet columns: {sorted(missing)}")
    connection.execute("CREATE TABLE source AS SELECT * FROM read_parquet(?)", [str(parquet)])
    invalid = connection.execute("""
        SELECT count(*) FROM source WHERE filename IS NULL OR modified_sequence IS NULL
        OR modified_sequence = '' OR precursor_charge IS NULL OR precursor_charge <= 0
        OR is_decoy IS NULL OR precursor_qvalue IS NULL OR NOT isfinite(precursor_qvalue)
        OR precursor_qvalue < 0 OR precursor_qvalue > 1
    """).fetchone()[0]
    if invalid:
        raise ValueError(f"Invalid required values in {invalid} source rows")
    samples = [
        (f"Elmo_20230331_TKO_HSdia_{letter}{dose_index}", dose, replicate)
        for replicate, letter in enumerate("ABC", 1)
        for dose_index, dose in enumerate(DOSES_NM, 1)
    ]
    if {row[0] for row in connection.execute("SELECT DISTINCT filename FROM source").fetchall()} != {
        row[0] for row in samples
    }:
        raise ValueError("Expected exactly the 24 PXD055927 A1-C8 run names")
    connection.execute("CREATE TABLE samples(filename VARCHAR, dose_nm DOUBLE, biological_replicate INTEGER)")
    connection.executemany("INSERT INTO samples VALUES (?, ?, ?)", samples)
    connection.execute("CREATE TABLE hits AS SELECT * FROM source WHERE NOT is_decoy AND precursor_qvalue < 0.01")
    duplicate_count = connection.execute("""
        SELECT count(*) FROM (
            SELECT filename, modified_sequence, precursor_charge FROM hits
            GROUP BY ALL HAVING count(*) > 1
        )
    """).fetchone()[0]
    if duplicate_count:
        raise ValueError("Duplicate run / modified sequence / charge hits; cannot safely sum quantities")
    invalid_quantity = connection.execute("""
        SELECT count(*) FROM hits WHERE ms2_quantity < 0
        OR (ms2_quantity IS NOT NULL AND NOT isfinite(ms2_quantity))
    """).fetchone()[0]
    if invalid_quantity:
        raise ValueError("Negative or non-finite quantities in retained hits")
    connection.execute("""
        CREATE TABLE classes AS SELECT DISTINCT modified_sequence, precursor_charge, precursor_class FROM hits
    """)
    invalid_class = connection.execute("""
        SELECT count(*) FROM classes WHERE precursor_class IS NULL
        OR precursor_class NOT IN ('specific', 'semi_specific')
    """).fetchone()[0]
    ambiguous_class = connection.execute("""
        SELECT count(*) FROM (
            SELECT modified_sequence, precursor_charge FROM classes GROUP BY ALL HAVING count(*) > 1
        )
    """).fetchone()[0]
    if invalid_class or ambiguous_class:
        raise ValueError("Unknown or inconsistent precursor_class for a precursor identity")


def _cv_summary(connection: duckdb.DuckDBPyConnection) -> CvSummary:
    connection.execute("""
        CREATE TABLE peptide_quantities AS
        SELECT modified_sequence, filename, sum(ms2_quantity) AS quantity FROM hits
        WHERE ms2_quantity > 0 GROUP BY ALL;
        CREATE TABLE complete_peptides AS
        SELECT modified_sequence FROM peptide_quantities GROUP BY ALL HAVING count(*) = 24;
        CREATE TABLE cv_values AS
        SELECT modified_sequence, dose_nm, stddev_samp(quantity) / avg(quantity) AS cv
        FROM peptide_quantities JOIN complete_peptides USING(modified_sequence) JOIN samples USING(filename)
        GROUP BY ALL HAVING count(*) = 3
    """)
    count, first, median, third = connection.execute("""
        SELECT count(*), quantile_cont(cv, 0.25), median(cv), quantile_cont(cv, 0.75) FROM cv_values
    """).fetchone()
    if not count:
        raise ValueError("No peptides with positive quantities in all 24 runs; complete-case CV is unavailable")
    lower, upper = connection.execute(
        """
        SELECT min(cv) FILTER(WHERE cv >= ?), max(cv) FILTER(WHERE cv <= ?) FROM cv_values
    """,
        [first - 1.5 * (third - first), third + 1.5 * (third - first)],
    ).fetchone()
    return CvSummary(
        n=count, peptide_count=count // 8, q1=first, median=median, q3=third, lowerfence=lower, upperfence=upper
    )


def summarize_synapspec(parquet: Path) -> ToolData:
    """Compute filtered counts and dose-matched CV from the supplied parquet.

    Parameters
    ----------
    parquet
        PXD055927 precursors.parquet with the 24 named input runs.

    Returns
    -------
    ToolData
        JSON-compatible measurements with native classification and provenance.

    Raises
    ------
    ValueError
        Required values, sample coverage, identity uniqueness, or class consistency fail.
    """
    parquet = Path(parquet).resolve(strict=True)
    with parquet.open("rb") as source_file:
        digest = hashlib.file_digest(source_file, "sha256").hexdigest()
    with duckdb.connect() as connection:
        _prepare_source(connection, parquet)
        peptide_count, precursor_count, protein_count = connection.execute("""
            SELECT count(DISTINCT modified_sequence), count(DISTINCT (modified_sequence, precursor_charge)),
                   count(DISTINCT protein_accession) FROM hits
        """).fetchone()
        class_counts = dict(connection.execute("SELECT precursor_class, count(*) FROM classes GROUP BY ALL").fetchall())
        per_run = [
            RunCount(filename=filename, dose_nm=dose, biological_replicate=replicate, precursors=count)
            for filename, dose, replicate, count in connection.execute("""
                       SELECT filename, dose_nm, biological_replicate, count(hits.modified_sequence)
                       FROM samples LEFT JOIN hits USING(filename) GROUP BY ALL ORDER BY filename
                   """).fetchall()
        ]
        cv = _cv_summary(connection)
        detection_counts = dict(connection.execute("""
            SELECT detected, count(*) FROM (
                SELECT count(*) AS detected FROM hits
                GROUP BY modified_sequence, precursor_charge
            ) GROUP BY detected
        """).fetchall())
        detection_frequency = [detection_counts.get(index, 0) for index in range(1, 25)]
        condition_detection = [
            ConditionDetection(dose_nm=dose, precursor_count=total, complete_count=complete)
            for dose, total, complete in connection.execute("""
                SELECT dose_nm, count(*), count(*) FILTER(WHERE detected = 3) FROM (
                    SELECT dose_nm, modified_sequence, precursor_charge, count(*) AS detected
                    FROM hits JOIN samples USING(filename) GROUP BY ALL
                ) GROUP BY dose_nm ORDER BY dose_nm
            """).fetchall()
        ]
        condition_cv = [
            ConditionCv(dose_nm=dose, n=count, median=median)
            for dose, count, median in connection.execute("""
                SELECT dose_nm, count(*), median(cv) FROM (
                    SELECT modified_sequence, dose_nm, stddev_samp(quantity) / avg(quantity) AS cv
                    FROM peptide_quantities JOIN samples USING(filename)
                    GROUP BY ALL HAVING count(*) = 3
                ) GROUP BY dose_nm ORDER BY dose_nm
            """).fetchall()
        ]
    return ToolData(
        tool="SynapSpec",
        entry_method="parquet_computed",
        sources=[
            Source(
                title="precursors.parquet · commit 1a430b80",
                url="http://clearml.bionsight.internal:8080/projects/*/tasks/c61cec4b479644f188a360c3575638a3",
                sha256=digest,
            )
        ],
        peptide_count=peptide_count,
        precursor_count=precursor_count,
        protein_accession_count=protein_count,
        detection_frequency=detection_frequency,
        condition_cv=condition_cv,
        condition_detection=condition_detection,
        identification_scope="Unique modified sequences and sequence/charge pairs in target hits with precursor_qvalue < 0.01",
        cv=cv,
        cv_method="Sum positive ms2_quantity over charges per modified sequence/run; retain peptides positive in all 24 runs; sample SD/mean across A/B/C at each dose; pool eight doses. No additional normalization or imputation.",
        specificity=Specificity(
            specific=class_counts.get("specific", 0),
            semi_specific=class_counts.get("semi_specific", 0),
            non_specific_excluded=0,
            unmapped_excluded=0,
            method="Native precursor_class, not reclassified against the public FASTA",
        ),
        per_run=per_run,
        caveats=[
            "Native precursor classes are not harmonized with the external FASTA-derived classes.",
            "CV uses each tool's own complete-case peptides, not a shared peptide intersection.",
            "Protein accessions are not harmonized protein groups; do not compare protein totals across tools.",
            "C1 has fewer retained precursors; it is included, not silently excluded.",
        ],
    )


def main() -> None:
    """Write one static comparison JSON, failing before output on invalid input."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("parquet", type=Path)
    parser.add_argument("--external", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    arguments = parser.parse_args()
    output = arguments.output.resolve()
    if output in {arguments.parquet.resolve(), arguments.external.resolve(), Path(__file__).resolve()}:
        raise ValueError("Output must not overwrite an input or the exporter")
    external = [ToolData.model_validate(item) for item in json.loads(arguments.external.read_text())]
    comparison = Comparison(tools=[summarize_synapspec(arguments.parquet), *external])
    output.write_text(comparison.model_dump_json(indent=2) + "\n")
    print(output)


if __name__ == "__main__":
    main()

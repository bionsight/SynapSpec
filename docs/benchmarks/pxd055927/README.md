# Updating PXD055927 data — instructions for AI assistants

Aggregate a new SynapSpec `precursors.parquet`, combine it with the prepared external
reference JSON, and update `site/data/pxd055927/comparison.json`.
Follow these instructions from the website repository root.

```text
site/data/pxd055927/
  external_reference.json  # Paper-derived references for PXD055927 only
  comparison.json          # Published results and the actual SynapSpec analysis version
```

## External reference sources

- FragPipe + DIA-NN: Koudelka et al. 2025, [Supplementary Table S5 · Direct MSF](https://ars.els-cdn.com/content/image/1-s2.0-S153594762500043X-mmc5.xlsx).
  This workflow combines FragPipe/MSFragger identification with DIA-NN quantification;
  it is not a standalone DIA-NN result.
- Spectronaut: [Supplementary Table S6 · Direct SN](https://ars.els-cdn.com/content/image/1-s2.0-S153594762500043X-mmc6.xlsx) from the same paper.
- External specificity values come from prior exploratory mapping against the
  [FASTA submitted with PXD055927](https://ftp.pride.ebi.ac.uk/pride/data/archive/2025/03/PXD055927/201015_Hs_CAN_uniprot-proteome_UP000005640_reviewed_yes_canonical_ProteinaseK_LysC.fasta).

The reference JSON contains manually transcribed values calculated in a prior local
analysis of these sources. The current exporter does not reparse the paper's tables
or recalculate external results. Preserve source URLs, hashes, methods, and limitations
in `external_reference.json`. Identification scope, CV cohorts, and specificity
classification methods are not fully harmonized across workflows.

## Scope

- Reuse the existing **PXD055927-specific exporter** for SynapSpec calculations.
- Accept FragPipe + DIA-NN and Spectronaut results as external reference JSON with
  provenance. Preserve their values and methods when updating SynapSpec only.
- `external_reference.json` is **specific to PXD055927**, despite its generic filename.
  Do not reuse it for another dataset. Other datasets require separate reference JSON
  obtained and validated from their own papers or public data.
- Do not create a general-purpose paper parser, parquet converters for other tools,
  or another merge script. Extract or recalculate external results only when requested.
- The website's `scripts/manage_benchmarks.py from-parquet` is LFQ-specific.
  Do not assign an LFQ preset to PXD055927 or calculate A/B ratios.
- Deliver the publication JSON and a change/validation summary. Commit, push, create
  PRs, or deploy only within the authorized scope.

## 1. Inspect inputs and current state

Read applicable `AGENTS.md` instructions, inspect `git status` and the current publication
JSON, and preserve user changes. Obtain the following inputs without asking again for
information already confirmed in the conversation or supplied artifacts.

| Input | Required information |
| --- | --- |
| New SynapSpec parquet | Actual local file containing the same 24 PXD055927 runs |
| New run provenance | ClearML task or other source-record URL, analysis code commit |
| PXD055927 external reference JSON | Workflow values, sources, methods, and comparison limitations |
| Update target | `site/data/pxd055927/comparison.json` in the website repository |

Record the actual analysis version in `comparison.json` as `synapspec_version`.
The user confirmed `v0.12.1` for the current result. The source label and current
Run history entry derive their version and precursor count from this same JSON;
there is no separate history file to keep in sync. Do not synchronize the recorded
version with the website header's latest release. Unconfirmed dates, runtimes, and
resources remain `null`; internal ClearML links are not displayed in the public UI.

The current page shows one entry derived from the current comparison snapshot.
Replacing that snapshot updates the entry; it does not automatically append or archive
older runs. Preserve previous snapshots and corresponding detail routes before extending
the page to show multiple historical runs.

The exporter and its regression tests are included in this repository. They were
preserved from the DeepMSFlow analysis workspace's
`datasets/bion-semi-specific-pxd055927/` directory. No separate analysis checkout is
required: use this repository, the local parquet, and `uv`. Do not substitute the LFQ exporter.

```text
scripts/benchmarks/pxd055927/
  export_json.py
  test_export_json.py
```

Read the exporter to confirm the current input contract.
Unless a separate external reference is supplied, compare the website's
`site/data/pxd055927/external_reference.json` with the two external workflow objects
in the current publication JSON. If they differ, establish which reference is approved
from the change history or the user. Do not choose by date or file location alone.

## 2. Calculate SynapSpec results

The current exporter assumes:

- Exactly 24 sample names, `Elmo_20230331_TKO_HSdia_A1` through `C8`.
  A/B/C identify biological replicates; 1–8 identify doses.
- Required columns: `filename`, `modified_sequence`, `precursor_charge`,
  `precursor_qvalue`, `is_decoy`, `precursor_class`, `ms2_quantity`, `protein_accession`.
- Identification: target hits with `precursor_qvalue < 0.01`.
  Deduplicate peptides by modified sequence and precursors by modified sequence + charge.
- CV: sum positive MS2 quantities over charges, retain peptides quantified in all
  24 runs, calculate sample SD / mean across the three replicates at each dose,
  and pool the results across eight doses.
- Specificity: use SynapSpec's native `precursor_class`.

Report failures caused by different filenames or sample layouts, missing required
columns, duplicate hits, unknown classes, or the absence of valid CV samples.
Do not relax validation or fill missing values with zero to make the export succeed.
Changes to the experimental design or metric definitions are outside this update procedure.

Run the existing exporter with the actual parquet path and the reference confirmed in
step 1. Create a temporary candidate instead of overwriting the publication JSON.
`uv` uses the Python version and dependencies declared by the exporter.

```bash
PXD_CANDIDATE_DIR=$(mktemp -d)
uv run --no-project scripts/benchmarks/pxd055927/export_json.py \
  /absolute/path/to/precursors.parquet \
  --external site/data/pxd055927/external_reference.json \
  --output "$PXD_CANDIDATE_DIR/comparison.json"
```

This command calculates SynapSpec results and combines them with the two external
workflow objects in one JSON file. It does not reparse or recalculate the external
paper data. No separate merge program is needed.

## 3. Update run provenance and preserve external references

Add or update the top-level `synapspec_version` with the confirmed analysis version
(for example, `v0.12.1`). The exporter does not generate this website metadata field.

The current exporter hardcodes provenance for the previous SynapSpec commit
`1a430b80` and ClearML task `c61cec4b479644f188a360c3575638a3`.
**Providing a new parquet file does not automatically update that provenance.**

Update the candidate's SynapSpec `sources[].title` and `sources[].url` using confirmed
information for the new run. Preserve `sources[].sha256`, which the exporter computes
from the new parquet, and verify it against the actual input. Reassess the previous
run's C1 identification-count caveat against the new `per_run` results.
Do not change calculated results to match previous values.

Keep the external workflow names as `FragPipe + DIA-NN` and `Spectronaut`.
Do not relabel FragPipe + DIA-NN as standalone DIA-NN.
Preserve external values, `sources` and source hashes, `identification_scope`,
`cv_method`, specificity methods, `caveats`, and `entry_method` exactly in meaning
relative to the selected reference JSON.

## 4. Validate the candidate JSON

Run the local calculation and failure-path regression tests. They use synthetic
parquet fixtures, not fixed values from the published SynapSpec result.

```bash
uv run --no-project --python 3.13 \
  --with duckdb==1.5.5 --with pydantic==2.13.5 --with pytest==8.4.2 \
  pytest scripts/benchmarks/pxd055927/test_export_json.py -q
```

After editing provenance, validate `synapspec_version` as a non-empty string containing
the confirmed analysis version. Exclude only this website metadata field from the object
passed to the exporter's strict `Comparison` / `ToolData` Pydantic models; retain it in
the final publication JSON. Do not loosen the exporter's schema. Schema validation alone does not establish
source accuracy or scientific comparability. Also verify:

- `dataset` is `bion-semi-specific-pxd055927` and `status` is
  `reference_comparison_not_matched_benchmark`.
- `tools` contains SynapSpec, FragPipe + DIA-NN, and Spectronaut exactly once, in that order.
- SynapSpec identification counts and per-file values match the new parquet aggregation.
  Summing precursor counts across 24 files is not equivalent to counting unique precursors.
- The two external workflow objects are semantically identical to the selected reference.
  Formatting and indentation differences are acceptable.
- CV values are fractions: `0.15` is displayed as `15%`.
  `cv.n` counts peptide × dose observations and must equal `cv.peptide_count × 8`.
- `lowerfence` / `upperfence` are the actual minimum/maximum within the 1.5 IQR fences,
  not p5/p95.
- `specific + semi_specific + non_specific_excluded + unmapped_excluded` equals
  the precursor total. The pie denominator is `specific + semi_specific`;
  excluded identities do not belong in the pie.
- External `per_run` and `protein_accession_count` values of `null` mean unavailable.
  Do not replace them with zero or SynapSpec values.
- Preserve the limitations arising from different CV peptide cohorts and specificity
  methods. Do not describe this as a matched-condition performance ranking.

Distinguish floating-point rounding differences between repeated calculations from
actual metric changes. Source hashes and integer counts must match exactly.
Report any tolerance used for floating-point comparisons. Historical expected values
in existing tests are not target values that a new run must reproduce.

## 5. Update the website and report results

Apply the validated candidate to `site/data/pxd055927/comparison.json`.
A data update that preserves the JSON contract does not require chart code changes.
Do not add raw parquet files, temporary candidate directories, or large external source
files to the website repository.

Run the following from the website root, then inspect the PXD055927 tab at
`/benchmarks/` and the detail page at `/benchmarks/bion-semi-specific-pxd055927/`.

```bash
npm run check
npm run build
```

Run the relevant browser tests as well. Actual chart values for all three workflows,
CV percentage formatting, pie exclusions, and source links must match the candidate.
Preserving detailed provenance, methods, and per-file records in JSON does not require
displaying them all. Do not add explanatory cards, summary tables, or per-file tables
as part of a data update. Existing LFQ validation commands alone do not validate this
dataset-specific JSON.

Report the new parquet's provenance and hash, changed SynapSpec metrics, external
reference preservation, validation results, and unresolved questions. Distinguish
local file updates from actual website deployment.

## Example request for an AI assistant

> Read docs/benchmarks/pxd055927/README.md and update the PXD055927 data.
> The new SynapSpec parquet is [path], the run source is [task URL], and the code commit is [SHA].
> The analysis version is [vX.Y.Z]. Record this run's actual version, not the website header version.
> Store it in comparison.json as synapspec_version; the UI and current Run history entry derive from that file.
> Preserve the external workflows in site/data/pxd055927/external_reference.json.
> Do not mix references from another dataset or reuse these references for another dataset.
> Use the existing dedicated exporter to calculate and combine the publication JSON, then report validation results.
> Do not create a general-purpose script or reanalyze the external paper data. Do not commit or deploy.

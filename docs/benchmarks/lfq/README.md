# Updating LFQ benchmark sources

Use this procedure when an AI agent receives new local reports. Do not create a
general converter for every vendor export. Keep raw reports outside the repository.

## Current references

| Dataset | Tool | Supplied archive/report | Catalog reference |
| --- | --- | --- | --- |
| PXD028735 | DIA-NN 2.0.2 | `PXD028735_diann_v202_spectronaut_v19_7.tar.gz`, `diann_v202/report.parquet` and `report.tsv` | `pxd028735-diann-v202` |
| PXD028735 | Spectronaut 19.7 | Same archive, `spectronaut_v19_7/20250219_LFQ_Orbitrap_AIF_Alpha_directdia_Report_Piazza2020-202210.parquet` | `pxd028735-spectronaut` |
| ProteoBench 2 Th | DIA-NN 2.5.0 | `200c98108a367991eb6d1b4cf867d5a617d62f10_data.zip`, `input_file.parquet` | `proteobench-2th-diann-v250` |
| ProteoBench 2 Th | Spectronaut 21 | `790d6197bc6972036a5cfa9907d3249bf978fe45_data.zip`, `input_file.tsv` | `proteobench-2th-spectronaut-v21` |

The supplied SynapSpec files were `precursors (3).parquet` for PXD028735 and
`precursors (4).parquet` for ProteoBench. Their six filenames, per-file counts,
union counts and detection histograms match the existing v0.12.4 records. Their
SHA256 digests are stored in each recorded run's `condition_cv`. Filenames alone
do not establish an executable version; preserve the recorded run provenance.

The old `pxd028735-diann` and `proteobench-2th-astral-diann` imports remain available
as historical sources. The latter uses `20250206_OA_OP_LFQBench_*`, not the current
`LFQ_Astral_DIA_15min_50ng_*` inputs. Do not combine either old snapshot's counts
with the newly supplied reports' CV or LFQ ratios.

## Calculation and update procedure

1. Inspect the archive, report schema and analysis log. Confirm tool version and
   exact filenames against `recorded_runs[slug].recorded_run.files`. Record source
   member names and SHA256. Do not publish local usernames or machine paths.
2. Select target precursor q-value < 0.01. Identify precursors by modified sequence
   and charge. Collapse repeated fragment rows only after verifying their precursor
   quantities agree. Count a detected row even when its quantity is missing.
3. Build the 1–6 detection histogram and reconcile its sum with the union count.
   Overview completeness is the six-run bin divided by that same union.
4. Calculate A/B CV separately: require positive finite precursor quantities in all
   three condition replicates, compute sample SD / mean, then median. Use source
   normalized quantities (`ms2_quantity`, DIA-NN `Precursor.Normalised`, or
   Spectronaut `FG.Quantity`). Do not add normalization, zero filling or imputation.
5. Detailed CV is a different statistic: sample SD / mean across all six runs,
   skipping missing quantities. Preserve p5, p25, median, p75 and p95. For protein
   CV, pivot the source protein group quantity with max per group/run; DIA-NN's
   `PG.MaxLFQ` is available in the original report, not the normalized PXD Parquet.
6. LFQ uses mean linear quantity per condition, then `log2(mean(A)/mean(B))` and
   `log2(mean(B))`. Retain single-species identities. For ProteoBench external
   reports, use the accompanying `result_performance.csv` for eligible precursor
   identities and species assignments, joined to the same filtered original
   report quantities. Do not copy its `log2_A_vs_B`: it averages in log space.
   The Spectronaut result table excludes 1,542 original precursor identities;
   its 138,624 rows are not the original report's 140,166 identified precursors.
7. Update `tool_diagnostics` (including `condition_cv`), `tool_ratios`,
   `tool_quartiles`, and `tool_sources` together. Use a new reference slug for a
   different analysis instead of changing an existing ClearML import's identity.
   Update ledger `toolReferences` and add its imported entry route. Store the
   source's version and date, not the website version.
8. Generate `site/public/data/benchmarks/scatter-{reference-slug}.json` from the
   same LFQ points (x/y rounded to three decimals). Regenerate both detail images
   for affected recorded runs with `scripts/render_scatter_images.py --slug SLUG`
   and `scripts/render_density_images.py --slug SLUG`. Updating JSON alone does
   not update these static images.
9. Run `npm run check`, `npm run build`, and the benchmark E2E checks. Inspect both
   overview tabs and their detail pages: all three tools, CV distribution boxes, hover labels,
   LFQ ratios, source links and input files must agree with the selected sources.

The overview and detail page read the same catalog references. Do not edit the
archived comparison JSON merely to make the current overview look complete.
Both views render CV through `CvDistributionWidget.astro`, using the same precursor
and protein distributions across all six files. Condition A/B CV remains stored
in JSON but is not the displayed overview metric.

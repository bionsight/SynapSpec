# Archived LFQ comparisons

These are exploratory comparisons of archived reports, not current-release rankings.
Validated with DeepMSFlow parser commit `7c505601a6d2b9ec28f1f815e0c57bd3adebdc5f` on 2026-09-08.
Two internal experiments each have matching input stems across three tools (A/B, three replicates each).
They are not asserted to be PXD028735. Exact releases, settings/FASTA, MBR configuration,
execution dates, hardware and runtime have not been fully reconciled. No analysis engine was rerun.

## Reproduce

Use a DeepMSFlow Python environment with pandas, pyarrow, matplotlib, and its instrumentation dependencies.
For the notebook, also install nbformat, nbclient and ipykernel in an appropriate environment.

```
PYTHONPATH=/path/to/DeepMSFlow/instrumentation python export_comparison.py /path/to/extracts /new/output/directory
python audit_inputs.py /path/to/extracts --output /new/audit.json
python -m unittest discover -s . -p 'test_audit.py'
```

The notebook uses `BENCHMARK_INPUTS`, `BENCHMARK_SCRIPTS` (this directory), and `DEEPMSFLOW_ROOT`.
It writes a fresh temporary output directory each execution. Preserve outputs before deleting temporary files.
Never commit input parquet files, source manifests, or `provenance.private.json` to the public site.

Inputs are six files named `{202409,202502}-{synapspec,diann,spectronaut}.parquet`, plus `manifest.json`.
The source manifest records the original report path, byte size, mtime, row counts, selected columns and extract name.
Extracts retain relevant identity, q-value, decoy, protein annotation and quantity columns; exact duplicate
projected rows were removed. No q-value filtering was applied during extraction.
Use explicit archived paths, not recursive discovery or `synapspec_latest`: the OE480 latest link loops.

## Definitions and checks

- Precursor IDs: unique exact modified-sequence/charge pairs, after precursor q-value < 0.01 and decoy == false.
- Input audit blocks missing required columns, null keys, empty filtered reports and conflicting MS2 quantities per run/key.
- Per-file counts are checked independently using both combined keys and distinct sequence/charge tuples.
- Completeness: IDs detected in all six files divided by the tool's own identified population.
- CV: sample standard deviation / mean, percent, within A or B; only finite positive quantities in all three replicates.
- LFQ ratios reuse `parsers.lfq.prepare_lfq_dataframe` and `get_lfq_quantification` at precursor MS2 level.
  Means use observed values; A and B means must be positive. Mixed species are excluded.
  Targets follow existing BION presets: HUMAN 0, YEAS8 1, ECOLI -2 in log2(A/B).
- Pairwise overlaps match exact sequence/charge tuples. Pairwise counts cannot be summed.
- Reported protein entities retain source-specific grouping and are not displayed as a cross-tool score.
- Separate MBR reports are excluded. No assertion about the base report's MBR setting is made.

The two summary PNGs and JSON are generated from the same calculations. Retention-time comparisons are omitted
because cross-tool RT units/calibration have not been validated. This export is not a reproduction of every
EXP169 notebook panel; it focuses on identification, completeness, within-condition CV, overlap and LFQ.

The 2026-09-07 recorded run and the historical archive remain unchanged. New comparison pages retain
noindex/nofollow and sitemap exclusions. The prerender filter excludes image URLs because crawling binary
PNG downloads as page text corrupts their first byte. Verify built PNG bytes against the source after each build.

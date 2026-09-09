# ClearML history imports — 2026-09-08

Three completed tasks were read directly in the authenticated ClearML browser. Source project: DeepMSFlow / lfq / astral. No credentials or internal server URLs are exported to the site.

| Task ID | Commit label | Started (display) | Completed (display) | INFO run time | Summary total_precursors | Summary total_proteins |
| --- | --- | --- | --- | --- | --- | --- |
| 233d29931f8e41699ddb04875ef56250 | b4de5599 | 2026-09-07 17:25 | 2026-09-07 23:35 | 6:09h | 259474 | 19464 |
| 19787e7d28ad4710818c95e6abff33a8 | 34879e5b | 2026-09-07 16:30 | 2026-09-07 23:51 | 7:21h | 275106 | 20917 |
| 797be92685ea4868b48bd0ed9174b90a | 9897b894 | 2026-09-06 21:04 | 2026-09-07 03:39 | 6:34h | 261436 | 20117 |

Verification for each task:

- INFO: Completed status, full task ID, start/completion display times and elapsed duration.
- CONFIGURATION / bion_lfq_astral.yaml: all six 20250206_OA_OP_LFQBench A/B R1–R3 RAW filenames and recorded configuration match the imported definition.
- PLOTS / Summary / summary: total_precursors and total_proteins, read from rendered tables. These are not sums of per-file counts or the species-filtered lfq_counts total.
- Task labels: commit and artifact labels; resource instance:c7i.8xlarge. These are not release or hardware attestations.

INFO time is preserved at source precision, not recomputed from minute-rounded timestamps. Tool-only Runtime differs (e.g. 26324.50 seconds for 34879e5b); history uses INFO task elapsed time consistently for these imports. The browser display clock's timezone was not independently recorded.

All configurations use the same napedro three-species FASTA, generated library, Trypsin/P, missed cleavages 2, maximum variable modifications 5, length 7–52, charge 1–6, MBR true, seed 42, differential analysis true, condition-aware precursor correction true, quantity level pg. Effective defaults and file checksums remain unverified.

The 34879e5b console mentions loading comparator report rows and producing comparison plots. Those row counts are not unique precursor counts. Competitor results have not been extracted/reconciled here and remain null, rather than copied from the archived bundle. No new six-panel comparison PNG is asserted by this import.

Quality checks: unique task IDs and slugs; six unique matching filenames; positive counts/durations; newest start first including same-day runs; archived comparison stays undated; OE480 unchanged; source detail routes remain noindex and excluded from sitemap. Tests cover ledger membership, counts, ordering and missing comparator values.

## Run-detail figure

For task 797be92685ea4868b48bd0ed9174b90a (9897b894), DEBUG SAMPLES / all_plots_summary / iteration 0 was downloaded through the authenticated browser on 2026-09-08. Original JPEG, 4838 × 5121, stored as public/images/benchmarks/2026-09-06-9897b894.jpeg. Its identification plot reports SynapSpec 261,436, matching this run's summary. The original composite includes three-tool report comparisons and is not the six-panel archived figure. No crops, regenerated values or reused archived results were substituted. Other new runs have no imported figure and omit this section. Source plotting definitions and comparator settings remain unreconciled.

History dates link directly to distinct detail routes. Existing historical single-tool charts and archived comparison figures remain on their own detail pages.

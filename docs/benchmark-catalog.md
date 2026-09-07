# Benchmark catalog implementation

Based on proposal O's revised dataset index → run detail → dataset history structure. Uses feat/benchmark-board's existing Header, Footer, 1120 px container, system fonts, Petrol palette and UI primitives. No prototype header, copied CSS reset, or global token changes.

The catalog is not an inventory of all usable datasets. LFQBench/Astral has one manually verified run; LFQBench/OE480 and ProteoBench 2 Th/Astral are existing DeepMSFlow presets whose results have not been imported. No zero or synthetic result is substituted. Adding a verified run requires updating src/data/benchmark-catalog.ts and its evidence, not merely changing the availability label.

## Evidence

ClearML inspected through the user's Chrome tab on 2026-09-07. Project DeepMSFlow/lfq/astral, task 7f01de2de2cb4ba3a162728c3304473a, commit 5d12a532, artifact da4baf4d. Internal server links and filesystem paths are not included in the client page.

- INFO: completed; start 2026-09-07 00:59, end 06:28, runtime 5:29h. Timezone not established; retain source display label.
- Resource: instance:c7i.8xlarge tag, not INFO host CPU/memory (those disagree with the tag).
- Summary: total_precursors 252078, total_proteins 19671. Protein grouping semantics remain unverified; do not label this a protein-group count.
- Per-file precursor counts A_R1 through B_R3: 238452, 238003, 238445, 238198, 239372, 239578. Protein_accessions: 18519, 18481, 18470, 18462, 18548, 18561. Totals are not sums of file rows.
- Configuration: bion_lfq_astral.yaml; generated FASTA library, trypsin/p, missed cleavages 2, maximum variable modifications 5, length 7–52, charge 1–6, MBR enabled, seed 42. Differential analysis and condition-aware precursor correction enabled; quantity_level pg; parquet output. No verified FDR or release mapping.
- LFQ precursor ratios: mean(A)/mean(B), positive quantities in both conditions. Exact logged median and quartiles transcribed into ratioMeasurements. Targets log2(A/B): Human 0, Yeast 1, E. coli -2. Median deviation = (2 ** (median-target)-1)*100. Quartile bands are not confidence intervals or MAD bands. Outer 50% omitted.

The archive JSON and home-page example are unchanged. /benchmarks/history retains its 18 dated runs and links to the separately imported September record. Legacy run URLs remain valid. All new benchmark routes retain noindex,nofollow and explicit sitemap exclusions; existing site navigation is unchanged. This is not a deployment or release.

Validation: run `bun test tests/benchmark-catalog.test.ts` and `bun run build`; inspect generated sitemap for benchmark URLs. Browser QA should cover index filter, row/link navigation, pending datasets, ratio toggle, raw-file rows, archive links, browser back, unknown-run 404, and desktop/mobile layouts.

---
name: clearml-run-to-benchmarks-page
description: Take a completed DeepMSFlow ClearML run and reflect it on the SynapSpec Benchmarks page (site/data/benchmark_*.json). Use when a benchmark run (Argo or EC2) has finished and needs to show up at /benchmarks, or when asked to "add this run to the Benchmarks page" / "벤치마크 페이지에 반영해줘". Companion to DeepMSFlow's `argo-to-ec2-experiment` skill, which launches the run this one publishes.
allowed-tools: Bash, Read, Write, Edit, WebFetch
---

# ClearML run → Benchmarks page

Publishes a finished run. Does not launch anything and does not touch DeepMSFlow — that's
`argo-to-ec2-experiment` in the DeepMSFlow repo. This skill starts from a ClearML task ID/URL and
ends with the run visible at `/benchmarks/<slug>/`.

**Read `docs/BENCHMARK_DATA_MODEL.md` in full before editing anything.** It is the schema
authority for all six `site/data/benchmark_*.json` files — this skill only adds the operational
steps that doc doesn't cover (fetching the ClearML data, computing `release_version`, the
gotchas hit in practice). Do not duplicate its field tables here; if they drift, that doc wins.

## 1. Confirm the run is actually done and what it is

Get the ClearML task (URL looks like
`http://clearml.bionsight.internal:8080/projects/<project_id>/tasks/<task_id>/...`).

```python
from clearml.backend_api.session import Session
s = Session()
res = s.send_request('tasks', 'get_all', json={'id': [task_id], 'only_fields': ['id','name','status','tags']})
```

Status must be `completed` (not `in_progress`/`stopped`/`failed`). A task that shows
`completed` in ClearML can still be a false success — before trusting it, check the run's actual
output artifacts the way `argo-to-ec2-experiment` / PXD055927 monitoring does (`precursors.parquet`
etc. actually written), not just the ClearML phase.

From the task's tags (`bion-lfq-pxd028735-ec2`, `tag:v0.9.2`, etc.) work out: which dataset/preset,
which DeepMSFlow git tag or commit, which backend. This decides which `dataset_catalog` /
`recorded_runs` entry it belongs to.

## 2. Pull the report tables

Reuse `reported_tables()` from `scripts/fetch_benchmarks.py` (`task.get_reported_plots()`,
filtered to plotly table-shaped plots) rather than re-deriving the plot-parsing logic — it already
handles ClearML's `{"data": [{"header": ..., "cells": ...}]}` shape:

```python
from clearml import Task
import sys
sys.path.insert(0, "scripts")
from fetch_benchmarks import reported_tables

task = Task.get_task(task_id=task_id)
tables = reported_tables(task)
# tables["summary"], tables["stats"], tables["lfq_ratio_statistics"] — table name = plot variant
```

These three tables are the ones `BENCHMARK_DATA_MODEL.md` §"새 recorded run을 추가하는 절차"
step 1 refers to. Note `build_accuracy`/`build_files` in the same script build the
`benchmarks.json` (Astral-history) shape, which has different field names
(`target_log2_ratio`, `mad_from_target`) than `benchmark_catalog.json`'s `ratio_measurements`
(`target`, `median`, `axis.actual/relative`) — don't copy those two functions' output directly
into `benchmark_catalog.json`; recompute per the `ratio_measurements` formulas in the data-model
doc.

## 3. Decide recorded vs imported

- Has `lfq_ratio_statistics` (species accuracy) → **recorded**, full `RecordedBenchmark.astro`
  treatment, edit `benchmark_catalog.json` + `benchmark_entries.json`.
- Only has `summary` (precursor/protein counts, no species ratios — e.g. semi-specific,
  n-glyco, un-specific benchmarks with no known-ratio ground truth) → **imported**, lighter
  `benchmark_imports.json` entry only.

## 4. Edit the JSON files per the data model doc

Follow `docs/BENCHMARK_DATA_MODEL.md`'s own numbered procedure exactly. The two mistakes that
actually happened doing this by hand:

- **`recorded_runs` key must equal the URL slug, not the `dataset_catalog` slug.** They coincide
  for oe480 (one run so far) but not for Astral (date-commit slugs, since multiple runs stack).
  Getting this wrong builds fine and silently renders empty values — always open the page after
  building, don't trust `npm run build` alone.
- **`benchmark_ledger.json` is two array entries destructured positionally**
  (`const [oe480, astral] = ledgers`) — never reorder the array, only edit `rows` within an entry.

## 5. `release_version` on ledger rows

If the run's commit corresponds to (or descends from) a DeepMSFlow release tag, add/update
`release_version` on its ledger row so it lines up with the Run History table's "Release version"
column:

```bash
cd ~/dev/repositories/DeepMSFlow && git describe --tags <commit>
```

- Exact tag (`v0.12.4`) → `release_version: "v0.12.4"`.
- A few commits past a tag (`v0.12.4-2-gfcaf6278`) → `"≈v0.12.4"` (the `≈` signals "built on
  top of, not exactly that tag").
- No reachable tag → `null`, rendered as `—`.

## 6. Known data caveats — check before assuming a run is "the" canonical one

- The `lfqbench-oe480` recorded slot is currently populated from **PXD028735** raw files, not the
  canonical `20240910_OP_LFQBench` dataset that `bion_lfq_oe480.yaml` documents as the "true" OE480
  LFQBench set. If asked to add a PXD028735 run to the OE480 slot, flag this mismatch rather than
  silently overwriting — it's a pre-existing, previously-unnoticed data integrity gap, not
  something to fix as a side effect of publishing one run.
- `benchmark_ledger.json` rows only carry one `files` list per dataset group, not per row — if a
  new run in the same group used different raw filenames, the "Fixed input-file list" text on the
  page will show the group's filenames, not this run's. No fix exists yet; just don't be surprised.

## 7. Verify — do not skip

```bash
npm run check
npm run build
npm run preview -- --port 4322
```

Then open `/benchmarks/<slug>/` in an actual browser (Claude-in-Chrome or otherwise) and confirm:
the ratio widget bars aren't clipped (species deviation outside the fixed axis range gets no
clipping treatment — see data-model doc §"고정 축"), and the numbers rendered aren't blank
(the silent-`undefined` failure mode from step 4).

## Out of scope

- Launching the run, checking Argo/EC2 status, or diagnosing OOM/crash — that's
  `argo-to-ec2-experiment` (DeepMSFlow repo) and the PXD055927-style monitoring workflow.
- `benchmark_comparisons.json` / `benchmark_comparison_scatter.json` — only touch these for a real
  3-tool (SynapSpec/DIA-NN/Spectronaut) comparison archive, which requires DIA-NN and Spectronaut
  results to already exist. Most single-tool runs never touch these two files.
- Committing/pushing the JSON changes — leave that to whoever asked for the update, unless they
  explicitly ask you to commit in that turn.

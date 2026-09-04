# AGENTS.md

The synapspec.ai marketing site. Two implementations live in this repository and only one of them
is served; which one is not obvious from the branch names.

---

## BRANCHES AND WHAT IS LIVE

| Branch | Role |
|---|---|
| `gh-page` | **This is synapspec.ai.** Jekyll, built by GitHub Pages itself. A push is a deploy. |
| `main` | README download links only. Not served. |
| `feat/tanstack-site-evidence` | The TanStack Start rewrite with the evidence-first design applied. Not deployed. |
| `feat/tanstack-start-site` | The earlier migration branch, superseded. |

**A push to `gh-page` is live within a minute.** There is no build gate and no review step. Work on
the live site through a worktree so the branch is never the one you are standing in:

```sh
git worktree add ../SynapSpec-site gh-page
```

`.github/workflows/deploy-pages.yml` runs on pushes to `main` and deploys `dist/client` through
Actions. It does nothing today because the Pages source is still `gh-page`. **Merging the rewrite
into `main` is a cutover, not an addition** — someone must flip the Pages source to "GitHub Actions"
in repository settings, and from that moment `gh-page` stops serving.

## COMMANDS

```sh
bun install
bun run dev       # http://localhost:5173
bun run build     # vite build -> dist/client, then tsc --noEmit
bun run preview   # serves the prerendered output, also 5173
```

`bun run build` prerenders every route. The build fails on a prerender error, so a broken route is a
build failure rather than a runtime one.

The Jekyll branch cannot be built locally: system Ruby is 2.6 and its `Gemfile.lock` wants bundler
2.7.1. Changes there are verified in the browser after deploying, or not at all.

## WHERE THINGS ARE

```
src/routes/          file-based routes; benchmarks.index.tsx and benchmarks.$slug.tsx are unlisted
src/components/      Header, Footer, Logo, Section (SectionHead/TableScroll/Requirements/Closer)
src/data/site.ts     all page copy and release links
src/data/benchmarks.json   copied from gh-page's _data/benchmarks.json
src/ui.ts            button()/badge/panel/container primitives
src/styles.css       the token layer
vite.config.ts       prerender page list, sitemap, and the unlisted-page exclusions
```

## COPY IS SOURCED, NOT WRITTEN

Every claim on this site must be traceable to live synapspec.ai. The design proposal that shaped the
layout also came with new copy, and that copy asserted things the product had never claimed:
"nothing is uploaded, nothing is queued", a four-stage pipeline with file formats, `1% FDR`, CUDA,
"without plugins or a separate licence", "every build contains the full pipeline". All of it was
removed. What replaced it is the live site's own wording.

The live copy at the time of writing is recorded in the scratchpad note `live-copy.md`; re-derive it
by reading the live pages rather than trusting a summary. **The proposal's own note claims its copy
came from the current site. That holds for the download page and the requirements, and not for the
home page.**

Two live requirements lines are load-bearing and were lost once to one-line compression: the 2 TB
storage floor for data processing, and the 4 GB-per-thread memory note. `requirements` in
`src/data/site.ts` keeps the live text line by line for that reason.

## THE HERO IS A SCREENSHOT, THE DARK BAND IS MEASURED

The hero image, `public/images/synapspec/run_detail.png`, is a copy of bion-design's
`projects/synapspec/snapshot-rebuild/busy/1280px/runs-detail.png`, cut to its top 560px. That
snapshot is the window as it stands: the pywebview migration was rejected on 2026-09-04 and the
same screens were rebuilt on NiceGUI widgets, so `snapshot-pywebview` records a build that will
not ship. Below
that line the Output card shows the capture sandbox's absolute path, which is not for a public page.
The counts in it are the capture fixture's, not a benchmark. Re-copy it after the app's snapshot is
re-captured; nothing checks that they match.

The dark band uses the newest LFQBench run in `src/data/benchmarks.json` (currently 2026-07-22).
`exampleRun` in `src/data/benchmarks.ts` derives every displayed value from that JSON; do not
replace it with placeholder numbers.

Two rules follow from using the real data:

- **There is no FDR field.** The proposal's FDR tile became the largest absolute median
  log₂-ratio deviation from the run's accuracy data.
- **The run was on a `c7i.8xlarge`.** The footnote names that AWS instance; it must not imply that
  all processing is local or that the result came from a workstation.

The benchmark pages themselves remain deliberately unlisted below. Showing the derived example run
on the public home page does not make `/benchmarks` or its individual runs discoverable.

## THE BENCHMARK PAGES ARE UNLISTED

`/benchmarks` and its 18 per-run pages are reachable only by typing the URL. Three mechanisms hold
that, and they must be undone together or the state is incoherent:

1. Nothing links to them — not the nav, not the footer.
2. Both routes send `<meta name="robots" content="noindex, nofollow">`.
3. `vite.config.ts` lists all 20 paths in `unlistedPages` with `sitemap: { exclude: true }` —
   the 18 runs plus both `/benchmarks` and `/benchmarks/`.

Three traps found while building this, all still live:

- **The prerender crawler cannot reach an unlinked route.** Without the explicit `pages` list the
  benchmark pages are simply not built.
- **`/benchmarks` and `/benchmarks/` are separate entries.** Excluding one leaves the other in
  `sitemap.xml`.
- **The sitemap plugin writes `pages.json` beside `sitemap.xml`, listing every path it was given,
  exclusions included.** That file published the complete list of hidden URLs. The build script
  deletes it; nothing in the client references it.

The Jekyll equivalents on `gh-page` are `_config.yml`'s navigation and collection defaults, the
front matter of `benchmarks/index.md`, and the stub generator in `scripts/fetch_benchmarks.py`.
`docs/BENCHMARKS.md` there is the fuller record.

## THE DESIGN TOKENS ARE A HAND COPY

`src/styles.css` holds the bion-design palette as a Tailwind v4 `@theme` block. It was transcribed
by hand because Tailwind needs the values at build time, and it has been verified identical to
`dist/tokens.css` once. **Nothing checks it again.**

bion-design guards its other two product copies with a pre-commit checksum
(`scripts/check_ds_tokens.py`) precisely because one of them silently drifted. This copy has no such
guard and is not in that repository's contract table. Treat any token change there as something this
file must follow manually.

Dark mode is deliberately absent. The proposal was drawn light-only, and doubling a hand-copied
surface was judged the wrong trade until this consumes `dist/` directly.

## KNOWN GAPS

- **There is no privacy-policy destination yet.** The live Jekyll banner and the rewrite both link
  to `/privacy/`, but the `gh-page` checkout has no page at that path. Publishing a policy needs an
  approved destination and text.
- **bion-design's `projects/marketing/` snapshots are stale.** `snapshot/next/*.png` was captured
  2026-08-25 from `feat/tanstack-start-site` and still shows the old `#187e93`. Re-capture with
  `make capture-marketing` against this branch before treating those shots as current.
- The live contact page says "Use this form to get started" and has no form. The rewrite preserves
  that text for parity; adding a form needs a separate product decision.

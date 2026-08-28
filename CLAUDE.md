# CLAUDE.md

The synapspec.ai marketing site. A TanStack Start application with static prerendering, plus the
Jekyll site it is meant to replace.

**`gh-page` is synapspec.ai and a push to it deploys immediately.** The branch names do not say
this. Use a worktree (`git worktree add ../SynapSpec-site gh-page`) so you are never standing in the
live branch, and confirm before pushing anything outward-facing.

## Commands

```bash
bun install
bun run dev       # http://localhost:5173
bun run build     # prerender every route, then tsc --noEmit
bun run preview   # serve the prerendered output
```

`bun run build` fails on a prerender error, so a broken route breaks the build rather than the site.
The Jekyll branch cannot be built locally — system Ruby is 2.6 and its lockfile wants bundler 2.7.1.

## Two rules that are easy to break

**Copy is sourced, not written.** Every claim on this site traces to live synapspec.ai. A design
proposal supplied new marketing copy asserting things the product had never claimed — no uploads, a
named pipeline, `1% FDR`, CUDA — and all of it was removed in favour of the live wording. Before
adding a sentence, find where the live site says it. Requirements in particular are kept line by
line: compressing them once lost the 2 TB storage floor and the 4 GB-per-thread note.

**The benchmark pages are unlisted on purpose.** `/benchmarks` and its 18 run pages are held out of
sight by three separate mechanisms — no inbound links, `noindex, nofollow`, and a sitemap exclusion
list in `vite.config.ts`. Undo them together or not at all. The build also deletes `pages.json`,
which the sitemap plugin writes and which enumerates every excluded path.

The example-run figures in the hero are that same unpublished benchmark. Publishing this site
publishes them.

## Writing here

Prefer the live site's words to better ones. When a number appears, it comes from
`src/data/benchmarks.json` or from a live page — never from what would read well. If real data does
not support a claim the design makes, the claim goes, not the data: the proposal's `FDR 1.0%` tile
became a log2 ratio deviation because there is no FDR field to show.

Comments explain what the code cannot. Why the chart states its axis range, why the crawler needs an
explicit page list, why a token is a hand copy — not what the line below does.

---

See `AGENTS.md` for the branch and deploy topology, the full unlisted-pages mechanism and its three
traps, the design-token copy relationship, and the known gaps. It is the maintained knowledge base;
this file is the short always-loaded guide.

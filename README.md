# SynapSpec website

The SynapSpec product website is a TanStack Start application with static
prerendering. The production build creates HTML for every route and can be
deployed to GitHub Pages without a running application server.

## Development

Install [Bun](https://bun.sh), then run:

```sh
bun install
bun run dev
```

Use `bun run build` to generate the production site in `dist/client` and type
check the source. Static routes are discovered and prerendered at build time.

## Structure

- `src/routes/`: file-based TanStack Router routes
- `src/components/`: header, footer, logo and shared section pieces
- `src/data/`: product content and release links
- `src/styles.css`: global site styling
- `public/images/`: product and documentation images

The GitHub Actions workflow deploys `dist/client` using GitHub Pages when this
branch is merged into `main`.

## Reviewing a design proposal

Design proposals live on their own branch and are not deployed anywhere, so
reviewing one means running it locally:

```sh
git switch feat/tanstack-site-evidence   # or whichever proposal branch
bun install
bun run dev
```

Open the URL Vite prints. `/` and `/download` are the two pages the proposal
covers; `/about`, `/contact` and `/spectralens` follow along so the site reads
as one piece. Narrow the window under 768px for the mobile layout.

To review what would actually ship, build and serve the prerendered output
instead:

```sh
bun run build
bun run preview
```

The figures in the home page's example run are a real benchmark, not sample
values: the 2026-07-22 LFQBench run in `_data/benchmarks.json` on the
`gh-page` branch.

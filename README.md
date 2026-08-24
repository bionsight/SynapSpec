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
- `src/components/`: shared header and footer
- `src/data/`: product content and release links
- `src/styles.css`: global site styling
- `public/images/`: product and documentation images

The GitHub Actions workflow deploys `dist/client` using GitHub Pages when this
branch is merged into `main`.

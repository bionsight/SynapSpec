import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'

import benchmarks from './src/data/benchmarks.json'

/* 벤치마크 페이지는 사이트 어디에서도 링크되지 않는다. crawlLinks 로는 닿지
   않으므로 경로를 직접 적어 주고, 같은 자리에서 sitemap 에서도 뺀다 —
   gh-page 의 Jekyll 판이 `sitemap: false` 로 하던 것과 같은 조건이다.
   공개로 전환할 때는 이 블록과 각 라우트의 robots 메타를 함께 풀어야 한다. */
const unlistedPages = [
  /* 크롤러가 `/benchmarks/` 를 별도 항목으로 만들기 때문에 두 형태를 모두 적는다.
     하나만 적으면 나머지 하나가 sitemap 에 실려 나간다. */
  { path: '/benchmarks' },
  { path: '/benchmarks/' },
  ...benchmarks.runs.map((run) => ({ path: `/benchmarks/${run.slug}` })),
].map((page) => ({ ...page, sitemap: { exclude: true } }))

export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackStart({
      pages: unlistedPages,
      sitemap: {
        enabled: true,
        host: 'https://synapspec.ai',
      },
      prerender: {
        enabled: true,
        crawlLinks: true,
        failOnError: true,
      },
    }),
    viteReact(),
  ],
})

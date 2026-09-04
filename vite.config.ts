import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'

import benchmarks from './src/data/benchmarks.json'

/* 내비게이션이 /benchmarks 를 가리키게 되어 crawlLinks 가 목록과 18개 상세를
   스스로 찾는다. 그래도 이 목록을 지우지 않는 이유는 prerender 가 아니라
   sitemap 이다 — 여기서 빼지 않으면 sitemap.xml 에 그대로 실린다.
   robots 메타는 두 라우트에 그대로 있다. 가림막 셋 중 내비게이션만 풀렸다. */
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

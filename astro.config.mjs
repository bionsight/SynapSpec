import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// site와 base 없이는 astro:content나 sitemap 생성 시 canonical URL 경고가 뜬다.
// 배포 대상은 synapspec.ai(커스텀 도메인, 루트) 그대로다.
export default defineConfig({
  site: "https://synapspec.ai",
  srcDir: "./site",
  // publicDir 기본값(./public)은 srcDir이 아니라 프로젝트 루트 기준이라, srcDir을
  // 옮겼다고 자동으로 따라오지 않는다 — 명시해야 한다.
  publicDir: "./site/public",
  // jekyll-sitemap을 대신한다. _config.yml의 defaults가 benchmarks/benchmark_entries에
  // sitemap: false를 걸어뒀던 것과 같은 이유로 /benchmarks/ 아래는 전부 뺀다 — 아직
  // 공개 전이라 내비게이션에서만 접근되고 색인·사이트맵 양쪽 다 막아둔 섹션이다.
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/benchmarks/"),
    }),
  ],
});

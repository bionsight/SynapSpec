import { defineConfig } from "astro/config";

// site와 base 없이는 astro:content나 sitemap 생성 시 canonical URL 경고가 뜬다.
// 배포 대상은 synapspec.ai(커스텀 도메인, 루트) 그대로다.
export default defineConfig({
  site: "https://synapspec.ai",
  srcDir: "./site",
  // publicDir 기본값(./public)은 srcDir이 아니라 프로젝트 루트 기준이라, srcDir을
  // 옮겼다고 자동으로 따라오지 않는다 — 명시해야 한다.
  publicDir: "./site/public",
});

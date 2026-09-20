import { test } from "@playwright/test";

// GitHub Action(.github/workflows/benchmark-from-parquet.yml)이 새로 추가된 run의
// slug를 BENCHMARK_SLUG로 넣어서 돌린다 — PR 리뷰어가 raw JSON diff 대신 실제
// 렌더링된 페이지를 보고 판단할 수 있게 스크린샷을 남기기 위한 것.
// 로컬 e2e 스위트(npm run test:e2e)에서는 BENCHMARK_SLUG가 없으니 항상 건너뛴다.
const slug = process.env.BENCHMARK_SLUG;

test(`screenshot /benchmarks/${slug ?? "(BENCHMARK_SLUG not set)"}/`, async ({ page }) => {
  test.skip(!slug, "BENCHMARK_SLUG 환경변수가 없으면 건너뜀");
  await page.goto(`/benchmarks/${slug}/`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: `benchmark-screenshots/${slug}.png`, fullPage: true });
});

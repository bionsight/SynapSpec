import { test, expect } from "@playwright/test";

test.describe("benchmarks index", () => {
  test("defaults to OE480 and toggles to Astral via the no-JS radio inputs", async ({ page }) => {
    await page.goto("/benchmarks/");
    await expect(page.locator("h1")).toHaveText("Benchmarks");
    await expect(page.locator("#dataset-oe480")).toBeChecked();
    await expect(page.locator("div.bench-ds-panel-oe480")).toBeVisible();

    await page.locator('label[for="dataset-astral"]').click();
    await expect(page.locator("#dataset-astral")).toBeChecked();
    // 라디오 상태는 바뀌지만 두 패널 다 DOM에는 있다 — 보이는 건 CSS다.
    await expect(page.locator(".bench-ds-panel-astral .bench-table-wrap")).toBeVisible();
  });

  test("run history rows link to a run detail page", async ({ page }) => {
    await page.goto("/benchmarks/");
    const link = page.locator(".bench-ds-panel-oe480 .bench-table-wrap a").first();
    await expect(link).toHaveAttribute("href", /^\/benchmarks\//);
  });
});

test.describe("leaderboard", () => {
  test("ranks tools by median epsilon within each dataset", async ({ page }) => {
    await page.goto("/benchmarks/leaderboard/");
    await expect(page.locator("h1")).toHaveText("LFQBench leaderboard");
    const oe480Rows = page.locator("#oe480 tbody tr");
    await expect(oe480Rows).toHaveCount(3);
    // OE480: DIA-NN(0.176) < SynapSpec(0.185) < Spectronaut(0.329)
    await expect(oe480Rows.nth(0)).toContainText("DIA-NN");
    await expect(oe480Rows.nth(0).locator(".bench-rank-badge")).toHaveText("1");
    await expect(oe480Rows.nth(0)).toHaveClass(/bench-leaderboard-lead/);
  });
});

test.describe("history", () => {
  test("plots every archived run and lists them newest-first", async ({ page }) => {
    await page.goto("/benchmarks/history/");
    await expect(page.locator("h1")).toHaveText(/LFQBench/);
    await expect(page.locator(".bench-history-dot")).toHaveCount(18);
    const firstRow = page.locator(".bench-table-wrap tbody tr").first();
    await expect(firstRow).toContainText("2026-07-22"); // 가장 최근 날짜가 맨 위(내림차순)
  });
});

test.describe("benchmark detail pages, one per kind", () => {
  test("run — has prev/next pager and per-file table", async ({ page }) => {
    await page.goto("/benchmarks/2026-07-22/");
    await expect(page.locator("h1")).toHaveText("Benchmark run");
    await expect(page.locator(".bench-stat-value").first()).toHaveText("261,903");
    await expect(page.locator(".bench-pager a")).toHaveCount(1); // 마지막 런이라 prev만 있다
  });

  test("recorded — ratio widget toggles between actual and relative axes", async ({ page }) => {
    await page.goto("/benchmarks/2026-09-07-5d12a532/");
    await expect(page.locator("h1")).toContainText("LFQBench");
    await expect(page.locator("#ratio-actual")).toBeChecked();
    await page.locator('label[for="ratio-relative"]').click();
    await expect(page.locator("#ratio-relative")).toBeChecked();
  });

  test("comparison — renders the accuracy-vs-depth scatter with one dot per tool", async ({ page }) => {
    await page.goto("/benchmarks/lfqbench-202409-archived/");
    await expect(page.locator("h1")).toHaveText("LFQBench / OE480");
    await expect(page.locator(".bench-scatter-dot")).toHaveCount(3);
    await expect(page.locator(".bench-scatter-legend li")).toHaveCount(3);
  });

  test("imported — shows the original figure when one was recorded", async ({ page }) => {
    await page.goto("/benchmarks/2026-09-06-9897b894/");
    await expect(page.locator(".bench-figure-link img")).toBeVisible();
  });

  test("pending — explains that results have not been imported", async ({ page }) => {
    await page.goto("/benchmarks/lfqbench-oe480/");
    await expect(page.locator("h1")).toHaveText("LFQBench / OE480");
    await expect(page.locator(".bench-pending h2")).toHaveText("Results have not been imported");
  });
});

test("benchmarks section is excluded from the sitemap", async ({ request, baseURL }) => {
  const res = await request.get(`${baseURL}/sitemap-0.xml`);
  expect(res.ok()).toBeTruthy();
  const body = await res.text();
  expect(body).not.toContain("/benchmarks/");
  for (const path of ["/", "/about/", "/contact/", "/download/", "/spectralens/"]) {
    expect(body).toContain(`https://synapspec.ai${path}`);
  }
});

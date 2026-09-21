import { test, expect } from "@playwright/test";

test.describe("benchmarks index", () => {
  test("switches between every dataset and renders the selected charts", async ({ page }) => {
    await page.goto("/benchmarks/");
    await expect(page.locator("h1")).toHaveText("Benchmarks");

    const radios = page.locator('input[name="dataset"]');
    await expect(radios.first()).toBeChecked();
    const datasetIds = await radios.evaluateAll((inputs) => inputs.map((input) => input.id));
    const panels = page.locator(".bench-ds-panel");
    await expect(panels).toHaveCount(datasetIds.length);

    for (const id of [...datasetIds, datasetIds[0]]) {
      await page.locator(`label[for="${id}"]`).click();
      await expect(page.locator(`#${id}`)).toBeChecked();
      const panel = panels.filter({ has: page.locator(`#run-history-${id.replace("dataset-", "")}`) });
      await expect(panel).toBeVisible();
      await expect(page.locator(".bench-ds-panel:visible")).toHaveCount(1);

      const charts = panel.locator(".bench-plotly-target");
      expect(await charts.count()).toBeGreaterThan(0);
      for (const chart of await charts.all()) {
        await expect(chart).toHaveClass(/js-plotly-plot/);
        await expect(chart).toHaveClass(/is-visible/);
        await expect(chart).toBeVisible();
      }
    }
  });

  test("clicking a run history bar opens that run's detail page", async ({ page }) => {
    await page.goto("/benchmarks/");
    const bar = page.locator(".bench-ds-panel-oe480 .bench-version-chart-block .point path").first();
    await bar.click();
    await expect(page).toHaveURL(/\/benchmarks\/[^/]+\/$/);
  });
});

test.describe("benchmark detail pages, one per kind", () => {
  test("run — has prev/next pager and per-file table", async ({ page }) => {
    await page.goto("/benchmarks/2026-07-22/");
    await expect(page.locator("h1")).toHaveText("Benchmark run");
    await expect(page.locator(".bench-stat-value").first()).toHaveText("261,903");
    await expect(page.locator(".bench-pager a")).toHaveCount(1); // 마지막 런이라 prev만 있다
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

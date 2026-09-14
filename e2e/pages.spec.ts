import { test, expect } from "@playwright/test";

// 정적 페이지 5개 — 각각 실제로 뜨는지, 제목과 핵심 콘텐츠가 있는지만 본다.
// 픽셀 단위 회귀는 이 테스트의 목적이 아니다.

test("home renders hero and stat band", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/SynapSpec$/);
  await expect(page.locator("h1")).toHaveText("Advancing Scientific Discovery Through Proteomics");
  await expect(page.locator(".stat-band-label")).toHaveText("Example run");
  await expect(page.locator(".stat-value")).toHaveCount(4);
});

test("about lists core features", async ({ page }) => {
  await page.goto("/about/");
  await expect(page.locator("h1")).toHaveText("About SynapSpec");
  await expect(page.locator(".services-grid .card")).toHaveCount(6);
});

test("contact has email and GitHub links", async ({ page }) => {
  await page.goto("/contact/");
  await expect(page.getByRole("link", { name: "contact@bionsight.com" })).toHaveAttribute(
    "href",
    "mailto:contact@bionsight.com"
  );
  await expect(page.getByRole("link", { name: "Join Discussions" })).toBeVisible();
});

test("download lists all five platform rows", async ({ page }) => {
  await page.goto("/download/");
  await expect(page.locator("table tbody tr")).toHaveCount(5);
  await expect(page.locator("table tbody a").first()).toHaveAttribute("href", /cloudfront\.net/);
});

test("spectralens uses its own dark header and cookie product", async ({ page }) => {
  await page.goto("/spectralens/");
  await expect(page.locator(".spectralens-site-header")).toBeVisible();
  await expect(page.locator("h1")).toHaveText("SpectraLens");
  await expect(page.locator("#outputs")).toBeVisible();
});

test("nav marks the current page active and links resolve", async ({ page }) => {
  await page.goto("/about/");
  await expect(page.locator(".nav-menu a.active")).toHaveText("About");
  await page.getByRole("link", { name: "Download", exact: true }).first().click();
  await expect(page).toHaveURL(/\/download\/$/);
});

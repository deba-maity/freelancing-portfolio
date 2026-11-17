import { test, expect } from "@playwright/test";

async function ready(page) {
  await page.goto("/");
  await expect(page.locator("#hero-scene")).toHaveClass(/webgl-ready/);
}

test("project details, external destinations, and keyboard focus", async ({
  page,
}) => {
  await ready(page);
  const project = page.locator('[data-open-project="health"]').first();
  await project.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#project-dialog")).toBeVisible();
  await expect(page.locator("#dialog-title")).toHaveText("Health Planner");
  await expect(
    page.getByRole("link", { name: "Explore live project" }),
  ).toHaveAttribute("href", "https://deba-maity.github.io/healthplanner/");
  await expect(page.getByRole("link", { name: "View source" })).toHaveAttribute(
    "href",
    "https://github.com/deba-maity/healthplanner",
  );
  await page.keyboard.press("Escape");
  await expect(project).toBeFocused();
  await page.locator('[data-open-project="angular"]').first().click();
  await expect(page.locator("#dialog-title")).toHaveText(
    "Angular Features Showcase",
  );
  await page.locator("#close-dialog").click();
  await page.locator('[data-open-project="healthcare"]').click();
  await expect(page.locator("#dialog-title")).toHaveText(
    "Healthcare Test Data Platform",
  );
  await expect(page.locator("#dialog-content")).toContainText(
    "four developers",
  );
  await expect(
    page.getByRole("link", { name: "Talk about the work" }),
  ).toHaveAttribute("href", /^mailto:/);
});

test("the immersive engine can be disassembled, inspected, and closed", async ({
  page,
}) => {
  await ready(page);
  const canvasCount = await page.locator("canvas").count();
  await page.locator("#open-lab").click();
  await expect(page.locator("#lab-dialog")).toBeVisible();
  await expect(page.locator("#lab-stage canvas")).toHaveCount(1);
  await page.locator("#assembly-toggle").click();
  await expect(page.locator("#lab-dialog")).toHaveClass(/exploded/);
  await expect(page.locator("#assembly-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator('[data-layer="1"]').click();
  await expect(page.locator("#layer-story")).toContainText(
    "Keep the conversation flowing.",
  );
  await page.locator('[data-render="blueprint"]').click();
  await expect(page.locator("#lab-dialog")).toHaveClass(/blueprint-mode/);
  await page.locator("#lab-reset").click();
  await page.keyboard.press("Escape");
  await expect(page.locator("#lab-dialog")).not.toBeVisible();
  await expect(page.locator("#open-lab")).toBeFocused();
  await expect(page.locator(".hero-art canvas")).toHaveCount(1);
  expect(await page.locator("canvas").count()).toBe(canvasCount);
  await page.locator("#hero-lab-button").click();
  await expect(page.locator("#lab-dialog")).toBeVisible();
  await page.locator("#close-lab").click();
  await expect(page.locator("#hero-lab-button")).toBeFocused();
});

test("skills update without accumulating GPU textures", async ({ page }) => {
  await ready(page);
  await page.locator("#about").scrollIntoViewIfNeeded();
  await expect(page.locator("#skills-scene")).toHaveClass(/webgl-ready/);
  const before = await page.evaluate(
    () => window.__portfolio3D.diagnostics()[1].textures,
  );
  for (let i = 0; i < 5; i++) {
    for (const category of ["backend", "toolkit", "frontend"])
      await page.locator(`[data-skill="${category}"]`).click();
  }
  await page.locator('[data-skill="backend"]').click();
  await expect(page.locator("#skill-detail")).toContainText("Spring Boot");
  await expect(page.locator('[data-skill="backend"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.waitForTimeout(200);
  const after = await page.evaluate(
    () => window.__portfolio3D.diagnostics()[1].textures,
  );
  expect(after).toBe(before);
});

test("motion preference is honored and rendering stops when paused or offscreen", async ({
  page,
}) => {
  await ready(page);
  await expect(page.locator("#motion-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.waitForTimeout(300);
  const pausedBefore = await page.evaluate(
    () => window.__portfolio3D.diagnostics()[0].renderCount,
  );
  await page.waitForTimeout(500);
  expect(
    await page.evaluate(
      () => window.__portfolio3D.diagnostics()[0].renderCount,
    ),
  ).toBe(pausedBefore);
  await page.locator("#motion-toggle").click();
  await page.waitForTimeout(600);
  expect(
    await page.evaluate(
      () => window.__portfolio3D.diagnostics()[0].renderCount,
    ),
  ).toBeGreaterThan(pausedBefore);
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const offscreenBefore = await page.evaluate(() =>
    window.__portfolio3D.diagnostics().map((s) => s.renderCount),
  );
  await page.waitForTimeout(500);
  expect(
    await page.evaluate(() =>
      window.__portfolio3D.diagnostics().map((s) => s.renderCount),
    ),
  ).toEqual(offscreenBefore);
});

test("contact actions and downloadable résumé", async ({
  page,
  context,
  request,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await ready(page);
  await page.locator("#copy-email").click();
  await expect(page.locator("#toast")).toContainText("Email copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "debajyoti.maity29@gmail.com",
  );
  const response = await request.get("/Debajyoti-Maity-Resume.pdf");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
  expect((await response.body()).subarray(0, 4).toString()).toBe("%PDF");
  await expect(page.getByRole("link", { name: "LinkedIn ↗" })).toHaveAttribute(
    "href",
    "https://www.linkedin.com/in/debajyoti-maity-004920185/",
  );
});

for (const width of [320, 390, 768, 1024, 1920]) {
  test(`layout remains within the viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await ready(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const title = await page.locator("h1").boundingBox();
    expect(title.x).toBeGreaterThanOrEqual(0);
    if (width < 761) {
      await page.locator(".menu-toggle").click();
      await expect(page.locator("#mobile-nav")).toBeVisible();
      await page.locator('#mobile-nav a[href="#experience"]').click();
      await expect(page.locator("#mobile-nav")).not.toBeVisible();
      await expect(page.locator("#experience-title")).toBeInViewport();
    }
    await page.locator("#open-lab").click();
    await page.locator("#assembly-toggle").click();
    expect(
      await page
        .locator("#lab-dialog")
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
    await page.locator("#close-lab").click();
  });
}

test("content and controls remain usable when WebGL is unavailable", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === "webgl" || type === "webgl2") return null;
      return original.call(this, type, ...args);
    };
  });
  await page.goto("/");
  await page.waitForFunction(() => Boolean(window.__portfolio3D));
  await expect(page.locator(".sculpture-fallback")).toBeVisible();
  await page.locator("#open-lab").click();
  await expect(page.locator("#toast")).toContainText(
    "3D exploration is unavailable",
  );
  await page.locator('[data-open-project="health"]').first().click();
  await expect(page.locator("#dialog-title")).toHaveText("Health Planner");
  expect(errors).toEqual([]);
});

test("a failed engine module leaves useful fallback controls", async ({
  page,
}) => {
  await page.route("**/src/scene.js*", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator("#reset-scene")).toBeDisabled();
  await expect(page.locator("#hero-scene")).not.toHaveAttribute("tabindex");
  await page.locator("#hero-lab-button").click();
  await expect(page.locator("#toast")).toContainText(
    "3D exploration is unavailable",
  );
  await page.locator('[data-open-project="health"]').first().click();
  await expect(page.locator("#dialog-title")).toHaveText("Health Planner");
});

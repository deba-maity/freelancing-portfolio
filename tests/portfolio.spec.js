import { test, expect } from "@playwright/test";

test("a lost graphics context reveals the fallback and can recover", async ({
  page,
}) => {
  test.setTimeout(120000);
  await ready(page);
  await page.evaluate(() => {
    const gl = document.querySelector("#world canvas").getContext("webgl2");
    window.lossTest = gl.getExtension("WEBGL_lose_context");
    window.lossTest.loseContext();
  });
  await expect(page.locator("body")).toHaveClass(/graphics-unavailable/);
  await expect(page.locator("#world canvas")).toBeHidden();
  await travel(page, 1);
  await page.locator('[data-project="health"]').click();
  await expect(page.locator("#dialog-title")).toHaveText("Health Planner");
  await page.keyboard.press("Escape");
  await page.evaluate(() => window.lossTest.restoreContext());
  await expect(page.locator("#world")).toHaveAttribute("data-ready", "true", {
    timeout: 45000,
  });
  await expect(page.locator("body")).not.toHaveClass(/graphics-unavailable/);
});

async function ready(page) {
  await page.goto("/");
  await expect(page.locator("#world")).toHaveAttribute("data-ready", "true", {
    timeout: 45000,
  });
}
async function travel(page, index) {
  await page.locator('.tour-nav [data-stop="' + index + '"]').click();
  await expect(page.locator("body")).toHaveAttribute(
    "data-chapter",
    String(index),
  );
}

test("tour navigation moves the real camera, supports keyboard travel, and returns home", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await ready(page);
  const first = await page.evaluate(() => window.__studio.getState().camera);
  await travel(page, 1);
  await expect(page.locator("#title-health")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.__studio.getState().camera))
    .not.toEqual(first);
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("body")).toHaveAttribute("data-chapter", "2");
  await page.locator(".identity").click();
  await expect(page.locator("body")).toHaveAttribute("data-chapter", "0");
  await expect
    .poll(() => page.evaluate(() => window.__studio.getState().progress))
    .toBe(0);
  expect(errors).toEqual([]);
});

test("project dialogs expose real destinations and restore keyboard focus", async ({
  page,
}) => {
  test.setTimeout(120000); // Three separate camera views under software WebGL.
  await ready(page);
  await travel(page, 1);
  const trigger = page.locator('[data-project="health"]');
  await expect(trigger).toBeVisible();
  await trigger.focus();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#portfolio-dialog")).toBeVisible();
  await expect(page.locator("#dialog-title")).toHaveText("Health Planner");
  await expect(
    page.getByRole("link", { name: "Open live project" }),
  ).toHaveAttribute("href", "https://deba-maity.github.io/healthplanner/");
  await expect(page.getByRole("link", { name: "View source" })).toHaveAttribute(
    "href",
    "https://github.com/deba-maity/healthplanner",
  );
  await expect(page.locator(".art-caption")).toContainText("illustrative");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await travel(page, 2);
  await page.locator('[data-project="angular"]').click();
  await expect(
    page.getByRole("link", { name: "Open live project" }),
  ).toHaveAttribute("href", "https://deba-maity.github.io/Angular-features/");
  await page.locator("#close-dialog").click();
  await travel(page, 3);
  await page.locator('[data-project="healthcare"]').click();
  await expect(page.locator("#dialog-body")).toContainText("four developers");
  await expect(page.locator(".art-caption")).toContainText(
    "No internal screens",
  );
});

test("scene controls change lighting, pause motion, and separate the Angular layers", async ({
  page,
}) => {
  await ready(page);
  await expect(page.locator("#motion-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator("#lighting-toggle").click();
  await expect(page.locator("body")).toHaveClass(/night/);
  await expect
    .poll(() => page.evaluate(() => window.__studio.getState().night))
    .toBe(true);
  await travel(page, 2);
  await page.locator("#exhibit-action").click();
  await expect
    .poll(() => page.evaluate(() => window.__studio.getState().exploded))
    .toBe(true);
  await expect(page.locator("#exhibit-action")).toHaveText(
    "Bring the layers together ↙",
  );
  await page.locator("#exhibit-action").click();
  await expect
    .poll(() => page.evaluate(() => window.__studio.getState().exploded))
    .toBe(false);
});

test("dragging orbits the whole world and reset returns to the tour camera", async ({
  page,
}) => {
  await ready(page);
  const initial = await page.evaluate(() => window.__studio.getState().camera);
  await page.mouse.move(900, 500);
  await page.mouse.down();
  await page.mouse.move(1100, 440, { steps: 5 });
  await page.mouse.up();
  await expect(page.locator("body")).toHaveClass(/is-orbiting/);
  expect(
    await page.evaluate(() => window.__studio.getState().camera),
  ).not.toEqual(initial);
  await page.locator("#reset-view").click();
  await expect(page.locator("body")).not.toHaveClass(/is-orbiting/);
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__studio.getState().camera.map((x) => Math.round(x * 100) / 100),
      ),
    )
    .toEqual(initial.map((x) => Math.round(x * 100) / 100));
});

test("index opens the complete career, skills, education, and résumé", async ({
  page,
}) => {
  await ready(page);
  await page.locator("#index-button").click();
  await expect(page.locator(".index-list button")).toHaveCount(6);
  await page.locator("#dialog-body [data-open-profile]").click();
  await expect(page.locator(".profile-row")).toHaveCount(4);
  await expect(page.locator("#dialog-body")).toContainText(
    "Tata Consultancy Services",
  );
  await expect(page.locator("#dialog-body")).toContainText(
    "University of Engineering and Management",
  );
  await expect(
    page.getByRole("link", { name: "Read the résumé" }),
  ).toHaveAttribute("href", "/Debajyoti-Maity-Resume.pdf");
  await page.keyboard.press("Escape");
  await expect(page.locator("#index-button")).toBeFocused();
});

test("mobile chapters, contact actions, and layout remain usable at narrow sizes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page);
  for (const n of [1, 2, 3, 4, 5]) {
    await travel(page, n);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await expect(page.locator("#contact .text-link")).toHaveAttribute(
    "href",
    "mailto:debajyoti.maity29@gmail.com",
  );
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.locator("#copy-email").click();
  await expect(page.locator("#toast")).toContainText("Email copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "debajyoti.maity29@gmail.com",
  );
  await page.setViewportSize({ width: 320, height: 640 });
  await travel(page, 0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("a vertical touch gesture scrolls through the studio instead of being trapped by the canvas", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:5178/");
  await expect(page.locator("#world")).toHaveAttribute("data-ready", "true", {
    timeout: 45000,
  });
  const session = await context.newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 180, y: 430 }],
  });
  for (const y of [400, 365, 320, 270, 220])
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: 180, y }],
    });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(70);
  await context.close();
});

test("all portfolio information works if the renderer cannot load", async ({
  page,
}) => {
  await page.route("**/src/studio-scene.js*", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator("body")).toHaveClass(/graphics-unavailable/);
  await travel(page, 1);
  await page.locator('[data-project="health"]').click();
  await expect(page.locator("#dialog-title")).toHaveText("Health Planner");
  await expect(
    page.getByRole("link", { name: "Open live project" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await travel(page, 5);
  await expect(page.locator("#contact .text-link")).toBeVisible();
});

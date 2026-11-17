import { test, expect } from "@playwright/test";

const areaNames = [
  "studio",
  "personal",
  "professional",
  "experience",
  "skills",
  "contact",
];
async function ready(page) {
  await page.goto("/");
  await expect(page.locator("#world")).toHaveAttribute("data-ready", "true", {
    timeout: 45000,
  });
  await expect(page.locator("#world")).toHaveAttribute("data-area", "studio");
}
async function travel(page, n) {
  await page.locator('.tour-nav [data-stop="' + n + '"]').click();
  await expect(page.locator("body")).toHaveAttribute("data-area", areaNames[n]);
  await expect(page.locator("#world")).toHaveAttribute(
    "data-area",
    areaNames[n],
  );
}
async function meshClick(page, id) {
  await expect
    .poll(
      async () =>
        page.evaluate((id) => {
          const p = window.__studio.getScreenPoint(id);
          return (
            p.inView &&
            p.hit === id &&
            document.elementFromPoint(p.x, p.y)?.tagName === "CANVAS"
          );
        }, id),
      { timeout: 20000 },
    )
    .toBe(true);
  const point = await page.evaluate(
    (id) => window.__studio.getScreenPoint(id),
    id,
  );
  await page.mouse.click(point.x, point.y);
  await expect(page.locator("#portfolio-dialog")).toHaveAttribute(
    "data-item",
    id,
  );
  await expect(page.locator("#portfolio-dialog")).toBeVisible();
  await expect(page.locator("#world")).toHaveAttribute("data-inspection", id);
}
async function close(page) {
  await page.keyboard.press("Escape");
  await expect(page.locator("#portfolio-dialog")).not.toBeVisible();
  await expect(page.locator("#world")).toHaveAttribute("data-inspection", "");
}

test("a single click on a 3D project opens its own story from the overview", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await ready(page);
  await meshClick(page, "health");
  await expect(page.locator("#dialog-title")).toHaveText("Health Planner");
  await expect(
    page.getByRole("link", { name: "Open live project" }),
  ).toHaveAttribute("href", "https://deba-maity.github.io/healthplanner/");
  await expect(page.getByRole("link", { name: "View source" })).toHaveAttribute(
    "href",
    "https://github.com/deba-maity/healthplanner",
  );
  await expect(page.locator("figcaption")).toContainText(
    "Illustrative interface study",
  );
  await close(page);
  expect(errors).toEqual([]);
});

test("personal and professional collections contain the right projects and preserve back navigation", async ({
  page,
}) => {
  test.setTimeout(120000);
  await ready(page);
  await page.locator("#index-button").click();
  await page.locator('#dialog-body [data-open="personal"]').click();
  await expect(page.locator(".collection-card")).toHaveCount(2);
  await page.locator('#dialog-body [data-open="angular"]').click();
  await expect(page.locator("#dialog-title")).toHaveText(
    "Angular Features Showcase",
  );
  await page.locator("[data-toggle-layers]").click();
  await expect
    .poll(() => page.evaluate(() => window.__studio.getState().exploded))
    .toBe(true);
  await page.locator("#dialog-back").click();
  await expect(page.locator("#dialog-title")).toHaveText("Personal Projects");
  await page.locator("#dialog-back").click();
  await expect(page.locator(".directory-grid button")).toHaveCount(6);
  await page.locator('#dialog-body [data-open="professional"]').click();
  await expect(page.locator(".collection-card")).toHaveCount(3);
  await page.locator('#dialog-body [data-open="enterprise"]').click();
  await expect(page.locator("#dialog-body")).toContainText(
    "HDFC, NSDL, and Bajaj",
  );
  await expect(page.locator("#dialog-body")).toContainText("Redis");
  await expect(page.locator("figcaption")).toContainText("no internal screens");
  await page.locator("[data-parent]").click();
  await expect(page.locator("#dialog-title")).toHaveText("Professional Work");
});

test("each professional 3D exhibit opens matching data", async ({ page }) => {
  test.setTimeout(120000);
  await ready(page);
  await travel(page, 2);
  for (const id of ["healthcare", "enterprise", "mobile"]) {
    await meshClick(page, id);
    await close(page);
  }
});

test("all four career steps open their own role", async ({ page }) => {
  test.setTimeout(120000);
  await ready(page);
  await travel(page, 3);
  for (const [id, name] of [
    ["tcs", "Tata Consultancy Services"],
    ["otobit", "Otobit Pvt Ltd"],
    ["rhythmflows", "Rhythmflows Solutions"],
    ["vjl", "VJL IT AUGMENTS"],
  ]) {
    await meshClick(page, "role:" + id);
    await expect(page.locator("#dialog-title")).toHaveText(name);
    await close(page);
  }
});

test("skills drawers open matching capabilities and link to relevant work", async ({
  page,
}) => {
  test.setTimeout(180000); // Multiple inspected views under software WebGL.
  await ready(page);
  await travel(page, 4);
  for (const [id, skill] of [
    ["frontend", "Angular v4–v19"],
    ["backend", "Spring Boot"],
    ["practice", "Jest"],
  ]) {
    await meshClick(page, "skill:" + id);
    await expect(page.locator(".tag-row")).toContainText(skill);
    await close(page);
  }
  await page.locator('#skills [data-open="skill:backend"]').click();
  await page.locator('.related-work [data-open="enterprise"]').click();
  await expect(page.locator("#dialog-title")).toHaveText(
    "Enterprise Dashboards & Reporting",
  );
  await page.locator("#dialog-back").click();
  await expect(page.locator("#dialog-title")).toHaveText("Backend & APIs");
});

test("keyboard controls reach details and restore focus", async ({ page }) => {
  await ready(page);
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#world")).toHaveAttribute("data-area", "personal");
  const trigger = page.locator('#personal .object-link[data-open="health"]');
  await expect(trigger).toBeVisible();
  await trigger.focus();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#dialog-title")).toHaveText("Health Planner");
  await close(page);
  await expect(trigger).toBeFocused();
  await page.locator(".identity").click();
  await expect(page.locator("body")).toHaveAttribute("data-area", "studio");
});

test("dragging never opens details, reset returns the camera, and lighting works", async ({
  page,
}) => {
  await ready(page);
  const initial = await page.evaluate(() => window.__studio.getState().camera);
  await page.mouse.move(900, 650);
  await page.mouse.down();
  await page.mouse.move(1150, 620, { steps: 5 });
  await page.mouse.up();
  await expect(page.locator("body")).toHaveClass(/is-orbiting/);
  await expect(page.locator("#portfolio-dialog")).not.toBeVisible();
  await page.locator("#reset-view").click();
  await expect(page.locator("body")).not.toHaveClass(/is-orbiting/);
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__studio.getState().camera.map((x) => Math.round(x * 100) / 100),
      ),
    )
    .toEqual(initial.map((x) => Math.round(x * 100) / 100));
  await page.locator("#lighting-toggle").click();
  await expect(page.locator("body")).toHaveClass(/night/);
  await expect
    .poll(() => page.evaluate(() => window.__studio.getState().night))
    .toBe(true);
  await expect(page.locator("#motion-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("the contact desk and résumé book expose working destinations", async ({
  page,
}) => {
  test.setTimeout(120000);
  await ready(page);
  await travel(page, 5);
  await meshClick(page, "resume");
  await expect(
    page.getByRole("link", { name: "Download PDF" }),
  ).toHaveAttribute("href", "/Debajyoti-Maity-Resume.pdf");
  await expect(page.locator("#dialog-body")).toContainText(
    "University of Engineering and Management",
  );
  await close(page);
  await meshClick(page, "contact");
  await expect(page.locator(".contact-address")).toHaveAttribute(
    "href",
    "mailto:debajyoti.maity29@gmail.com",
  );
  await expect(page.locator('a[href="tel:+917679101800"]')).toBeVisible();
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.locator("#dialog-body [data-copy-email]").click();
  await expect(page.locator("#toast")).toContainText("Email copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "debajyoti.maity29@gmail.com",
  );
});

test("mobile categories and details fit narrow screens", async ({ page }) => {
  test.setTimeout(120000);
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
  await travel(page, 1);
  await page.locator('#personal [data-open="personal"]').click();
  await expect(page.locator(".collection-card")).toHaveCount(2);
  await page.locator('#dialog-body [data-open="angular"]').click();
  await expect(page.locator("#dialog-title")).toHaveText(
    "Angular Features Showcase",
  );
  for (const width of [320, 390, 700]) {
    await page.setViewportSize({ width, height: 640 });
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <= innerWidth &&
          document.querySelector("#dialog-body").scrollWidth <=
            document.querySelector("#dialog-body").clientWidth + 1,
      ),
    ).toBe(true);
  }
});

test("vertical touch scroll remains available on the canvas", async ({
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
  await expect(page.locator("#portfolio-dialog")).not.toBeVisible();
  await context.close();
});

test("collections and static preview images work when the renderer fails", async ({
  page,
}) => {
  await page.route("**/src/studio-scene.js*", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator("body")).toHaveClass(/graphics-unavailable/);
  await page.locator("#index-button").click();
  await page.locator('#dialog-body [data-open="personal"]').click();
  await expect(page.locator(".collection-card")).toHaveCount(2);
  await page.locator('#dialog-body [data-open="health"]').click();
  await expect(page.locator("#dialog-title")).toHaveText("Health Planner");
  await expect
    .poll(() =>
      page
        .locator(".dialog-art")
        .evaluate((img) => img.complete && img.naturalWidth > 0),
    )
    .toBe(true);
});

test("graphics context loss preserves content and restores the scene", async ({
  page,
}) => {
  test.setTimeout(120000);
  await ready(page);
  await page.evaluate(() => {
    window.lossTest = document
      .querySelector("#world canvas")
      .getContext("webgl2")
      .getExtension("WEBGL_lose_context");
    window.lossTest.loseContext();
  });
  await expect(page.locator("body")).toHaveClass(/graphics-unavailable/);
  await page.locator("#index-button").click();
  await page.locator('#dialog-body [data-open="skills"]').click();
  await expect(page.locator(".skill-card")).toHaveCount(3);
  await page.keyboard.press("Escape");
  await page.evaluate(() => window.lossTest.restoreContext());
  await expect(page.locator("#world")).toHaveAttribute("data-ready", "true", {
    timeout: 45000,
  });
  await expect(page.locator("body")).not.toHaveClass(/graphics-unavailable/);
});

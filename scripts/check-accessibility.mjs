import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
await mkdir("qa", { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ["--enable-unsafe-swiftshader"],
});
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(process.env.PORTFOLIO_BASE_URL || "http://127.0.0.1:5178/", {
    waitUntil: "networkidle",
  });
  await page.waitForFunction(
    () => document.querySelector("#world").dataset.ready === "true",
    { timeout: 45000 },
  );
  const reports = [];
  async function audit(mode) {
    const r = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    reports.push({
      mode,
      violations: r.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    });
  }
  await audit("studio");
  await page.locator('.tour-nav [data-stop="1"]').click();
  await page.locator('#personal [data-open="personal"]').click();
  await audit("personal-collection");
  await page.locator('#dialog-body [data-open="health"]').click();
  await audit("project");
  await page.locator("#close-dialog").click();
  await page.locator("#index-button").click();
  await audit("index");
  await page.locator('#dialog-body [data-open="experience"]').click();
  await audit("experience-collection");
  await page.locator('#dialog-body [data-open="role:vjl"]').click();
  await audit("role");
  await page.locator("#close-dialog").click();
  await page.locator('.tour-nav [data-stop="4"]').click();
  await page.locator('#skills [data-open="skill:frontend"]').click();
  await audit("skill");
  await page.screenshot({path:"qa/screens/final-audited-panel.png"});
  await page.locator("#close-dialog").click();
  await page.locator("#lighting-toggle").click();
  await page.waitForTimeout(900);
  await audit("evening");
  await page.setViewportSize({ width: 390, height: 844 });
  await audit("mobile-evening");
  await page.locator('.tour-nav [data-stop="5"]').click();
  await page.locator('#contact [data-open="contact"]').click();
  await audit("mobile-contact");
  await writeFile(
    "qa/accessibility-report.json",
    JSON.stringify(reports, null, 2),
  );
  console.log(JSON.stringify(reports, null, 2));
  if (reports.some((r) => r.violations.length)) process.exitCode = 1;
} finally {
  await browser.close();
}

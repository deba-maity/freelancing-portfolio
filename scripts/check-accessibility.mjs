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
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(process.env.PORTFOLIO_BASE_URL || "http://127.0.0.1:5178/", {
    waitUntil: "networkidle",
  });
  const reports = [];
  for (const mode of ["page", "project", "lab"]) {
    if (mode === "project")
      await page.locator('[data-open-project="health"]').first().click();
    if (mode === "lab") {
      await page.locator("#close-dialog").click();
      await page.locator("#open-lab").click();
    }
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    reports.push({
      mode,
      violations: result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    });
  }
  await writeFile(
    "qa/accessibility-report.json",
    JSON.stringify(reports, null, 2),
  );
  console.log(JSON.stringify(reports, null, 2));
  if (reports.some((report) => report.violations.length)) process.exitCode = 1;
} finally {
  await browser.close();
}

import { chromium } from "@playwright/test";
import { mkdir, copyFile } from "node:fs/promises";
await mkdir("qa", { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ["--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  await page.goto(process.env.PORTFOLIO_BASE_URL || "http://127.0.0.1:5178/", {
    waitUntil: "networkidle",
  });
  await page.waitForFunction(
    () => document.querySelector("#world").dataset.ready === "true",
    { timeout: 45000 },
  );
  await page
    .locator("#world canvas")
    .screenshot({ path: "qa/studio-poster.jpg", type: "jpeg", quality: 88 });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.locator("#world canvas").screenshot({
    path: "qa/studio-poster-mobile.jpg",
    type: "jpeg",
    quality: 88,
  });
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: "qa/og-image.png" });
} finally {
  await browser.close();
}
for (const name of [
  "studio-poster.jpg",
  "studio-poster-mobile.jpg",
  "og-image.png",
])
  await copyFile("qa/" + name, "public/" + name);
console.log(
  "Exported the real studio render as desktop/mobile fallback posters and the social preview.",
);

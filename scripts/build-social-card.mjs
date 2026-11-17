import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  headless: true,
  args: ["--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.goto("http://127.0.0.1:5178/scripts/social-card.html", {
  waitUntil: "networkidle",
});
await page.waitForFunction(() =>
  document.querySelector("#social-scene").classList.contains("webgl-ready"),
);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "public/og-image.png" });
console.log("Created public/og-image.png");
await browser.close();

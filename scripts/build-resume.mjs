import { chromium } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve("scripts/resume.html")).href);
await page.pdf({
  path: "public/Debajyoti-Maity-Resume.pdf",
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
  tagged: true,
});
console.log("Created public/Debajyoti-Maity-Resume.pdf");
await browser.close();

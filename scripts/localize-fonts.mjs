import { mkdir, writeFile } from "node:fs/promises";
await mkdir("public/fonts", { recursive: true });
const families = [
  {
    query: "DM+Sans:wght@400..700",
    file: "dm-sans-latin.woff2",
    name: "DM Sans",
  },
  {
    query: "Space+Grotesk:wght@400..700",
    file: "space-grotesk-latin.woff2",
    name: "Space Grotesk",
  },
];
let styles = "";
for (const font of families) {
  const response = await fetch(
    `https://fonts.googleapis.com/css2?family=${font.query}&display=swap`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      },
    },
  );
  if (!response.ok)
    throw new Error(`Font CSS request failed: ${response.status}`);
  const css = await response.text();
  const block = css.match(/\/\* latin \*\/\s*(@font-face\s*\{[^}]+\})/);
  if (!block) throw new Error(`Latin subset missing for ${font.name}`);
  const url = block[1].match(/url\(([^)]+)\)/)[1];
  const data = await fetch(url);
  if (!data.ok) throw new Error("Font download failed");
  await writeFile(
    `public/fonts/${font.file}`,
    Buffer.from(await data.arrayBuffer()),
  );
  styles += `${block[1].replace(url, `/fonts/${font.file}`)}\n`;
}
await writeFile("src/fonts.css", styles);
console.log("Downloaded local variable fonts and generated src/fonts.css");

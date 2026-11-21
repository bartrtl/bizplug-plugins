// Draws a card theme on the real BizPlug card, with the sample businesses, in dark and light mode.
// Usage, from the repository's root:
//   npx tsx themes/preview.ts themes/<id>.json
// It writes one HTML page per sample business and mode to a temporary folder and prints where. Open them in a
// browser at about 680 px wide (a computer) and 390 px (a phone), and take your screenshots there.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const file = process.argv[2];
if (!file) {
  console.error("usage: npx tsx themes/preview.ts themes/<id>.json");
  process.exit(1);
}
const theme = JSON.parse(readFileSync(file, "utf8"));
if (!theme.colors) {
  console.error(file + " has no colors: see THEMES.md for the format.");
  process.exit(1);
}
const card = readFileSync(join("layouts", "card.html"), "utf8");
const out = join(tmpdir(), "bizplug-theme-preview", String(theme.id || "theme"));
mkdirSync(out, { recursive: true });
for (const sample of readdirSync(join("layouts", "samples")).filter((f) => f.endsWith(".json"))) {
  const data = JSON.parse(readFileSync(join("layouts", "samples", sample), "utf8"));
  data.plugin = { ...data.plugin, bound: true, theme: theme.colors };
  for (const mode of ["dark", "light"]) {
    const host = `window.openai = { toolOutput: ${JSON.stringify(data)}, theme: "${mode}", widgetState: null, setWidgetState() {}, openExternal() {}, sendFollowUpMessage() {}, notifyIntrinsicHeight() {}, callTool: async () => { throw new Error("preview"); } };`;
    const page = join(out, sample.replace(/\.json$/, "") + "-" + mode + ".html");
    writeFileSync(page, card.replace("</head>", () => "<script>" + host + "</script></head>"));
    console.log(page);
  }
}

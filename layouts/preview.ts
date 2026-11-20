// Draws your layout in the real BizPlug card, with the sample businesses in samples/, so you can see it at
// any width, in dark and light mode, before you propose it. Usage, from the repository's root:
//   npx tsx layouts/preview.ts layouts/<your-layout>
// It writes layouts/<your-layout>/preview-<sample>-<mode>.html: open them in a browser and resize the window
// (desktop: 680 px wide, mobile: 390 px). The card's buttons do nothing here; data-lay tabs and filters work.
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { basename, join } from "node:path";

const folder = process.argv[2];
if (!folder) {
  console.error("usage: npx tsx layouts/preview.ts layouts/<your-layout>");
  process.exit(1);
}
const here = join(process.cwd(), "layouts");
const read = (f: string) => (existsSync(join(folder, f)) ? readFileSync(join(folder, f), "utf8") : "");
const meta = JSON.parse(read("layout.json") || "{}");
const id = meta.id || basename(folder);
// The same wrapper the card puts around every layout package.
const code = `LAYOUTS[${JSON.stringify(id)}] = (function () {\n"use strict";\n${read("layout.js")}\nreturn { render: render, own: ${meta.ownHeader ? "true" : "false"} };\n})();`;
const card = readFileSync(join(here, "card.html"), "utf8")
  .replace("const LAYOUTS = {};", () => "const LAYOUTS = {};\n" + code)
  .replace("</style>", () => read("layout.css") + "</style>");
for (const file of readdirSync(join(here, "samples")).filter((f) => f.endsWith(".json"))) {
  const data = JSON.parse(readFileSync(join(here, "samples", file), "utf8"));
  data.plugin = { ...data.plugin, layout: id, bound: true };
  for (const mode of ["dark", "light"]) {
    const host = `window.openai = { toolOutput: ${JSON.stringify(data)}, theme: "${mode}", widgetState: null, setWidgetState() {}, openExternal() {}, sendFollowUpMessage() {}, notifyIntrinsicHeight() {}, callTool: async () => { throw new Error("preview"); } };`;
    const out = join(folder, `preview-${file.replace(/\.json$/, "")}-${mode}.html`);
    writeFileSync(out, card.replace("</head>", () => "<script>" + host + "</script></head>"));
    console.log("wrote " + out);
  }
}

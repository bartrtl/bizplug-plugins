// Checks a proposed card theme the way BizPlug does. Usage, from the repository's root:
//   npx tsx themes/check-theme.ts my-theme.json
import { readdirSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { CARD_THEMES, cardThemeListProblems, contrast, type CardTheme } from "../source/card-themes";

const file = process.argv[2];
if (!file) {
  console.error("usage: npx tsx themes/check-theme.ts <theme.json>");
  process.exit(1);
}
const theme = JSON.parse(readFileSync(file, "utf8")) as CardTheme;
const dir = join(process.cwd(), "themes");
const inFolder = resolve(file).startsWith(dir + "/");
// Every other theme: the built-in ones and the other files in themes/, so an id is never used twice.
const others: CardTheme[] = [...CARD_THEMES];
for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
  if (resolve(dir, f) === resolve(file)) continue;
  try {
    const t = JSON.parse(readFileSync(join(dir, f), "utf8")) as CardTheme;
    if (!others.some((o) => o.id === t.id)) others.push(t);
  } catch {}
}
const builtIn = CARD_THEMES.find((t) => t.id === theme.id);
const problems = builtIn && JSON.stringify(builtIn) === JSON.stringify({ id: theme.id, name: theme.name, description: theme.description, author: theme.author, colors: theme.colors, decor: theme.decor })
  ? cardThemeListProblems([theme])
  : cardThemeListProblems([...others, theme]).filter((p) => p.startsWith(theme.id + ":") || p.includes("used twice"));
if (inFolder && basename(file) !== theme.id + ".json") problems.push(`The file must be named ${theme.id}.json, after its id.`);
if (problems.length) {
  console.error(problems.map((p) => "- " + p).join("\n"));
  process.exit(1);
}
const c = theme.colors;
console.log(`${theme.name} is ok. Contrast: ink on a1 ${contrast(c.ink, c.a1).toFixed(2)}, ink on a2 ${contrast(c.ink, c.a2).toFixed(2)}, a1 on bg ${contrast(c.a1, c.bg).toFixed(2)}, a2 on bg ${contrast(c.a2, c.bg).toFixed(2)}.`);

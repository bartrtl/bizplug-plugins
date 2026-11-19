// Checks a proposed card theme the way BizPlug does. Usage, from the repository's root:
//   npx tsx themes/check-theme.ts my-theme.json
import { readFileSync } from "node:fs";
import { CARD_THEMES, cardThemeListProblems, contrast, type CardTheme } from "../source/card-themes";

const file = process.argv[2];
if (!file) {
  console.error("usage: npx tsx themes/check-theme.ts <theme.json>");
  process.exit(1);
}
const theme = JSON.parse(readFileSync(file, "utf8")) as CardTheme;
// A file from themes/ is already in the list: check it on its own, otherwise as one more theme next to the others.
const others = CARD_THEMES.filter((t) => t.id !== theme.id || JSON.stringify(t.colors) !== JSON.stringify(theme.colors));
const problems = cardThemeListProblems([...others, theme]);
if (problems.length) {
  console.error(problems.map((p) => "- " + p).join("\n"));
  process.exit(1);
}
const c = theme.colors;
console.log(`${theme.name} is ok. Contrast: ink on a1 ${contrast(c.ink, c.a1).toFixed(2)}, ink on a2 ${contrast(c.ink, c.a2).toFixed(2)}, a1 on bg ${contrast(c.a1, c.bg).toFixed(2)}, a2 on bg ${contrast(c.a2, c.bg).toFixed(2)}.`);

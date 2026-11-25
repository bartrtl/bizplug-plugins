/**
 * The rules a card layout package must follow (plug-in 0.31.0, `menuLayouts`). Shared by scripts/build-layouts.ts,
 * which builds the layouts into the card, and by the public repository's layouts/check-layout.ts, which developers
 * run on their own layout before proposing it. No imports, so the same file runs in both places.
 *
 * A layout package is a folder `layouts/<id>/` with:
 * - layout.json: { id, name, author: { name, url?, github? }, summary, suits, ownHeader?, sample? }
 *   `sample` names the BizPlug sample business the layout is shown with first, as "<industry>/<slug>"
 *   (hospitality/demo-hotel, coffee-shops/demo-cafe or retail/demo-shop), so a shop layout is not shown on a hotel.
 * - layout.css: styles, every selector scoped under `.lay-<id>`, and every @keyframes named `lay-<id>-<name>`
 * - layout.js: `function render(ctx) { ... return html; }`: a pure function from the card's data to an HTML string
 *
 * A layout never runs code of its own in the card: no events, timers, network or page access. It interacts through
 * the attributes the card handles (data-open, data-ask, data-href, data-lay, data-lay-filter and friends), and the
 * card removes scripts and inline event handlers from what it returns.
 */
export type LayoutMeta = { id: string; name: string; author: { name: string; url?: string; github?: string }; summary: string; suits: string; ownHeader?: boolean; sample?: string };
/** The sample businesses a layout can be shown with (card-layouts.ts PREVIEW_SAMPLES; no imports here). */
const SAMPLES = ["hospitality/demo-hotel", "coffee-shops/demo-cafe", "retail/demo-shop"];

const ID = /^[a-z][a-z0-9-]{1,30}$/;
/** Checked on the whole file, strings included: what a layout must never write into its HTML. */
const FORBIDDEN_TEXT: [RegExp, string][] = [
  [/<\s*script/i, "a <script> tag"],
  [/\son[a-z]+\s*=/i, "an inline event handler (on...=)"],
  [/javascript:/i, "a javascript: address"],
];
/** Checked on the code alone, with strings and comments taken out: what a layout's code must never touch. */
const FORBIDDEN_JS: [RegExp, string][] = [
  [/\b(fetch|XMLHttpRequest|WebSocket|EventSource|importScripts|sendBeacon)\b/, "network access"],
  [/\b(eval|Function|import)\s*\(/, "code evaluation or imports"],
  [/\b(document|window|globalThis|self|parent|top|frames|navigator|location|history|localStorage|sessionStorage|indexedDB|caches|cookieStore)\b/, "access to the page or the browser"],
  [/\b(setTimeout|setInterval|requestAnimationFrame|queueMicrotask|addEventListener|postMessage)\b/, "timers or events"],
  [/\bopenai\b/, "the host's API"],
];
const FORBIDDEN_CSS: [RegExp, string][] = [
  [/@import/i, "@import"],
  [/url\(\s*(?!['"]?data:)/i, "a url() that is not a data: address"],
  [/expression\s*\(/i, "expression()"],
  [/behavior\s*:/i, "behavior:"],
  [/(^|[;{\s])position\s*:\s*fixed/i, "position: fixed (the card grows with its content; there is no screen to fix to)"],
];
export const LIMITS = { js: 24_000, css: 16_000 };

/** The code without comments and string contents, so a class name like "lay-x-top" is not read as `top`. */
function codeOnly(js: string): string {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/[^\n]*/g, " ")
    .replace(/'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`/g, '""');
}

/** The problems with a layout package, or an empty list. */
export function layoutProblems(dir: string, metaText: string, css: string, js: string): string[] {
  const out: string[] = [];
  let meta: LayoutMeta | null = null;
  try {
    meta = JSON.parse(metaText) as LayoutMeta;
  } catch {
    return ["layout.json is not valid JSON."];
  }
  if (!meta || typeof meta !== "object") return ["layout.json must be an object."];
  if (!ID.test(meta.id ?? "")) out.push("layout.json: id must be lower-case letters, digits and hyphens, 2 to 31 characters, starting with a letter.");
  if (meta.id !== dir) out.push(`layout.json: id "${meta.id}" must be the folder's name, "${dir}".`);
  for (const k of ["name", "summary", "suits"] as const) if (typeof meta[k] !== "string" || !meta[k].trim()) out.push(`layout.json: ${k} is required.`);
  if (!meta.author || typeof meta.author.name !== "string" || !meta.author.name.trim()) out.push("layout.json: author.name is required.");
  if (meta.author?.url && !/^https:\/\//.test(meta.author.url)) out.push("layout.json: author.url must be an https address.");
  if (meta.author?.github !== undefined && !/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/.test(String(meta.author.github))) out.push("layout.json: author.github must be a GitHub username, without @ or a link.");
  if (meta.sample !== undefined && !SAMPLES.includes(String(meta.sample))) out.push(`layout.json: sample must be one of ${SAMPLES.join(", ")}.`);
  if (js.length > LIMITS.js) out.push(`layout.js is ${js.length} characters; at most ${LIMITS.js}.`);
  if (css.length > LIMITS.css) out.push(`layout.css is ${css.length} characters; at most ${LIMITS.css}.`);
  if (!/^\s*(\/\/[^\n]*\n|\/\*[\s\S]*?\*\/|\s)*function render\s*\(\s*ctx\s*\)/.test(js)) out.push("layout.js must start with `function render(ctx) {` (comments before it are fine).");
  for (const [re, what] of FORBIDDEN_TEXT) if (re.test(js)) out.push(`layout.js writes ${what}, which a layout may not.`);
  const code = codeOnly(js);
  if (/\$\{/.test(js) && /`/.test(js)) out.push("layout.js: use ' or \" strings joined with +, not template literals (`...${}`).");
  for (const [re, what] of FORBIDDEN_JS) if (re.test(code)) out.push(`layout.js uses ${what}, which a layout may not.`);
  for (const [re, what] of FORBIDDEN_CSS) if (re.test(css)) out.push(`layout.css uses ${what}, which a layout may not.`);
  // Every rule must be scoped to the layout, so a layout cannot restyle the rest of the card.
  const scope = `.lay-${meta.id}`;
  // CSS animations: each @keyframes is named lay-<id>-<name>, so a layout cannot replace the card's own
  // animations or another layout's. Their from/to/% steps are not selectors.
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const frames = [...bare.matchAll(/@(?:-webkit-)?keyframes\s+([^\s{]+)\s*\{/g)].map((m) => m[1]);
  const loneFrames = frames.filter((n) => !n.startsWith(`lay-${meta!.id}-`));
  if (loneFrames.length) out.push(`layout.css: every @keyframes name must start with lay-${meta.id}-; not: ${[...new Set(loneFrames)].slice(0, 5).join(" | ")}`);
  const body = bare.replace(/@(media|supports|container)[^{]*\{/g, "").replace(/@(?:-webkit-)?keyframes\s+[^\s{]+\s*\{/g, "{");
  const selectors = [...body.matchAll(/([^{}@]+)\{/g)].map((m) => m[1].trim()).filter((s) => s && !/^(from|to|\d+%)$/.test(s) && !s.startsWith("@"));
  const loose = selectors.flatMap((s) => s.split(",").map((x) => x.trim())).filter((x) => x && !x.startsWith(scope) && !/^(from|to|\d+%)$/.test(x));
  if (loose.length) out.push(`layout.css: every selector must start with ${scope}; not: ${[...new Set(loose)].slice(0, 5).join(" | ")}`);
  return out;
}

// ---- Run it: npx tsx layouts/check-layout.ts layouts/<your-layout> ----
import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
const folder = process.argv[2];
if (folder) {
  const read = (f: string) => (existsSync(join(folder, f)) ? readFileSync(join(folder, f), "utf8") : "");
  const problems = layoutProblems(basename(folder), read("layout.json"), read("layout.css"), read("layout.js"));
  for (const size of ["desktop", "mobile"]) if (!existsSync(join(folder, `preview-${size}.png`))) problems.push(`preview-${size}.png is missing (make it with preview.ts and a screenshot).`);
  if (problems.length) {
    console.error(problems.map((p) => "✗ " + p).join("\n"));
    process.exit(1);
  }
  console.log("✓ " + basename(folder) + " follows the layout rules.");
}

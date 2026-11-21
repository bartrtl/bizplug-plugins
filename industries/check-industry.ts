// Checks a new industry proposal (community/industries/<slug>.json) the way BizPlug reads it.
// Usage, from the repository's root:
//   npx tsx industries/check-industry.ts community/industries/<slug>.json
// Generated from the BizPlug website with the rest of this repository: please do not edit it.
import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

const ENGINES = ["order","stay","appt","quote","track"];
const SPANS = ["nights","days","single"];
const GROUPS = ["Business essentials","Retail & food","Property & auto","Health & wellness","Community & public","Travel & leisure","Finance & B2B","Home & trades"];
const COMMON_TOOLS = ["show_menu","get_business_info","get_contact","open_form"];

const file = process.argv[2];
if (!file) {
  console.error("usage: npx tsx industries/check-industry.ts community/industries/<slug>.json");
  process.exit(1);
}
const problems: string[] = [];
let p: Record<string, any> = {};
try {
  p = JSON.parse(readFileSync(file, "utf8"));
} catch (e) {
  console.error("✗ " + file + " is not valid JSON: " + (e instanceof Error ? e.message : e));
  process.exit(1);
}
const text = (key: string, max: number, required = true) => {
  const v = p[key];
  if (v === undefined || v === "") { if (required) problems.push(key + " is missing."); return; }
  if (typeof v !== "string" || !v.trim()) problems.push(key + " must be text.");
  else if (v.length > max) problems.push(key + " must be at most " + max + " characters (it has " + v.length + ").");
};
const slug = String(p.slug ?? "");
if (!/^[a-z][a-z0-9-]{1,39}$/.test(slug)) problems.push("slug must be 2 to 40 lower-case letters, digits or hyphens, starting with a letter.");
if (basename(file) !== slug + ".json") problems.push("the file must be named after its slug: " + slug + ".json.");
if (existsSync(join("plugins", slug))) problems.push("plugins/" + slug + "/ already exists: that industry is already here.");
text("name", 60);
text("title", 60);
text("noun", 40);
text("ask", 160);
text("covers", 200);
text("rule", 300, false);
text("who", 300, false);
text("author", 80);
if (typeof p.ask === "string" && !p.ask.trim().endsWith("?")) problems.push("ask must be a question a customer would ask, ending with ?.");
if (!GROUPS.includes(p.group)) problems.push("group must be one of: " + GROUPS.join(", ") + ".");
if (!ENGINES.includes(p.engine)) problems.push("engine must be one of: " + ENGINES.join(", ") + " (INDUSTRIES.md explains each).");
if (p.engine === "stay") {
  if (!SPANS.includes(p.span)) problems.push("a stay industry needs span: " + SPANS.join(", ") + ".");
  if (p.perGuest !== undefined && typeof p.perGuest !== "boolean") problems.push("perGuest must be true or false.");
} else if (p.span !== undefined || p.perGuest !== undefined) problems.push("span and perGuest are only for the stay engine.");
const tools = p.tools ?? {};
const names = ["lookup", "request", "status"].map((k) => tools[k]);
["lookup", "request", "status"].forEach((k, i) => {
  if (typeof names[i] !== "string" || !/^[a-z][a-z0-9_]{2,40}$/.test(names[i])) problems.push("tools." + k + " must be a tool name: lower case, digits and underscores, 3 to 41 characters.");
  else if (COMMON_TOOLS.includes(names[i])) problems.push("tools." + k + " is the name of a tool every plug-in already has: " + names[i] + ".");
});
if (new Set(names).size !== 3) problems.push("the three tool names must be different.");
for (const k of Object.keys(tools)) if (!["lookup", "request", "status"].includes(k)) problems.push("tools has an unknown key: " + k + ".");
if (p.example !== undefined) {
  const e = p.example;
  if (!e || typeof e !== "object" || typeof e.business !== "string" || typeof e.item !== "string") problems.push("example needs business and item (and optionally price).");
  else if (e.price !== undefined && !/^\d+(\.\d{2})?$/.test(String(e.price))) problems.push("example.price must be a number like 15.00.");
}
const known = ["slug", "name", "group", "engine", "title", "tools", "noun", "ask", "covers", "rule", "span", "perGuest", "example", "who", "author"];
for (const k of Object.keys(p)) if (!known.includes(k)) problems.push("unknown field: " + k + ".");
const secret = /(sk_live_|sk_test_|ghp_[A-Za-z0-9]{20}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY)/;
if (secret.test(readFileSync(file, "utf8"))) problems.push("the file looks like it holds a secret: remove it.");
if (problems.length) {
  console.error(problems.map((x) => "✗ " + x).join("\n"));
  process.exit(1);
}
console.log("✓ " + p.name + " (" + slug + ") is a valid proposal: engine " + p.engine + ", tools " + names.join(", ") + ".");

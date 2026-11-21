// Checks an industry file (community/industries/<slug>.json) the way BizPlug reads it.
// Usage, from the repository's root:
//   npx tsx industries/check-industry.ts community/industries/<slug>.json
// Generated from the BizPlug website with the rest of this repository: please do not edit it.
import { readFileSync } from "node:fs";
import { basename } from "node:path";

/**
 * The check of an industry file: community/industries/<slug>.json in the public plug-in repository
 * (github.com/msg2ai/bizplug-plugins). One function, with no imports, because it runs in three places that must
 * agree: the public repository's own industries/check-industry.ts (this file's text is written into it by
 * scripts/plugins-industry-proposals.ts, so this file is public), the preview of an open pull request
 * (industry-proposal.ts) and the sync that makes merged files industries (scripts/sync-industries.ts).
 *
 * A file that passes is a complete industry: the fields the plug-in is built from, and optionally the words of its
 * page on the website (`page`), a worked chat example (`chat`), an icon, an accent and the day it was added.
 * Everything in it is text that is shown or read, never code.
 */
type IndustryFileRules = {
  engines: string[];
  spans: string[];
  groups: string[];
  /** Names of tools every plug-in already has. */
  commonTools: string[];
  /** Slugs of the industries built into the website: a file may not take one. */
  builtIn: string[];
  icons: string[];
  accents: string[];
};

function industryFileProblems(p: Record<string, unknown>, rules: IndustryFileRules, fileName?: string): string[] {
  const out: string[] = [];
  const isText = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
  const text = (key: string, max: number, required = true) => {
    const v = p[key];
    if (v === undefined || v === "") {
      if (required) out.push(`${key} is missing.`);
      return;
    }
    if (!isText(v)) out.push(`${key} must be text.`);
    else if (v.length > max) out.push(`${key} must be at most ${max} characters (it has ${v.length}).`);
  };
  const slug = String(p.slug ?? "");
  if (!/^[a-z][a-z0-9-]{1,39}$/.test(slug)) out.push("slug must be 2 to 40 lower-case letters, digits or hyphens, starting with a letter.");
  if (fileName && fileName !== `${slug}.json`) out.push(`the file must be named after its slug: ${slug}.json.`);
  if (rules.builtIn.includes(slug)) out.push(`${slug} is already an industry.`);
  text("name", 60);
  text("title", 60);
  text("noun", 40);
  text("ask", 160);
  text("covers", 200);
  text("rule", 300, false);
  text("who", 300, false);
  text("author", 80);
  if (typeof p.ask === "string" && !p.ask.trim().endsWith("?")) out.push("ask must be a question a customer would ask, ending with ?.");
  if (!rules.groups.includes(String(p.group))) out.push(`group must be one of: ${rules.groups.join(", ")}.`);
  if (!rules.engines.includes(String(p.engine))) out.push(`engine must be one of: ${rules.engines.join(", ")}.`);
  if (p.engine === "stay") {
    if (!rules.spans.includes(String(p.span))) out.push(`a stay industry needs span: ${rules.spans.join(", ")}.`);
    if (p.perGuest !== undefined && typeof p.perGuest !== "boolean") out.push("perGuest must be true or false.");
  } else if (p.span !== undefined || p.perGuest !== undefined) out.push("span and perGuest are only for the stay engine.");
  const tools = (p.tools && typeof p.tools === "object" ? p.tools : {}) as Record<string, unknown>;
  const names = ["lookup", "request", "status"].map((k) => tools[k]);
  ["lookup", "request", "status"].forEach((k, i) => {
    const n = names[i];
    if (typeof n !== "string" || !/^[a-z][a-z0-9_]{2,40}$/.test(n)) out.push(`tools.${k} must be a tool name: lower case, digits and underscores, 3 to 41 characters.`);
    else if (rules.commonTools.includes(n)) out.push(`tools.${k} is the name of a tool every plug-in already has: ${n}.`);
  });
  if (new Set(names).size !== 3) out.push("the three tool names must be different.");
  for (const k of Object.keys(tools)) if (!["lookup", "request", "status"].includes(k)) out.push(`tools has an unknown key: ${k}.`);
  if (p.example !== undefined) {
    const e = p.example as Record<string, unknown> | null;
    if (!e || typeof e !== "object" || !isText(e.business) || !isText(e.item)) out.push("example needs business and item (and optionally price).");
    else {
      if (e.business.length > 60 || e.item.length > 60) out.push("example.business and example.item must be at most 60 characters.");
      if (e.price !== undefined && !/^\d+(\.\d{2})?$/.test(String(e.price))) out.push("example.price must be a number like 15.00.");
      for (const k of Object.keys(e)) if (!["business", "item", "price"].includes(k)) out.push(`example has an unknown key: ${k}.`);
    }
  }
  if (p.icon !== undefined && !rules.icons.includes(String(p.icon))) out.push(`icon must be one of: ${rules.icons.join(", ")}.`);
  if (p.accent !== undefined && !rules.accents.includes(String(p.accent))) out.push(`accent must be one of: ${rules.accents.join(", ")}.`);
  if (p.added !== undefined) {
    const d = String(p.added);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || Number.isNaN(Date.parse(`${d}T00:00:00Z`))) out.push("added must be a day as YYYY-MM-DD.");
  }
  // The words of the industry's page on the website. Rows are "Title::description".
  if (p.page !== undefined) {
    const g = p.page as Record<string, unknown> | null;
    if (!g || typeof g !== "object" || Array.isArray(g)) out.push("page must be an object.");
    else {
      if (!isText(g.headline) || g.headline.length > 90) out.push("page.headline must be text of at most 90 characters.");
      if (!isText(g.problem) || g.problem.length > 500) out.push("page.problem must be text of at most 500 characters.");
      const rows = (key: string, count: number, max: number, pair: boolean) => {
        const v = g[key];
        if (!Array.isArray(v) || v.length !== count) return out.push(`page.${key} must be a list of ${count}.`);
        v.forEach((row, i) => {
          if (!isText(row) || row.length > max) out.push(`page.${key}[${i}] must be text of at most ${max} characters.`);
          else if (pair && (row.split("::").length !== 2 || row.split("::").some((part) => !part.trim()))) out.push(`page.${key}[${i}] must be written as "Title::description".`);
          else if (!pair && row.includes("::")) out.push(`page.${key}[${i}] is one short step, without "::".`);
        });
      };
      rows("valueProps", 3, 200, true);
      rows("moments", 4, 200, true);
      rows("journeys", 4, 60, false);
      rows("faqs", 2, 400, true);
      for (const k of Object.keys(g)) if (!["headline", "problem", "valueProps", "moments", "journeys", "faqs"].includes(k)) out.push(`page has an unknown key: ${k}.`);
    }
  }
  // The worked example on the page: what a customer asks, what the plug-in shows, and what is sent.
  if (p.chat !== undefined) {
    const c = p.chat as Record<string, unknown> | null;
    if (!c || typeof c !== "object" || Array.isArray(c)) out.push("chat must be an object.");
    else {
      if (!isText(c.business) || c.business.length > 60) out.push("chat.business must be text of at most 60 characters.");
      if (c.ask !== undefined && (!isText(c.ask) || c.ask.length > 160)) out.push("chat.ask must be text of at most 160 characters.");
      if (!isText(c.confirm) || c.confirm.length > 160) out.push("chat.confirm must be text of at most 160 characters.");
      if (!isText(c.sent) || c.sent.length > 200) out.push("chat.sent must be text of at most 200 characters.");
      if (!Array.isArray(c.answer) || c.answer.length < 1 || c.answer.length > 8) out.push("chat.answer must be a list of 1 to 8 lines.");
      else
        c.answer.forEach((line, i) => {
          if (!isText(line) || line.length > 160 || line.includes("\n")) return out.push(`chat.answer[${i}] must be one line of at most 160 characters.`);
          const body = line.replace(/^\*/, "");
          if (line.startsWith("~")) return;
          if (line.startsWith("@")) {
            if (!/^@[^:]+: .+/.test(line)) out.push(`chat.answer[${i}]: open times are written as "@Friday: 17:00, *19:00".`);
          } else if (line.startsWith("!")) {
            if (line.split("|").length < 3) out.push(`chat.answer[${i}]: a status is written as "!reference|what|state|detail".`);
          } else if (line.startsWith("#")) {
            if (!line.includes(">")) out.push(`chat.answer[${i}]: progress is written as "#Step>*Step>Step".`);
          } else if (body.split("|").length < 2 || body.split("|").length > 4) out.push(`chat.answer[${i}]: an option is written as "emoji|name|detail|price" (detail and price may be empty).`);
        });
      for (const k of Object.keys(c)) if (!["business", "ask", "answer", "confirm", "sent"].includes(k)) out.push(`chat has an unknown key: ${k}.`);
    }
  }
  const known = ["slug", "name", "group", "engine", "title", "tools", "noun", "ask", "covers", "rule", "span", "perGuest", "example", "who", "author", "icon", "accent", "added", "page", "chat"];
  for (const k of Object.keys(p)) if (!known.includes(k)) out.push(`unknown field: ${k}.`);
  if (/(sk_live_|sk_test_|ghp_[A-Za-z0-9]{20}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY)/.test(JSON.stringify(p))) out.push("the file looks like it holds a secret: remove it.");
  return out;
}

const RULES: IndustryFileRules = {
  "engines": [
    "order",
    "stay",
    "appt",
    "quote",
    "track"
  ],
  "spans": [
    "nights",
    "days",
    "single"
  ],
  "groups": [
    "Business essentials",
    "Retail & food",
    "Property & auto",
    "Health & wellness",
    "Community & public",
    "Travel & leisure",
    "Finance & B2B",
    "Home & trades"
  ],
  "commonTools": [
    "show_menu",
    "get_business_info",
    "get_contact",
    "open_form"
  ],
  "builtIn": [
    "events",
    "hospitality",
    "agencies",
    "nonprofits",
    "saas",
    "consulting",
    "retail",
    "restaurants",
    "real-estate",
    "healthcare",
    "education",
    "travel",
    "home-services",
    "fitness",
    "beauty",
    "automotive",
    "financial-services",
    "insurance",
    "legal",
    "logistics",
    "dental",
    "optometry",
    "dermatology",
    "chiropractic",
    "mental-health",
    "veterinary",
    "pharmacy",
    "med-spa",
    "senior-care",
    "home-health",
    "coffee-shops",
    "bars-nightlife",
    "catering",
    "food-delivery",
    "meal-kits",
    "grocery",
    "ghost-kitchens",
    "fashion",
    "electronics",
    "furniture",
    "beauty-ecommerce",
    "subscriptions",
    "florists",
    "convenience-stores",
    "hvac",
    "plumbing",
    "electricians",
    "cleaning",
    "landscaping",
    "pest-control",
    "moving-storage",
    "solar",
    "property-management",
    "lending",
    "wealth",
    "crypto",
    "accounting",
    "chambers",
    "recruiting",
    "hr-comms",
    "cybersecurity",
    "dev-tools",
    "airlines",
    "cruise-lines",
    "car-rental",
    "theme-parks",
    "museums",
    "casinos",
    "sports-teams",
    "wedding-services",
    "photography",
    "government",
    "utilities",
    "telecom",
    "religious-orgs",
    "associations",
    "childcare",
    "tutoring",
    "universities",
    "political-campaigns",
    "public-transit",
    "coworking"
  ],
  "icons": [
    "AppWindow",
    "Armchair",
    "Award",
    "Baby",
    "Bike",
    "Bitcoin",
    "Bone",
    "BookOpen",
    "Boxes",
    "Brain",
    "Briefcase",
    "Bug",
    "Building",
    "Building2",
    "Bus",
    "Calculator",
    "Camera",
    "Car",
    "CarFront",
    "ChefHat",
    "Church",
    "Code",
    "Coffee",
    "CookingPot",
    "Dices",
    "Droplets",
    "Dumbbell",
    "Eye",
    "FerrisWheel",
    "FileText",
    "Flower",
    "Gavel",
    "Gem",
    "GraduationCap",
    "HandCoins",
    "Handshake",
    "Heart",
    "HeartHandshake",
    "HeartPulse",
    "Hotel",
    "Landmark",
    "Lightbulb",
    "Lock",
    "Megaphone",
    "Palette",
    "PawPrint",
    "Pill",
    "Plane",
    "PlaneTakeoff",
    "RadioTower",
    "Repeat",
    "Salad",
    "School",
    "Scissors",
    "ShieldCheck",
    "Ship",
    "Shirt",
    "ShoppingBag",
    "ShoppingCart",
    "Smartphone",
    "Sofa",
    "Sparkles",
    "SprayCan",
    "Stethoscope",
    "Store",
    "Sun",
    "Ticket",
    "Trees",
    "TrendingUp",
    "Trophy",
    "Truck",
    "UserPlus",
    "Users",
    "Utensils",
    "UtensilsCrossed",
    "Vote",
    "Wind",
    "Wine",
    "Wrench",
    "Zap"
  ],
  "accents": [
    "lime",
    "mint",
    "aqua",
    "amber",
    "sky"
  ]
};

const file = process.argv[2];
if (!file) {
  console.error("usage: npx tsx industries/check-industry.ts community/industries/<slug>.json");
  process.exit(1);
}
let p: Record<string, unknown> = {};
try {
  p = JSON.parse(readFileSync(file, "utf8"));
} catch (e) {
  console.error("✗ " + file + " is not valid JSON: " + (e instanceof Error ? e.message : e));
  process.exit(1);
}
if (!p || typeof p !== "object" || Array.isArray(p)) {
  console.error("✗ " + file + " must be a JSON object.");
  process.exit(1);
}
const problems = industryFileProblems(p, RULES, basename(file));
if (problems.length) {
  console.error(problems.map((x) => "✗ " + x).join("\n"));
  process.exit(1);
}
const tools = p.tools as Record<string, string>;
console.log("✓ " + p.name + " (" + p.slug + ") is a valid industry: engine " + p.engine + ", tools " + [tools.lookup, tools.request, tools.status].join(", ") + "." + (p.page ? "" : " It has no page copy of its own: its page will use the engine's words (add `page` to write your own)."));

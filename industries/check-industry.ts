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
 * page on the website (`page`), a worked chat example (`chat`), an icon, an accent, the day it was added, and how
 * its author is credited (`authorUrl`, `github`).
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
  /** Every industry there is (built in and contributed): a new one should not be another name for one of them. */
  existing: { slug: string; name: string; group: string; engine: string; /** What it covers and a customer question. */ about: string }[];
  icons: string[];
  accents: string[];
  /** Options a file may switch on: each adds tools, menu options and data files already built into the plug-in, on the engines (and stay spans) it was built for. */
  options: { id: string; adds: string; engines: string[]; spans?: string[] }[];
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
  // How the contributor is credited on the website (/contributors, the industry's page): an https link of their
  // own and their GitHub username. Both optional, both public.
  if (p.authorUrl !== undefined && !(typeof p.authorUrl === "string" && /^https:\/\/[^\s"'<>]{3,200}$/.test(p.authorUrl))) out.push("authorUrl must be an https address (your site or profile).");
  if (p.github !== undefined && !(typeof p.github === "string" && /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/.test(p.github))) out.push("github must be your GitHub username, without @ or a link.");
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
  // Options: capabilities the plug-in already has (members, an event guide, a rental concierge...), switched on by name.
  if (p.options !== undefined) {
    if (!Array.isArray(p.options) || p.options.some((o) => typeof o !== "string")) out.push(`options must be a list of option names: ${rules.options.map((o) => o.id).join(", ")}.`);
    else {
      if (new Set(p.options).size !== p.options.length) out.push("options lists an option twice.");
      for (const id of p.options as string[]) {
        const o = rules.options.find((x) => x.id === id);
        if (!o) out.push(`options: ${id} is not an option. Options: ${rules.options.map((x) => x.id).join(", ")}.`);
        else if (!o.engines.includes(String(p.engine)) || (o.spans && p.engine === "stay" && !o.spans.includes(String(p.span))))
          out.push(`options: ${id} works on ${o.engines.map((e) => (e === "stay" && o.spans ? `stay (span ${o.spans.join(" or ")})` : e)).join(" or ")} only, not on ${String(p.engine)}${p.engine === "stay" ? ` with span ${String(p.span)}` : ""}.`);
      }
    }
  }
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
  const known = ["slug", "name", "group", "engine", "title", "tools", "noun", "ask", "covers", "rule", "span", "perGuest", "example", "who", "author", "authorUrl", "github", "icon", "accent", "added", "page", "chat", "options"];
  for (const k of Object.keys(p)) if (!known.includes(k)) out.push(`unknown field: ${k}.`);
  if (/(sk_live_|sk_test_|ghp_[A-Za-z0-9]{20}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY)/.test(JSON.stringify(p))) out.push("the file looks like it holds a secret: remove it.");
  return out;
}

// Words that say nothing about what an industry is (what every business has, and the words of any customer
// question), so two industries sharing only these are not alike.
const GENERIC = new Set(
  ("and the of for with from your you our are can could will would what when where which who how does did have has " +
    "there this that today tonight tomorrow week weekend day next any about get need want much many book booking request " +
    "requests order status price prices pricing cost costs fee fees hour hours opening open time times service services " +
    "shop store business company agency studio center centre provider local professional other information info contact " +
    "option available availability question answer help appointment take see check give tell").split(" "),
);
const words = (s: string) =>
  new Set(
    s
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter((w) => !GENERIC.has(w))
      .map((w) => (w.length > 4 && w.endsWith("ies") ? w.slice(0, -3) + "y" : w.length > 4 && /(ss|x|ch|sh)es$/.test(w) ? w.slice(0, -2) : w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w))
      .filter((w) => w.length > 2 && !GENERIC.has(w)),
  );

type SimilarIndustry = { slug: string; name: string; why: string };

/**
 * The existing industries to look at before adding a new one, since a business usually fits an existing industry's
 * plug-in under its own name. Each is scored on the words it shares with the file: a word of the name counts three,
 * a word of what it covers or of its customer question one, and the same group on the same engine one more. A hint for
 * the contributor and the reviewer, never a reason to refuse the file. At most `max`, most alike first.
 */
function similarIndustries(p: Record<string, unknown>, rules: IndustryFileRules, max = 5): SimilarIndustry[] {
  const name = words(`${String(p.name ?? "")} ${String(p.slug ?? "").replace(/-/g, " ")}`);
  const all = new Set([...name, ...words(["covers", "ask", "noun", "title", "who"].map((k) => String(p[k] ?? "")).join(" "))]);
  return rules.existing
    .filter((i) => i.slug !== p.slug)
    .map((i) => {
      const theirName = words(`${i.name} ${i.slug.replace(/-/g, " ")}`);
      const theirs = new Set([...theirName, ...words(i.about)]);
      const sharedName = [...theirName].filter((w) => name.has(w));
      const shared = [...theirs].filter((w) => all.has(w));
      const kind = i.group === p.group && i.engine === p.engine;
      return { slug: i.slug, name: i.name, score: sharedName.length * 3 + shared.length + (kind ? 1 : 0), shared, kind };
    })
    .filter((i) => i.score >= 3)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, max)
    .map((i) => ({ slug: i.slug, name: i.name, why: [`shares ${i.shared.join(", ")}`, i.kind ? "same group and engine" : ""].filter(Boolean).join("; ") }));
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
    "vacation-rentals",
    "tour-operators",
    "dmc",
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
  "existing": [
    {
      "slug": "events",
      "name": "Events & Conferences",
      "group": "Business essentials",
      "engine": "stay",
      "about": "schedule, venue, ticket and parking questions. What time does registration open, and where do I park?"
    },
    {
      "slug": "hospitality",
      "name": "Hospitality & Hotels",
      "group": "Business essentials",
      "engine": "stay",
      "about": "rooms, amenities, policies and booking enquiries. Do you have a room for two nights next weekend?"
    },
    {
      "slug": "agencies",
      "name": "Marketing Agencies",
      "group": "Business essentials",
      "engine": "appt",
      "about": "services, case studies and project briefs. What services do you offer, and how do we get started?"
    },
    {
      "slug": "nonprofits",
      "name": "Nonprofits & Charities",
      "group": "Business essentials",
      "engine": "track",
      "about": "programs, events, volunteering and giving. How can I volunteer or donate?"
    },
    {
      "slug": "saas",
      "name": "SaaS & Software",
      "group": "Business essentials",
      "engine": "appt",
      "about": "features, integrations, plans pages and demo requests. Does it integrate with our CRM, and what does it cost?"
    },
    {
      "slug": "consulting",
      "name": "Consulting & Professional Services",
      "group": "Business essentials",
      "engine": "appt",
      "about": "practice areas, process and consultation requests. Do you work with companies my size?"
    },
    {
      "slug": "retail",
      "name": "Retail & E-commerce",
      "group": "Retail & food",
      "engine": "order",
      "about": "products, stock, hours and returns. Do you have this in stock, and what are your hours?"
    },
    {
      "slug": "restaurants",
      "name": "Restaurants & Food Service",
      "group": "Retail & food",
      "engine": "order",
      "about": "menu, allergens, hours and reservation requests. Do you have gluten-free options, and can I book for six?"
    },
    {
      "slug": "real-estate",
      "name": "Real Estate",
      "group": "Property & auto",
      "engine": "appt",
      "about": "listings, neighborhoods and showing requests. Is the three-bedroom on Oak Street still available?"
    },
    {
      "slug": "healthcare",
      "name": "Healthcare & Clinics",
      "group": "Health & wellness",
      "engine": "appt",
      "about": "services, hours, insurance and appointment requests. Are you accepting new patients, and which insurance do you take?"
    },
    {
      "slug": "education",
      "name": "Education & Schools",
      "group": "Community & public",
      "engine": "appt",
      "about": "admissions, programs, calendars and tuition. When is enrollment open, and what are the tuition options?"
    },
    {
      "slug": "travel",
      "name": "Travel & Tourism",
      "group": "Travel & leisure",
      "engine": "stay",
      "about": "packages, itineraries and travel enquiries. What's included in the weekend package?"
    },
    {
      "slug": "home-services",
      "name": "Local & Home Services",
      "group": "Property & auto",
      "engine": "quote",
      "about": "service areas, pricing and job requests. Do you cover my zip code, and can someone come this week?"
    },
    {
      "slug": "fitness",
      "name": "Fitness & Gyms",
      "group": "Health & wellness",
      "engine": "appt",
      "about": "classes, memberships and trial passes. What classes are on tonight, and is there a trial pass?"
    },
    {
      "slug": "beauty",
      "name": "Beauty & Salons",
      "group": "Health & wellness",
      "engine": "appt",
      "about": "services, pricing, hours and booking requests. How long does a color appointment take, and what does it cost?"
    },
    {
      "slug": "automotive",
      "name": "Automotive & Dealerships",
      "group": "Property & auto",
      "engine": "appt",
      "about": "service, inventory, hours and appointment requests. Can you look at a check-engine light this week?"
    },
    {
      "slug": "financial-services",
      "name": "Financial Services & Banking",
      "group": "Finance & B2B",
      "engine": "appt",
      "about": "products, branches and how to get started. What do I need to open an account?"
    },
    {
      "slug": "insurance",
      "name": "Insurance",
      "group": "Finance & B2B",
      "engine": "quote",
      "about": "coverage types and quote requests. What does a basic home policy cover?"
    },
    {
      "slug": "legal",
      "name": "Legal Services",
      "group": "Finance & B2B",
      "engine": "appt",
      "about": "practice areas, fees and consultation requests. Do you handle family law, and how do I book a consultation?"
    },
    {
      "slug": "logistics",
      "name": "Logistics & Delivery",
      "group": "Community & public",
      "engine": "quote",
      "about": "services, coverage, cut-off times and quote requests. Where do I drop off a pallet, and what are your cut-off times?"
    },
    {
      "slug": "dental",
      "name": "Dental Practices",
      "group": "Health & wellness",
      "engine": "appt",
      "about": "services, hours, insurance and appointment requests. Do you take my insurance, and do you see emergencies?"
    },
    {
      "slug": "optometry",
      "name": "Optometry & Eye Care",
      "group": "Health & wellness",
      "engine": "appt",
      "about": "exams, frames, insurance and appointment requests. Can I book an eye exam, and do you carry these frames?"
    },
    {
      "slug": "dermatology",
      "name": "Dermatology & Skin",
      "group": "Health & wellness",
      "engine": "appt",
      "about": "services, availability and appointment requests. How soon can I be seen for a skin check?"
    },
    {
      "slug": "chiropractic",
      "name": "Chiropractic & PT",
      "group": "Health & wellness",
      "engine": "appt",
      "about": "first-visit info, services and appointment requests. Do I need a referral, and what happens at a first visit?"
    },
    {
      "slug": "mental-health",
      "name": "Mental Health & Therapy",
      "group": "Health & wellness",
      "engine": "appt",
      "about": "availability, fees, intake steps and telehealth options. Are you accepting new clients, and do you offer telehealth?"
    },
    {
      "slug": "veterinary",
      "name": "Veterinary & Pet Care",
      "group": "Health & wellness",
      "engine": "appt",
      "about": "services, hours, vaccines and appointment requests. Can you see my dog today, and do you do vaccines?"
    },
    {
      "slug": "pharmacy",
      "name": "Pharmacies",
      "group": "Health & wellness",
      "engine": "track",
      "about": "hours, services, vaccines and where to start a refill. Do you offer flu shots, and when do you close?"
    },
    {
      "slug": "med-spa",
      "name": "Med Spas & Aesthetics",
      "group": "Health & wellness",
      "engine": "appt",
      "about": "treatments, pricing and consultation requests. What does a first facial cost?"
    },
    {
      "slug": "senior-care",
      "name": "Senior Care & Communities",
      "group": "Health & wellness",
      "engine": "appt",
      "about": "care levels, amenities and tour requests. What levels of care do you offer, and can I tour this week?"
    },
    {
      "slug": "home-health",
      "name": "Home Health & Hospice",
      "group": "Health & wellness",
      "engine": "appt",
      "about": "services, coverage areas and intake enquiries. Which areas do you serve, and how do I start care?"
    },
    {
      "slug": "coffee-shops",
      "name": "Coffee Shops & Cafes",
      "group": "Retail & food",
      "engine": "order",
      "about": "menu, hours, specials and catering orders. What time do you open, and do you have oat milk?"
    },
    {
      "slug": "bars-nightlife",
      "name": "Bars & Nightlife",
      "group": "Retail & food",
      "engine": "stay",
      "about": "events, covers, menus and table requests. Is there a cover tonight, and can I book a table?"
    },
    {
      "slug": "catering",
      "name": "Catering & Events",
      "group": "Retail & food",
      "engine": "quote",
      "about": "menus, minimums and event quote requests. Can you cater for fifty people on the 20th?"
    },
    {
      "slug": "food-delivery",
      "name": "Food Delivery",
      "group": "Retail & food",
      "engine": "order",
      "about": "delivery zones, minimums and order help. Do you deliver to my address, and what's the minimum order?"
    },
    {
      "slug": "meal-kits",
      "name": "Meal Kits & Subscriptions",
      "group": "Retail & food",
      "engine": "order",
      "about": "plans, menus, delivery days and account help. Can I skip a week or change my plan?"
    },
    {
      "slug": "grocery",
      "name": "Grocery & Supermarkets",
      "group": "Retail & food",
      "engine": "order",
      "about": "specials, departments, pickup and delivery. What are this week's specials, and do you offer pickup?"
    },
    {
      "slug": "ghost-kitchens",
      "name": "Ghost & Cloud Kitchens",
      "group": "Retail & food",
      "engine": "order",
      "about": "brands, menus, delivery times and order help. Which brands can I order from, and how long is delivery?"
    },
    {
      "slug": "fashion",
      "name": "Fashion & Apparel",
      "group": "Retail & food",
      "engine": "order",
      "about": "sizing, stock, shipping and returns. Do you have this in my size, and what's your returns policy?"
    },
    {
      "slug": "electronics",
      "name": "Electronics & Gadgets",
      "group": "Retail & food",
      "engine": "order",
      "about": "products, specs, warranty and support. Is this model in stock, and what's the warranty?"
    },
    {
      "slug": "furniture",
      "name": "Furniture & Home Goods",
      "group": "Retail & food",
      "engine": "order",
      "about": "collections, materials, delivery and returns. Does this sofa come in other colors, and when can you deliver?"
    },
    {
      "slug": "beauty-ecommerce",
      "name": "Beauty E-commerce",
      "group": "Retail & food",
      "engine": "order",
      "about": "products, ingredients, shade help and shipping. Which shade suits my skin tone, and is it cruelty-free?"
    },
    {
      "slug": "subscriptions",
      "name": "Subscription Boxes",
      "group": "Retail & food",
      "engine": "order",
      "about": "plans, box contents and pausing or changing a plan. What's in this month's box, and how do I pause?"
    },
    {
      "slug": "florists",
      "name": "Florists & Flower Delivery",
      "group": "Retail & food",
      "engine": "order",
      "about": "bouquets and prices, seasonal flowers, delivery areas, card messages and wedding and funeral flowers. Can you deliver white roses downtown tomorrow morning, and what does it cost?"
    },
    {
      "slug": "convenience-stores",
      "name": "Convenience & C-Stores",
      "group": "Retail & food",
      "engine": "order",
      "about": "hours, products, fuel and services. Are you open 24 hours, and do you carry this item?"
    },
    {
      "slug": "hvac",
      "name": "HVAC & Heating/Cooling",
      "group": "Home & trades",
      "engine": "quote",
      "about": "service areas, emergencies, maintenance plans and quotes. My AC stopped working. Can someone come today?"
    },
    {
      "slug": "plumbing",
      "name": "Plumbing",
      "group": "Home & trades",
      "engine": "quote",
      "about": "emergency service, pricing and job requests. Do you offer emergency service, and what's the call-out fee?"
    },
    {
      "slug": "electricians",
      "name": "Electricians",
      "group": "Home & trades",
      "engine": "quote",
      "about": "services, licensing, EV chargers and quotes. Do you install EV chargers, and are you licensed?"
    },
    {
      "slug": "cleaning",
      "name": "Cleaning Services",
      "group": "Home & trades",
      "engine": "quote",
      "about": "packages, pricing and booking requests. How much for a three-bedroom deep clean?"
    },
    {
      "slug": "landscaping",
      "name": "Landscaping & Lawn",
      "group": "Home & trades",
      "engine": "quote",
      "about": "services, seasonal plans and quote requests. Do you offer weekly mowing, and can you quote a patio?"
    },
    {
      "slug": "pest-control",
      "name": "Pest Control",
      "group": "Home & trades",
      "engine": "quote",
      "about": "treatments, safety and inspection requests. How do you treat ants, and is it pet-safe?"
    },
    {
      "slug": "moving-storage",
      "name": "Moving & Storage",
      "group": "Home & trades",
      "engine": "quote",
      "about": "move sizes, storage and quote requests. How much to move a two-bedroom, and do you offer storage?"
    },
    {
      "slug": "solar",
      "name": "Solar & Clean Energy",
      "group": "Home & trades",
      "engine": "quote",
      "about": "savings estimates, incentives and consultation requests. How much could I save, and what incentives apply?"
    },
    {
      "slug": "property-management",
      "name": "Property Management",
      "group": "Home & trades",
      "engine": "track",
      "about": "available rentals, maintenance requests and policies. How do I submit a repair request, and what's available to rent?"
    },
    {
      "slug": "lending",
      "name": "Lending & Mortgages",
      "group": "Finance & B2B",
      "engine": "appt",
      "about": "loan types, requirements and enquiries. What do I need to apply for a mortgage?"
    },
    {
      "slug": "wealth",
      "name": "Wealth & Investing",
      "group": "Finance & B2B",
      "engine": "appt",
      "about": "services, minimums and consultation requests. What services do you offer, and is there a minimum?"
    },
    {
      "slug": "crypto",
      "name": "Crypto & Fintech",
      "group": "Finance & B2B",
      "engine": "quote",
      "about": "supported assets, fees and getting started. Which assets do you support, and how do I get started?"
    },
    {
      "slug": "accounting",
      "name": "Tax & Accounting",
      "group": "Finance & B2B",
      "engine": "appt",
      "about": "services, deadlines and consultation requests. Can you help with a small-business return, and what do you need from me?"
    },
    {
      "slug": "chambers",
      "name": "Chambers of Commerce & Business Associations",
      "group": "Finance & B2B",
      "engine": "track",
      "about": "membership levels and benefits, events, programs, committees, advocacy and member businesses. Who can join, what are the membership levels, and what events are coming up?"
    },
    {
      "slug": "recruiting",
      "name": "Recruiting & Staffing",
      "group": "Finance & B2B",
      "engine": "appt",
      "about": "open roles, process and candidate enquiries. What roles are open, and how do I submit a resume?"
    },
    {
      "slug": "hr-comms",
      "name": "HR & Internal Comms",
      "group": "Finance & B2B",
      "engine": "appt",
      "about": "policies, benefits and who to contact. Where do I find the benefits policy, and who handles PTO?"
    },
    {
      "slug": "cybersecurity",
      "name": "Cybersecurity",
      "group": "Finance & B2B",
      "engine": "appt",
      "about": "services, assessments and consultation requests. Do you offer a security assessment for a small team?"
    },
    {
      "slug": "dev-tools",
      "name": "Developer Tools",
      "group": "Finance & B2B",
      "engine": "appt",
      "about": "docs, API access, pricing and support. How do I get an API key, and where are the docs?"
    },
    {
      "slug": "airlines",
      "name": "Airlines",
      "group": "Travel & leisure",
      "engine": "track",
      "about": "baggage, check-in, policies and support contacts. What's the baggage allowance, and how do I change a flight?"
    },
    {
      "slug": "cruise-lines",
      "name": "Cruise Lines",
      "group": "Travel & leisure",
      "engine": "stay",
      "about": "itineraries, inclusions, sailing dates and enquiries. What's included in the fare, and when does the next sailing leave?"
    },
    {
      "slug": "vacation-rentals",
      "name": "Vacation Rentals",
      "group": "Travel & leisure",
      "engine": "stay",
      "about": "homes and who they sleep, nightly rates, house rules, check-in and the local area. Do you have a house on Seabrook Island for 4 people next weekend?"
    },
    {
      "slug": "tour-operators",
      "name": "Tour Operators",
      "group": "Travel & leisure",
      "engine": "stay",
      "about": "itineraries day by day, departures and prices per traveller, what is included, and each traveller's own trip by code. What does the 5-day Danube river cruise include, day by day?"
    },
    {
      "slug": "dmc",
      "name": "Destination Management Companies",
      "group": "Travel & leisure",
      "engine": "quote",
      "about": "tailor-made packages, sample itineraries day by day, each client's proposal by code, and its price breakdown. Can you put together 10 days in Peru with Machu Picchu for six of us, and what would it cost?"
    },
    {
      "slug": "car-rental",
      "name": "Car Rental",
      "group": "Travel & leisure",
      "engine": "stay",
      "about": "vehicle classes, requirements, fees and reservation requests. What do I need to rent, and is there a one-way fee?"
    },
    {
      "slug": "theme-parks",
      "name": "Theme Parks & Attractions",
      "group": "Travel & leisure",
      "engine": "stay",
      "about": "hours, tickets, rides and visit planning. What are today's hours and ticket prices?"
    },
    {
      "slug": "museums",
      "name": "Museums & Galleries",
      "group": "Travel & leisure",
      "engine": "stay",
      "about": "exhibits, hours, tickets and group visits. What's on this month, and is there a student discount?"
    },
    {
      "slug": "casinos",
      "name": "Casinos & Gaming",
      "group": "Travel & leisure",
      "engine": "stay",
      "about": "hours, dining, events and age policies. What are your hours, dining options and age policy?"
    },
    {
      "slug": "sports-teams",
      "name": "Sports Teams & Venues",
      "group": "Travel & leisure",
      "engine": "stay",
      "about": "schedules, tickets, venue and merchandise. When's the next home game, and where do I buy tickets?"
    },
    {
      "slug": "wedding-services",
      "name": "Wedding & Events Pros",
      "group": "Travel & leisure",
      "engine": "stay",
      "about": "packages, availability and consultation requests. Are you free on June 14, and what are your packages?"
    },
    {
      "slug": "photography",
      "name": "Photography & Creative",
      "group": "Travel & leisure",
      "engine": "appt",
      "about": "packages, pricing, availability and booking requests. What does a portrait session cost, and how long until delivery?"
    },
    {
      "slug": "government",
      "name": "Government & Public Sector",
      "group": "Community & public",
      "engine": "track",
      "about": "services, offices, hours and how to apply. How do I renew a permit, and where's the nearest office?"
    },
    {
      "slug": "utilities",
      "name": "Utilities & Energy",
      "group": "Community & public",
      "engine": "track",
      "about": "how to report outages, service setup and billing questions. How do I report an outage or set up service?"
    },
    {
      "slug": "telecom",
      "name": "Telecom & ISPs",
      "group": "Community & public",
      "engine": "quote",
      "about": "plans, coverage and support. Which plans are available at my address?"
    },
    {
      "slug": "religious-orgs",
      "name": "Religious Organizations",
      "group": "Community & public",
      "engine": "appt",
      "about": "service times, groups, events and giving. What time are services, and how do I join a group?"
    },
    {
      "slug": "associations",
      "name": "Membership Associations",
      "group": "Community & public",
      "engine": "track",
      "about": "membership, events and resources. How do I become a member, and what are the benefits?"
    },
    {
      "slug": "childcare",
      "name": "Childcare & Daycare",
      "group": "Community & public",
      "engine": "appt",
      "about": "openings, hours, programs and tour requests. Do you have openings for a two-year-old, and what are your hours?"
    },
    {
      "slug": "tutoring",
      "name": "Tutoring & Test Prep",
      "group": "Community & public",
      "engine": "appt",
      "about": "subjects, rates, availability and booking. Do you tutor for SAT prep, and what are your rates?"
    },
    {
      "slug": "universities",
      "name": "Universities & Colleges",
      "group": "Community & public",
      "engine": "appt",
      "about": "programs, deadlines and admissions enquiries. What are the application deadlines and requirements?"
    },
    {
      "slug": "political-campaigns",
      "name": "Political Campaigns & Advocacy",
      "group": "Community & public",
      "engine": "track",
      "about": "public information, events and volunteer sign-ups. How can I volunteer, and when is your next event?"
    },
    {
      "slug": "public-transit",
      "name": "Public Transit & Mobility",
      "group": "Community & public",
      "engine": "track",
      "about": "routes, schedules and fares. How do I buy a pass, and where can I find route information?"
    },
    {
      "slug": "coworking",
      "name": "Coworking & Offices",
      "group": "Community & public",
      "engine": "stay",
      "about": "memberships, amenities and tour requests. What membership options do you have, and can I book a tour?"
    },
    {
      "slug": "activity-calendar",
      "name": "Activity Calendar",
      "group": "Travel & leisure",
      "engine": "stay",
      "about": "the activities on offer, their dates and prices, who they suit, what to bring and where to meet. What is on this Saturday, and are there places for three?"
    },
    {
      "slug": "restaurant-reservations",
      "name": "Restaurant Reservations",
      "group": "Retail & food",
      "engine": "appt",
      "about": "tables and party sizes, opening hours, menus, dietary options and private dining. Do you have a table for four on Friday at 7pm?"
    },
    {
      "slug": "tourism-bureaus",
      "name": "Tourism Bureaus & Destinations",
      "group": "Travel & leisure",
      "engine": "stay",
      "about": "places to stay, activities and tours, when to visit, getting around, events and visitor information. What is there to do in March, and where can we stay for four nights?"
    }
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
  ],
  "options": [
    {
      "id": "members",
      "adds": "The business may publish its member businesses (members.csv): people search them and write to one directly. Tools find_members, write_to_member.",
      "engines": [
        "stay",
        "track"
      ]
    },
    {
      "id": "infoFirst",
      "adds": "The menu starts with Ask a question; Committees and News & events when the business publishes them (committees.csv, news.csv, newsletter.csv).",
      "engines": [
        "track"
      ]
    },
    {
      "id": "software",
      "adds": "A software product: the menu is Features, Pricing, Help & guides, Support and Book a demo (features.csv, plans.csv, guides.csv). Tools get_features, get_pricing, search_help, request_support.",
      "engines": [
        "appt"
      ]
    },
    {
      "id": "visits",
      "adds": "Locations with tours and day passes (locations.csv). Tools get_visit_options, book_tour, request_day_pass.",
      "engines": [
        "stay"
      ],
      "spans": [
        "days"
      ]
    },
    {
      "id": "show",
      "adds": "A show or conference that publishes its programme gets an event guide: agenda, speakers, exhibitors and sponsors, enquiries (sessions.csv, speakers.csv, exhibitors.csv, sponsors.csv).",
      "engines": [
        "stay"
      ],
      "spans": [
        "days"
      ]
    },
    {
      "id": "concierge",
      "adds": "A rental concierge: the host's local picks, area guide and events, house guide, which home fits, a day-by-day stay plan (places.csv, area.csv, events.csv, house.csv).",
      "engines": [
        "stay"
      ],
      "spans": [
        "nights"
      ]
    },
    {
      "id": "tourItineraries",
      "adds": "Trips day by day: published itineraries, and a traveller's own trip by its code (trips.csv, trip_days.csv, trip_items.csv).",
      "engines": [
        "stay"
      ],
      "spans": [
        "single"
      ]
    },
    {
      "id": "dmcItineraries",
      "adds": "Tailor-made programmes day by day with a price breakdown, and a client's proposal by its code (trips.csv, trip_days.csv, trip_items.csv, trip_prices.csv).",
      "engines": [
        "quote"
      ]
    }
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
const similar = similarIndustries(p, RULES);
if (similar.length) {
  console.log("");
  console.log("⚠ Before you propose it, look at these existing industries (INDUSTRIES.md):");
  for (const s of similar) console.log("  - " + s.name + " (" + s.slug + "): " + s.why);
  console.log("  A business that fits one of them uses that industry's plug-in, under its own name and with its own services, prices and colours: no new industry is needed.");
  console.log("  If none fits, say in your pull request which is closest and what a customer does in yours that it cannot.");
}

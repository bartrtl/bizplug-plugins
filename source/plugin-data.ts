// What each industry plug-in needs from a business before BizPlug can deploy it, as CSV datasets, plus the
// instructions an AI agent (or a person) follows to collect and submit them. Every column maps to a field of
// BusinessProfile (profile-store.ts), so an accepted upload can become profiles/<industry>/<business>.json.
// The client portal (/portal) and the plug-in packages (plugins/<slug>/data/, written by build-plugins.ts)
// both render from this file. Per-industry differences come from industry-functions.ts (engine, noun, note),
// plugin-examples.ts (the example row in each template) and INDUSTRY_NOTES below.
import { industries, getIndustry } from "@/lib/industries";
import { getFunction, type Engine } from "@/lib/industry-functions";
import { exampleFor, type IndustryExample } from "@/lib/plugin-examples";
import { siteConfig } from "@/lib/seo";

export type ColumnType = "text" | "number" | "email" | "url" | "time" | "date" | "boolean" | "day";

export type DataColumn = {
  key: string;
  label: string;
  required: boolean;
  type: ColumnType;
  example: string;
  help: string;
};

export type Dataset = {
  id: string;
  /** The CSV file name the template downloads as and uploads are checked against. */
  file: string;
  title: string;
  why: string;
  required: boolean;
  /** One row (business details) or many. */
  single?: boolean;
  maxRows: number;
  columns: DataColumn[];
  /** Where to find this data and how to fill it in, step by step. */
  collect: string[];
};

export type PluginDataSpec = {
  industry: string;
  name: string;
  engine: Engine;
  functionTitle: string;
  datasets: Dataset[];
  /** Never put these in any upload. */
  never: string[];
};

const col = (key: string, label: string, required: boolean, type: ColumnType, example: string, help: string): DataColumn => ({ key, label, required, type, example, help });

// Shared by every plug-in. Examples come from plugin-examples.ts so each industry sees its own kind of business.
const businessDataset = (name: string, ex?: IndustryExample): Dataset => ({
  id: "business",
  file: "business.csv",
  title: "Business details",
  why: "What the plug-in says about the business and where customers can reach it.",
  required: true,
  single: true,
  maxRows: 1,
  columns: [
    col("name", "Business name", true, "text", ex?.business ?? "Harbor Street Studio", "As customers know it."),
    col("summary", "Summary", true, "text", `${ex?.business ?? `A ${name} business`} serves customers in and around Charlotte, NC.`, "One or two sentences, in the business's own words."),
    col("email", "Public email", true, "email", "hello@example.com", "The address customers may write to."),
    col("phone", "Public phone", false, "text", "+1 704 555 0100", "With country code."),
    col("website", "Website", false, "url", "https://example.com", "Full URL."),
    col("address", "Address", false, "text", "123 Main St, Charlotte, NC 28202", "Street address, if customers visit."),
    col("city", "City", false, "text", "Charlotte", ""),
    col("region", "State or country", false, "text", "NC", ""),
    col("hours", "Opening hours", false, "text", "Mon-Fri 09:00-17:00; Sat 10:00-14:00", "As shown to customers."),
    col("currency", "Currency", false, "text", "USD", "ISO code for the prices in the other files."),
    col("notify_email", "Requests go to", false, "email", "orders@example.com", "The team inbox that should receive requests from ChatGPT (not shown to customers)."),
  ],
  collect: [
    "Copy the name, summary, phone, email, website and address exactly as they appear on the business's website or Google Business Profile.",
    "Write the summary in the business's own words (one or two sentences). Do not add claims the business does not make.",
    "Ask the owner which inbox should receive requests from ChatGPT and put it in notify_email.",
  ],
});

const faqDataset = (ex?: IndustryExample): Dataset => ({
  id: "faqs",
  file: "faqs.csv",
  title: "Questions and answers",
  why: "The plug-in answers customer questions only from these, so it never guesses.",
  required: false,
  maxRows: 100,
  columns: [
    col("question", "Question", true, "text", ex?.faq[0] ?? "Do you have parking?", "How a customer would ask it."),
    col("answer", "Answer", true, "text", ex?.faq[1] ?? "Yes, free parking behind the building.", "The business's answer, in full sentences."),
  ],
  collect: [
    "Take the FAQ page of the website first, then policies (cancellation, delivery, payment, parking, accessibility).",
    "Keep each answer factual and current. Leave out anything the owner has not confirmed.",
  ],
});

const servicesDataset = (ex?: IndustryExample): Dataset => ({
  id: "services",
  file: "services.csv",
  title: "Services list",
  why: "A short list of what the business offers, used in answers.",
  required: false,
  maxRows: 100,
  columns: [col("service", "Service", true, "text", ex?.service ?? "Gift wrapping", "One per row.")],
  collect: ["List the services from the website's services or about page, one per row, short names only."],
});

function engineDatasets(engine: Engine, noun: string, ex?: IndustryExample): Dataset[] {
  switch (engine) {
    case "order": {
      const it = ex?.engine === "order" ? ex.item : { id: "latte-12oz", name: "Latte 12 oz", price: "4.75", category: "Coffee", description: "Oat or dairy milk" };
      return [
        {
          id: "catalog",
          file: "catalog.csv",
          title: `Catalog (${noun}s)`,
          why: `What customers can order, with prices. The plug-in only offers ${noun}s in this file.`,
          required: true,
          maxRows: 2000,
          columns: [
            col("id", "Item id", true, "text", it.id, "Short, unique, lowercase with hyphens. Never reuse an id for a different item."),
            col("name", "Name", true, "text", it.name, ""),
            col("price", "Price", true, "number", it.price, "Number only, no currency sign."),
            col("category", "Category", false, "text", it.category, ""),
            col("description", "Description", false, "text", it.description, ""),
            col("available", "Available", false, "boolean", "true", "true or false; false hides it."),
            col("image", "Photo URL", false, "url", `https://example.com/photos/${it.id}.jpg`, "The business's own photo (https). Leave empty rather than using someone else's image."),
          ],
          collect: [
            "Export the product or menu list from the point-of-sale or online shop (Square, Shopify, Toast, Clover and similar all export CSV), or copy it from the website menu.",
            "Map the export's columns to the template: one row per item, price as a plain number.",
            "Only include photos the business owns.",
          ],
        },
      ];
    }
    case "stay": {
      const it = ex?.engine === "stay" ? ex.item : { id: "deluxe-king", name: "Deluxe King Room", rate: "189", capacity: "2", description: "King bed, city view" };
      return [
        {
          id: "inventory",
          file: "inventory.csv",
          title: `What can be booked (${noun}s)`,
          why: "The options and published rates the plug-in prices from.",
          required: true,
          maxRows: 500,
          columns: [
            col("id", "Id", true, "text", it.id, "Short, unique, lowercase with hyphens."),
            col("name", "Name", true, "text", it.name, ""),
            col("rate", "Published rate", true, "number", it.rate, "Per night, day or booking, as the business publishes it."),
            col("capacity", "Capacity", false, "number", it.capacity, "Most guests or people."),
            col("description", "Description", false, "text", it.description, ""),
          ],
          collect: [
            "Copy each bookable option and its standard published rate from the website or booking engine.",
            "Use the rate customers see before discounts. Note in faqs.csv whether taxes and fees are included.",
          ],
        },
        {
          id: "blocked",
          file: "blocked-dates.csv",
          title: "Dates not available",
          why: "Dates the plug-in should not offer for an option.",
          required: false,
          maxRows: 2000,
          columns: [
            col("id", "Option id", true, "text", it.id, "An id from inventory.csv."),
            col("start", "From", true, "date", "2026-12-24", "YYYY-MM-DD."),
            col("end", "To", true, "date", "2026-12-27", "YYYY-MM-DD, the day after the last blocked night or day."),
          ],
          collect: ["Add closures and sold-out periods the owner knows about. This is not a live calendar; BizPlug confirms each request with the business."],
        },
      ];
    }
    case "appt": {
      const it = ex?.engine === "appt" ? ex.item : { id: "intro-30", name: "30-minute intro call", duration_min: "30", price: "0", description: "A short call to see if we fit." };
      return [
        {
          id: "bookable",
          file: "bookable.csv",
          title: `What can be booked (${noun}s)`,
          why: "The appointment types customers can request.",
          required: true,
          maxRows: 200,
          columns: [
            col("id", "Id", true, "text", it.id, "Short, unique, lowercase with hyphens."),
            col("name", "Name", true, "text", it.name, ""),
            col("duration_min", "Duration (minutes)", false, "number", it.duration_min, ""),
            col("price", "Price", false, "number", it.price, "Leave empty if not published."),
            col("description", "Description", false, "text", it.description, ""),
          ],
          collect: ["List each appointment, class, tour or call type from the booking page or price list, with its length and published price."],
        },
        {
          id: "hours",
          file: "open-hours.csv",
          title: "Bookable hours",
          why: "When appointments can be requested, per weekday.",
          required: true,
          maxRows: 7,
          columns: [
            col("day", "Day", true, "day", "mon", "sun, mon, tue, wed, thu, fri or sat. Leave a day out if closed."),
            col("open", "From", true, "time", "09:00", "24-hour HH:MM."),
            col("close", "To", true, "time", "17:00", "24-hour HH:MM."),
          ],
          collect: ["Use the hours appointments are taken, which can differ from opening hours. One row per open day."],
        },
      ];
    }
    case "quote": {
      const it = ex?.engine === "quote" ? ex.item : { id: "ac-tune-up", name: "AC tune-up", base: "129", per_unit: "45", unit: "extra unit", minimum: "129", note: "Parts extra" };
      return [
        {
          id: "prices",
          file: "price-rules.csv",
          title: `Price list (${noun}s)`,
          why: "The published prices the plug-in builds estimates from. Estimates are never final prices.",
          required: true,
          maxRows: 500,
          columns: [
            col("id", "Id", true, "text", it.id, "Short, unique, lowercase with hyphens."),
            col("name", "Name", true, "text", it.name, ""),
            col("base", "Base price", true, "number", it.base, "Call-out or starting price."),
            col("per_unit", "Price per unit", false, "number", it.per_unit, "Added for each unit."),
            col("unit", "Unit", false, "text", it.unit, "What one unit is (room, sq ft, hour, item)."),
            col("minimum", "Minimum", false, "number", it.minimum, "Smallest total charged."),
            col("note", "Note", false, "text", it.note, "Shown with the estimate."),
          ],
          collect: ["Copy the published price list or rate card. Only include prices the business is happy to publish as estimates."],
        },
      ];
    }
    case "track": {
      const it = ex?.engine === "track" ? ex.item : { ref: "REQ-1042", status: "In progress", note: "Technician booked for Tuesday" };
      return [
        {
          id: "records",
          file: "records.csv",
          title: "Reference look-ups",
          why: "Statuses customers can look up by reference number. Keep it current; the plug-in shows what is here.",
          required: false,
          maxRows: 5000,
          columns: [
            col("ref", "Reference", true, "text", it.ref, "What the customer quotes."),
            col("status", "Status", true, "text", it.status, ""),
            col("note", "Note", false, "text", it.note, "No personal data."),
            col("updated", "Updated", false, "date", "2026-11-14", "YYYY-MM-DD."),
          ],
          collect: ["Export open references and their statuses from the case or ticket system. Remove names, addresses and any personal details first."],
        },
      ];
    }
  }
}

/** Extra rules for industries where uploads could carry sensitive data. Engine notes are added automatically. */
const INDUSTRY_NOTES: Partial<Record<string, string[]>> = {
  pharmacy: ["Never upload prescriptions, medication lists or patient records."],
  "mental-health": ["Never upload client names, notes or diagnoses."],
};

const BASE_NEVER = [
  "Passwords, API keys or other secrets.",
  "Card numbers, bank details or government ID numbers.",
  "Customers' personal data (names, phone numbers, addresses, health or financial details).",
];

export function dataSpec(industry: string): PluginDataSpec | null {
  const ind = getIndustry(industry);
  const fn = getFunction(industry);
  if (!ind || !fn) return null;
  const ex = exampleFor(industry, fn.engine);
  return {
    industry,
    name: ind.name,
    engine: fn.engine,
    functionTitle: fn.title,
    datasets: [businessDataset(ind.name, ex), ...engineDatasets(fn.engine, fn.noun, ex), servicesDataset(ex), faqDataset(ex)],
    never: [...BASE_NEVER, ...(INDUSTRY_NOTES[industry] ?? []), ...(fn.note ? [`The plug-in's own rule: ${fn.note}`] : [])],
  };
}

export const allDataSpecs = () => industries.map((i) => dataSpec(i.slug)).filter((s): s is PluginDataSpec => Boolean(s));

const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** The CSV template: the header row and one example row. */
export const templateCsv = (d: Dataset) => `${d.columns.map((c) => c.key).join(",")}\n${d.columns.map((c) => csvCell(c.example)).join(",")}\n`;

/** Markdown instructions for an AI agent (or a person) collecting and submitting the data. */
export function agentInstructions(spec: PluginDataSpec): string {
  const portal = `${siteConfig.url}/portal`;
  const out = [
    `# Collect the data for the ${spec.name} plug-in`,
    "",
    `You are helping a business prepare the data BizPlug needs to deploy its ${spec.name} ChatGPT plug-in ("${spec.functionTitle}"). Work only from the business's own sources (its website, its systems' exports, and what the owner tells you). Never invent prices, hours, services or answers; leave a cell empty when you cannot confirm it and list it for the owner.`,
    "",
    "## Never include",
    ...spec.never.map((n) => `- ${n}`),
    "",
    "## Files to prepare",
  ];
  for (const d of spec.datasets) {
    out.push(
      "",
      `### ${d.file} (${d.required ? "required" : "optional"}${d.single ? ", one row" : `, up to ${d.maxRows} rows`})`,
      d.why,
      "",
      "Columns (first row of the file, exactly these names):",
      ...d.columns.map((c) => `- \`${c.key}\`${c.required ? " (required)" : ""}: ${c.label}, ${c.type}. ${c.help} Example: ${c.example}`),
      "",
      "How to collect it:",
      ...d.collect.map((s, i) => `${i + 1}. ${s}`),
    );
  }
  out.push(
    "",
    "## Format",
    "- UTF-8 CSV with a header row; comma separated; quote cells that contain commas, quotes or line breaks.",
    "- Numbers without currency signs or thousands separators (4.75, not $4.75).",
    "- Dates as YYYY-MM-DD, times as 24-hour HH:MM.",
    "",
    "## Submit",
    `1. The business owner signs in to the BizPlug client portal: ${portal}. Do not sign in on their behalf.`,
    `2. Open the ${spec.name} plug-in under My plug-ins (add it from the marketplace first).`,
    "3. Upload each file under its matching dataset. Fix every error the portal lists and upload again.",
    "4. When the required files show as accepted, press Request test deploy. BizPlug deploys to the test server and confirms by email.",
    "5. After checking the test plug-in in ChatGPT, press Request production. BizPlug confirms plan details with the business before any payment.",
    "",
    "## Or submit by API",
    `If the owner gives you a BizPlug API key (they create it at ${portal}/api; never ask for their password), submit each file directly instead of uploading it. Keep the key out of chats, logs and URLs.`,
    `1. List the plug-ins and their ids: \`GET ${siteConfig.url}/api/portal/v1/plugins\` with the header \`Authorization: Bearer <key>\`.`,
    `2. Submit each file: \`PUT ${siteConfig.url}/api/portal/v1/plugins/<plugin-id>/datasets/<file name>\` with \`Content-Type: text/csv\` and the file as the body, or \`Content-Type: application/json\` and \`{"rows": [{...}]}\` keyed by the column names above.`,
    "3. The response says whether the file was accepted and lists every error. Fix them and submit again.",
    "4. Tell the owner when the required files are accepted: they press Request test deploy in the portal themselves.",
  );
  return out.join("\n");
}

export type ValidationResult = { ok: boolean; rows: number; errors: string[]; warnings: string[] };

/** RFC 4180-style CSV parse (quotes, escaped quotes, CRLF). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let q = false;
  const s = text.replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === '"' && s[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((x) => x.trim() !== ""));
}

const CHECKS: Record<ColumnType, (v: string) => boolean> = {
  text: () => true,
  number: (v) => /^-?\d+(\.\d+)?$/.test(v),
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  url: (v) => /^https?:\/\/\S+$/.test(v),
  time: (v) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v),
  date: (v) => /^\d{4}-\d{2}-\d{2}$/.test(v),
  boolean: (v) => /^(true|false|yes|no|1|0)$/i.test(v),
  day: (v) => /^(sun|mon|tue|wed|thu|fri|sat)$/i.test(v),
};

/** Checks an upload against its dataset: header, required cells, types, row count. At most 20 errors listed. */
export function validateCsv(d: Dataset, text: string): ValidationResult {
  const rows = parseCsv(text);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!rows.length) return { ok: false, rows: 0, errors: ["The file is empty."], warnings };
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const known = new Set(d.columns.map((c) => c.key));
  for (const c of d.columns) if (c.required && !header.includes(c.key)) errors.push(`Missing column "${c.key}" (${c.label}).`);
  const extra = header.filter((h) => h && !known.has(h));
  if (extra.length) warnings.push(`Ignored columns: ${extra.join(", ")}.`);
  const body = rows.slice(1);
  if (!body.length) errors.push("No data rows under the header.");
  if (body.length > d.maxRows) errors.push(`${body.length} rows; this file takes at most ${d.maxRows}.`);
  const ids = new Set<string>();
  body.slice(0, d.maxRows).forEach((r, i) => {
    const line = i + 2;
    for (const c of d.columns) {
      const at = header.indexOf(c.key);
      const v = at >= 0 ? (r[at] ?? "").trim() : "";
      if (!v) {
        if (c.required && at >= 0) errors.push(`Row ${line}: "${c.key}" is empty.`);
        continue;
      }
      if (!CHECKS[c.type](v)) errors.push(`Row ${line}: "${c.key}" should be ${c.type === "day" ? "a day like mon" : `a ${c.type}`} (got "${v.slice(0, 40)}").`);
    }
    const idAt = header.indexOf("id");
    if (idAt >= 0 && d.id !== "blocked") {
      const id = (r[idAt] ?? "").trim();
      if (id && ids.has(id)) errors.push(`Row ${line}: id "${id}" is used twice.`);
      ids.add(id);
    }
  });
  return { ok: errors.length === 0, rows: body.length, errors: errors.slice(0, 20).concat(errors.length > 20 ? [`…and ${errors.length - 20} more.`] : []), warnings };
}

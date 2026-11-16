// The versions of the industry plug-ins, oldest first. The last entry is the current one (PLUGIN_VERSION in
// plugins.ts; `pnpm plugins:check` fails if they differ). A plug-in published from the client portal is pinned
// to the version it was published with and keeps that version's behaviour until the client upgrades it in the
// portal (portal/publish.ts). Plug-ins served from profile files and the industry-wide plug-ins always run the
// current version.
//
// When a change alters what customers see or what the assistant is told, add a version here with its notes
// and a feature flag, and keep the old behaviour behind the flag in plugin-mcp.ts.

export type PluginFeatures = {
  /** show_menu renders the ChatGPT card with buttons and short forms (widgets/plugin-widget.ts). */
  menuCard: boolean;
  /**
   * The card runs the tools itself and draws their results (a price list, availability, open times, an
   * estimate, a status, a sent request), and results from the chat render in it too.
   */
  cardResults: boolean;
  /**
   * Browsing in the card: tap-to-choose options on the forms (the business's own categories and services, date
   * and party-size shortcuts), category filters and search on a list, an item or option opened on its own
   * screen with Back, the business's published questions and answers in the card, and, on the industry-wide
   * plug-in, choosing the business in the card.
   */
  cardNavigation: boolean;
};

export type PluginVersion = {
  version: string;
  date: string; // ISO date
  /** One sentence on what changed, for the public pages and the package READMEs. */
  summary: string;
  /** What is new, in the client's words. Shown in the portal next to the Upgrade button. */
  notes: string[];
  features: PluginFeatures;
};

export const PLUGIN_VERSIONS: PluginVersion[] = [
  {
    version: "0.1.0",
    date: "2026-11-15",
    summary: "The plug-in's tools for the industry, answers from the business's own information, and a text menu of what it can do.",
    notes: ["The plug-in's tools for your industry, questions answered from your own information, and a text menu of what it can do."],
    features: { menuCard: false, cardResults: false, cardNavigation: false },
  },
  {
    version: "0.2.0",
    date: "2026-11-16",
    summary: "A menu card in ChatGPT, with a button and a short form for each thing a customer can do.",
    notes: [
      "A menu card in ChatGPT: your customers see a button for each thing they can do.",
      "Each button opens a short form (dates and party size, an item, a reference, a question or a request), so customers tap and fill in instead of typing everything.",
    ],
    features: { menuCard: true, cardResults: false, cardNavigation: false },
  },
  {
    version: "0.3.0",
    date: "2026-11-16",
    summary: "Results show inside the card (prices, availability, open times, estimates and statuses), and a request can be sent straight from a result.",
    notes: [
      "Results show inside the card: prices, availability, open times, estimates and statuses, instead of only as text in the chat.",
      "Customers can go from a result straight to a request in the card: pick an option or a time, add their name and email, and send.",
    ],
    features: { menuCard: true, cardResults: true, cardNavigation: false },
  },
  {
    version: "0.4.0",
    date: "2026-11-16",
    summary:
      "Browsing by tapping in the card: quick options on each form, search and category filters on a list, an item or option on its own screen with Back, the business's published questions and answers, and choosing the business on an industry-wide plug-in.",
    notes: [
      "Customers browse by tapping: your own categories and services, and shortcuts for dates and party size, appear as buttons on each form.",
      "A list can be searched and filtered by category in the card, and each item or option opens on its own screen, with Back to return.",
      "Your published questions and answers show in the card, so common questions are answered with one tap. Other questions still go to the chat.",
    ],
    features: { menuCard: true, cardResults: true, cardNavigation: true },
  },
];

export const LATEST_VERSION = PLUGIN_VERSIONS[PLUGIN_VERSIONS.length - 1].version;
/** "16 November 2026", for a version's ISO date. */
export const versionDate = (v: PluginVersion) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${v.date}T00:00:00Z`));
/** Plug-ins published before versions were recorded ran this one. */
export const FIRST_VERSION = PLUGIN_VERSIONS[0].version;

const parts = (v: string) => v.split(".").map((n) => Number(n) || 0);
/** Negative when a is older than b. */
export function compareVersions(a: string, b: string): number {
  const x = parts(a), y = parts(b);
  for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) - (y[i] ?? 0);
  return 0;
}

export const getVersion = (v: string | undefined) => PLUGIN_VERSIONS.find((x) => x.version === v);
/** The behaviour of a version; an unknown or missing version behaves as the current one. */
export const featuresOf = (v: string | undefined): PluginFeatures => (getVersion(v) ?? PLUGIN_VERSIONS[PLUGIN_VERSIONS.length - 1]).features;
/** The versions newer than `v`, oldest first. */
export const versionsAfter = (v: string) => PLUGIN_VERSIONS.filter((x) => compareVersions(x.version, v) > 0);

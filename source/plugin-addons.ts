// What a plug-in can be bundled with: where its requests go, and the systems it can connect to. The client
// portal shows these on every plug-in and lets a client choose the ones they want; the choice goes to the
// BizPlug team with the deploy request. Statuses must stay true (CLAUDE.md): only mark something "included"
// when the standard plan really does it. Custom integrations follow src/lib/integrations.ts: separate work,
// quoted before anything is built.
import type { Engine, Span } from "@/lib/industry-functions";
import { siteConfig } from "@/lib/seo";

export type AddonStatus = "included" | "setup" | "custom";
export type AddonGroup = "requests" | "calendars";

export type Addon = {
  id: string;
  name: string;
  group: AddonGroup;
  status: AddonStatus;
  /** One sentence: what the client gets. */
  what: string;
  /**
   * How the client sets it up or gets it switched on, step by step. The portal shows these under each option and
   * for everything the client has chosen. Like the statuses, they must describe what really happens.
   */
  steps: string[];
  /** Something to open while following the steps, e.g. the example webhook request. */
  link?: { label: string; href: string };
};

export const ADDON_STATUS_LABEL: Record<AddonStatus, string> = {
  included: "Included",
  setup: "Set up with you",
  custom: "Custom integration",
};

export const ADDON_STATUS_NOTE: Record<AddonStatus, string> = {
  included: "Part of the standard plug-in.",
  setup: "Part of the plan; BizPlug sets it up with you before it is switched on.",
  custom: "Separate work, quoted before anything is built. Consulting fees may apply.",
};

export const ADDON_GROUP_LABEL: Record<AddonGroup, string> = {
  requests: "Where your requests go",
  calendars: "Calendars and booking tools",
};

// Offered on every plug-in.
// The steps every custom integration starts with: nothing is built before the client agrees to a quote.
const customSteps = (ask: string, meanwhile: string) => [
  `Tick it, save, and request your deploy. BizPlug then asks ${ask} and sends you a quote.`,
  "Nothing is built or charged until you agree to the quote.",
  meanwhile,
];

// Offered on every plug-in.
const ALWAYS: Addon[] = [
  {
    id: "email", name: "Email", group: "requests", status: "included",
    what: "Every order, booking or request is emailed to the inbox you name in business.csv (notify_email).",
    steps: [
      "In business.csv, put the inbox that should receive requests in the notify_email column, and upload the file under Your data.",
      "Request your test plug-in. Once it is live on test, send a request from ChatGPT and check that inbox.",
      "Each email has the request, the customer's contact details and a Reply to customer button. Use the button: a plain reply goes to BizPlug, not to the customer.",
      "To change the inbox later, upload business.csv again and request a new deploy.",
    ],
  },
  {
    id: "google-sheets", name: "Google Sheets", group: "requests", status: "setup",
    what: "A row per request in a sheet in your own Google Drive. We send you a personal link to connect it.",
    steps: [
      "Tick Google Sheets, save, and request your deploy.",
      "BizPlug emails you a personal link. It is for your business only, so do not pass it on.",
      "Open the link, press Connect Google Sheets and sign in with the Google account that should own the sheet. BizPlug gets access to the one sheet it creates, not to the rest of your Drive.",
      "A sheet named BizPlug requests appears in your Drive, and every request adds a row. You can disconnect on the same page at any time; the sheet stays yours.",
    ],
  },
  {
    id: "webhook", name: "Webhook", group: "requests", status: "setup",
    what: "Each request is posted to a URL you give us, which is how Zapier, Make and n8n receive it.",
    steps: [
      "Create the URL that will receive your requests. In Zapier: Webhooks by Zapier, Catch Hook. In Make: Webhooks, Custom webhook. In n8n: a Webhook node set to POST (use its production URL). The URL must start with https://.",
      `Send the URL to BizPlug at ${siteConfig.email}. Treat it like a password: anyone who has it can post to it.`,
      "BizPlug switches it on. Each request is then posted to your URL as JSON; the example request shows every field.",
      "Send a request from your test plug-in and check that it arrives. A failed delivery is not retried, so keep the URL working.",
    ],
    link: { label: "Example request (JSON)", href: "/webhooks/example-request.json" },
  },
  {
    id: "slack", name: "Slack", group: "requests", status: "custom",
    what: "Requests posted to a channel in your Slack workspace.",
    steps: customSteps("which workspace and channel to post to", "To get requests in Slack today, choose Webhook and let Zapier or Make post each one to your channel."),
  },
];

const WHATSAPP_READY: Addon = {
  id: "whatsapp", name: "WhatsApp", group: "requests", status: "setup",
  what: "Customers finish their order or booking on WhatsApp with your business, through msg2ai.",
  steps: [
    "Tick WhatsApp, save, and request your deploy.",
    "BizPlug contacts you to connect your business's WhatsApp number through msg2ai, the WhatsApp service of the company behind BizPlug.",
    "Once it is connected, the plug-in gives your customer a WhatsApp link to finish the order or booking with your business there. ChatGPT then asks for no name or email.",
    "Try it on your test plug-in before you request production.",
  ],
};
const WHATSAPP_CUSTOM: Addon = {
  id: "whatsapp", name: "WhatsApp", group: "requests", status: "custom",
  what: "Requests continued with your business on WhatsApp, through msg2ai.",
  steps: customSteps("which WhatsApp number to use and what should happen there", "Until it is built, requests reach you by email, and by Google Sheets or a webhook if you chose them."),
};

// Offered where the plug-in is about availability.
const untilCalendar = "Until it is connected, the plug-in works from the availability in the files you upload, and your business confirms every request itself.";
const CALENDARS: Addon[] = [
  { id: "google-calendar", name: "Google Calendar", group: "calendars", status: "custom", what: "Availability read from your calendar, and confirmed bookings added to it.", steps: customSteps("which calendar holds your availability", untilCalendar) },
  { id: "calendly", name: "Calendly", group: "calendars", status: "custom", what: "Open times taken from your Calendly event types, with bookings made there.", steps: customSteps("which Calendly event types to offer", untilCalendar) },
  { id: "cal-com", name: "Cal.com", group: "calendars", status: "custom", what: "Open times taken from your Cal.com event types, with bookings made there.", steps: customSteps("which Cal.com event types to offer", untilCalendar) },
];

/** The add-ons offered for a plug-in, by what its engine does. */
export function addonsFor(engine: Engine, span?: Span): Addon[] {
  // Pickup orders and room nights already run on WhatsApp for businesses today; other plug-in types need building.
  const whatsapp = engine === "order" || (engine === "stay" && span === "nights") ? WHATSAPP_READY : WHATSAPP_CUSTOM;
  const base = [ALWAYS[0], ALWAYS[1], ALWAYS[2], whatsapp, ALWAYS[3]];
  return engine === "appt" || engine === "stay" ? [...base, ...CALENDARS] : base;
}

export const addonGroups = (list: Addon[]) => (Object.keys(ADDON_GROUP_LABEL) as AddonGroup[]).map((g) => ({ group: g, label: ADDON_GROUP_LABEL[g], addons: list.filter((a) => a.group === g) })).filter((g) => g.addons.length);

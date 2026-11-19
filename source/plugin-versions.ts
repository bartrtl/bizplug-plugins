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
  /**
   * The business's own WhatsApp number, saved by the client in the portal, is offered with its contact details
   * and after a sent request, as a link that opens a chat with the business's message filled in.
   */
  whatsappContact: boolean;
  /**
   * Buttons to the business's own pages, saved by the client in the portal: a payment page after a sent request;
   * its booking page, directions and review page with its contact details.
   */
  businessLinks: boolean;
  /**
   * The business's buttons where they help: on the menu card, a booking button next to availability and open
   * times, and the assistant is told which ones exist. Presses are counted for the business's dashboard.
   */
  quickActions: boolean;
  /**
   * The assistant is told how the business takes payment: on its own payment page when it saved one (Stripe,
   * PayPal, Square or another), otherwise directly with the business. Never in the chat. get_contact also returns
   * the payment page, so a customer can find it before or without a request.
   */
  paymentAnswers: boolean;
  /**
   * Checkout on the business's own Stripe account (stripe-checkout.ts), when it connected one in the portal: a request
   * with a firm price opens a Stripe Checkout page in the business's name, and the status tool asks Stripe whether it
   * was paid. Test mode only for now.
   */
  stripeCheckout: boolean;
  /**
   * The plug-in says who it is when a client connects: a description, its website and, for BizPlug's own
   * industry-wide plug-ins, the BizPlug logo, with the privacy policy, terms and support contact.
   */
  listingDetails: boolean;
  /**
   * Every tool states all three hints a directory review asks for: whether it only reads, whether what it does
   * cannot be taken back (a request, once sent, cannot), and whether it reaches outside the business's own data.
   */
  fullAnnotations: boolean;
  /**
   * Coworking & Offices only: the business's member businesses in the plug-in (members.csv). find_members
   * searches them by name, kind of business, or what a person needs or offers; the card gets a Members button
   * with search, filters, each member on its own screen and "Find a collaborator". Contact is direct, with the
   * details the business lists for the member: nobody introduces or forwards.
   */
  members: boolean;
  /**
   * The card's pay step: after a request with a checkout, the card shows the total, a Pay now button to the
   * business's checkout and an I've paid button that asks the status tool; card details are only ever entered on the
   * provider's own page.
   */
  payCard: boolean;
  /**
   * A business's plug-in tells ChatGPT its full name: the business's name and what it is (its profile's tagline,
   * or the industry plug-in's name), e.g. "msg2ai – AI messaging for hotels, rentals and events", and its logo as
   * the plug-in's icon when it has one.
   */
  fullName: boolean;
  /**
   * Software products (industry-functions.ts `software`): the menu is Features, Pricing, Help & guides, Support,
   * Book a demo, Request status and Contact, with get_features, get_pricing, search_help and request_support
   * (software.ts). A business listed in ChatGPT's directory shows no plans in Pricing, only its pricing page.
   */
  softwareMenu: boolean;
  /**
   * A business's own plug-in describes only the business to ChatGPT: its instructions no longer present it as
   * "the … plug-in from BizPlug" with BizPlug's address, and its answers no longer ask ChatGPT to mention BizPlug.
   * The card's Contact BizPlug bar stays. Industry-wide plug-ins, which are BizPlug's own, are unchanged.
   */
  businessOnlyInstructions: boolean;
  /**
   * Customer sign-in with Clerk (customer-sign-in.ts): when the business saved its Clerk keys under Integrations,
   * its plug-in answers only customers signed in to the business's own Clerk application. ChatGPT asks them to sign
   * in when they add the plug-in. Without saved keys nothing changes.
   */
  customerSignIn: boolean;
  /**
   * Account tools (app-tools.ts): a software business that runs its own MCP server can offer that server's tools
   * in its plug-in, for customers signed in with its Clerk application. While they are saved, sign-in is asked
   * only for those tools and the rest of the plug-in stays open. Without a saved address nothing changes.
   */
  appTools: boolean;
  /**
   * Events (industry-functions.ts `show`): a show or conference that published its programme (sessions.csv,
   * speakers.csv, exhibitors.csv, sponsors.csv) gets the event guide: the menu is About the event, Agenda, Speakers,
   * Exhibitors & sponsors, Send an enquiry and Contact, with get_agenda, find_speakers, find_exhibitors and
   * send_event_enquiry (event-guide.ts), and no venue holds. A venue, with no programme, keeps the venue menu.
   */
  eventGuide: boolean;
};

export type PluginVersion = {
  version: string;
  date: string; // ISO date
  /** One sentence on what changed, for the package READMEs. */
  summary: string;
  /** What is new, in the client's words. Shown in the portal next to the Upgrade button. */
  notes: string[];
  features: PluginFeatures;
};

const FULL_NAME_FEATURES: PluginFeatures = { menuCard: true, cardResults: true, cardNavigation: true, whatsappContact: true, businessLinks: true, quickActions: true, paymentAnswers: true, stripeCheckout: true, listingDetails: true, fullAnnotations: true, members: true, payCard: true, fullName: true, softwareMenu: false, businessOnlyInstructions: false, customerSignIn: false, appTools: false, eventGuide: false };
const SOFTWARE_FEATURES: PluginFeatures = { ...FULL_NAME_FEATURES, softwareMenu: true, businessOnlyInstructions: true, customerSignIn: false, appTools: false };

export const PLUGIN_VERSIONS: PluginVersion[] = [
  {
    version: "0.1.0",
    date: "2026-11-15",
    summary: "The plug-in's tools for the industry, answers from the business's own information, and a text menu of what it can do.",
    notes: ["The plug-in's tools for your industry, questions answered from your own information, and a text menu of what it can do."],
    features: { menuCard: false, cardResults: false, cardNavigation: false, whatsappContact: false, businessLinks: false, quickActions: false, paymentAnswers: false, stripeCheckout: false, listingDetails: false, fullAnnotations: false, members: false, payCard: false, fullName: false, softwareMenu: false, businessOnlyInstructions: false, customerSignIn: false, appTools: false, eventGuide: false },
  },
  {
    version: "0.2.0",
    date: "2026-11-16",
    summary: "A menu card in ChatGPT, with a button and a short form for each thing a customer can do.",
    notes: [
      "A menu card in ChatGPT: your customers see a button for each thing they can do.",
      "Each button opens a short form (dates and party size, an item, a reference, a question or a request), so customers tap and fill in instead of typing everything.",
    ],
    features: { menuCard: true, cardResults: false, cardNavigation: false, whatsappContact: false, businessLinks: false, quickActions: false, paymentAnswers: false, stripeCheckout: false, listingDetails: false, fullAnnotations: false, members: false, payCard: false, fullName: false, softwareMenu: false, businessOnlyInstructions: false, customerSignIn: false, appTools: false, eventGuide: false },
  },
  {
    version: "0.3.0",
    date: "2026-11-16",
    summary: "Results show inside the card (prices, availability, open times, estimates and statuses), and a request can be sent straight from a result.",
    notes: [
      "Results show inside the card: prices, availability, open times, estimates and statuses, instead of only as text in the chat.",
      "Customers can go from a result straight to a request in the card: pick an option or a time, add their name and email, and send.",
    ],
    features: { menuCard: true, cardResults: true, cardNavigation: false, whatsappContact: false, businessLinks: false, quickActions: false, paymentAnswers: false, stripeCheckout: false, listingDetails: false, fullAnnotations: false, members: false, payCard: false, fullName: false, softwareMenu: false, businessOnlyInstructions: false, customerSignIn: false, appTools: false, eventGuide: false },
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
    features: { menuCard: true, cardResults: true, cardNavigation: true, whatsappContact: false, businessLinks: false, quickActions: false, paymentAnswers: false, stripeCheckout: false, listingDetails: false, fullAnnotations: false, members: false, payCard: false, fullName: false, softwareMenu: false, businessOnlyInstructions: false, customerSignIn: false, appTools: false, eventGuide: false },
  },
  {
    version: "0.5.0",
    date: "2026-11-16",
    summary: "A WhatsApp button to the business's own number, with its contact details and after a sent request, when the business has saved its number in the portal.",
    notes: [
      "A WhatsApp button to your own number: save your WhatsApp number and a first message under Integrations on your plug-in page, and customers can open a chat with you from your contact details and after they send a request.",
      "Requests still reach you by email as before. WhatsApp is an extra way for a customer to reach you, and nothing is sent until they press send in WhatsApp.",
    ],
    features: { menuCard: true, cardResults: true, cardNavigation: true, whatsappContact: true, businessLinks: false, quickActions: false, paymentAnswers: false, stripeCheckout: false, listingDetails: false, fullAnnotations: false, members: false, payCard: false, fullName: false, softwareMenu: false, businessOnlyInstructions: false, customerSignIn: false, appTools: false, eventGuide: false },
  },
  {
    version: "0.6.0",
    date: "2026-11-16",
    summary: "Buttons to the business's own pages, when it has saved them in the portal: a payment page after a sent request, and its booking page, directions and review page with its contact details.",
    notes: [
      "A Pay online button after a request, to your own payment page (for example a Stripe Payment Link). BizPlug takes no payment: the customer pays on your page.",
      "Book online, Get directions and Leave a review buttons with your contact details, each to a link you save under Integrations on your plug-in page.",
    ],
    features: { menuCard: true, cardResults: true, cardNavigation: true, whatsappContact: true, businessLinks: true, quickActions: false, paymentAnswers: false, stripeCheckout: false, listingDetails: false, fullAnnotations: false, members: false, payCard: false, fullName: false, softwareMenu: false, businessOnlyInstructions: false, customerSignIn: false, appTools: false, eventGuide: false },
  },
  {
    version: "0.7.0",
    date: "2026-11-16",
    summary: "The business's own buttons (WhatsApp, booking, directions, reviews, social media) on the menu card and next to availability, with presses counted for the business.",
    notes: [
      "Your buttons show on your menu card, so a customer can message, book, find or follow you without asking first.",
      "A Book button to your booking page shows next to availability and open times, where a customer decides.",
      "The assistant knows which buttons you have and points to the right one at the right moment.",
      "Your Traction Dashboard counts how often each button is pressed, and where each request was delivered.",
    ],
    features: { menuCard: true, cardResults: true, cardNavigation: true, whatsappContact: true, businessLinks: true, quickActions: true, paymentAnswers: false, stripeCheckout: false, listingDetails: false, fullAnnotations: false, members: false, payCard: false, fullName: false, softwareMenu: false, businessOnlyInstructions: false, customerSignIn: false, appTools: false, eventGuide: false },
  },
  {
    version: "0.8.0",
    date: "2026-11-16",
    summary: "Clear answers on how to pay: the business's own payment page when it has one, offered whenever a customer asks, and payment never taken in the chat.",
    notes: [
      "When a customer asks how to pay or whether they can pay online, the assistant answers from your settings: your own payment page if you saved one (Stripe, PayPal, Square or another), otherwise that payment is arranged with you directly.",
      "Your payment page is also listed with your contact details, so a customer can find it before or without sending a request. It still shows after a request as before.",
      "The assistant never takes card details or payment in the chat. The customer pays on your page, and the money never passes through BizPlug.",
    ],
    features: { menuCard: true, cardResults: true, cardNavigation: true, whatsappContact: true, businessLinks: true, quickActions: true, paymentAnswers: true, stripeCheckout: false, listingDetails: false, fullAnnotations: false, members: false, payCard: false, fullName: false, softwareMenu: false, businessOnlyInstructions: false, customerSignIn: false, appTools: false, eventGuide: false },
  },
  {
    version: "0.9.0",
    date: "2026-11-16",
    summary: "Checkout on the business's own Stripe or Checkout.com account, when it has connected one: customers pay for an order or booking right after the request, and the status check asks the provider whether it was paid.",
    notes: [
      "Connect your own Stripe account (sign in with Stripe, or paste a key) or your Checkout.com account under Integrations: after a customer sends an order or booking with a price, they get a Pay now button to a checkout page in your business's name. The money goes to your account, never through BizPlug.",
      "The price is taken from your published files, never from the chat. Your plug-in confirms each payment with the provider, you get an email when an order is paid, and you can refund it from Payments on your plug-in page.",
      "Test mode first: no real money. Live payments are switched on for your plug-in once BizPlug has approved it. You still confirm every request yourself.",
    ],
    features: { menuCard: true, cardResults: true, cardNavigation: true, whatsappContact: true, businessLinks: true, quickActions: true, paymentAnswers: true, stripeCheckout: true, listingDetails: false, fullAnnotations: false, members: false, payCard: false, fullName: false, softwareMenu: false, businessOnlyInstructions: false, customerSignIn: false, appTools: false, eventGuide: false },
  },
  {
    version: "0.10.0",
    date: "2026-11-17",
    summary: "The plug-in introduces itself to ChatGPT and other clients with a description and a website, and BizPlug's industry-wide plug-ins with the BizPlug logo, privacy policy, terms and support contact.",
    notes: [
      "Your plug-in tells ChatGPT who it is: your business's own summary as its description, and your website as its link.",
      "Nothing changes in how it answers customers or handles requests.",
    ],
    features: { menuCard: true, cardResults: true, cardNavigation: true, whatsappContact: true, businessLinks: true, quickActions: true, paymentAnswers: true, stripeCheckout: true, listingDetails: true, fullAnnotations: false, members: false, payCard: false, fullName: false, softwareMenu: false, businessOnlyInstructions: false, customerSignIn: false, appTools: false, eventGuide: false },
  },
  {
    version: "0.11.0",
    date: "2026-11-17",
    summary: "Every tool states whether it only reads, whether its action can be taken back and whether it reaches outside the business's own data, as ChatGPT's plug-in directory requires.",
    notes: [
      "Each tool of your plug-in now states whether it only reads information or sends something that cannot be taken back. ChatGPT uses this to decide when to ask a customer to confirm.",
      "Sending a request is marked as an action that cannot be undone, so ChatGPT may ask the customer to confirm before it is sent. Nothing else changes.",
    ],
    features: { menuCard: true, cardResults: true, cardNavigation: true, whatsappContact: true, businessLinks: true, quickActions: true, paymentAnswers: true, stripeCheckout: true, listingDetails: true, fullAnnotations: true, members: false, payCard: false, fullName: false, softwareMenu: false, businessOnlyInstructions: false, customerSignIn: false, appTools: false, eventGuide: false },
  },
  {
    version: "0.12.0",
    date: "2026-11-17",
    summary: "Coworking & Offices: a business can publish its member businesses, so people can find a member by name, kind of business or what they need or offer, and contact it directly.",
    notes: [
      "For coworking plug-ins: upload members.csv with the member businesses that agreed to be listed, and your plug-in gets a Members button. People search your members by name, kind of business or location, and open each one to see what it does, what it is looking for and what it offers.",
      "Find a collaborator: a person says what they need or what they can offer, and the plug-in shows the members whose entries match.",
      "Contact is direct: the plug-in shows the website, general email and phone number you list for each member, and the person writes or calls the member themselves. Neither you nor BizPlug introduces, forwards or vouches. Other plug-ins do not change.",
    ],
    features: { menuCard: true, cardResults: true, cardNavigation: true, whatsappContact: true, businessLinks: true, quickActions: true, paymentAnswers: true, stripeCheckout: true, listingDetails: true, fullAnnotations: true, members: true, payCard: false, fullName: false, softwareMenu: false, businessOnlyInstructions: false, customerSignIn: false, appTools: false, eventGuide: false },
  },
  {
    version: "0.13.0",
    date: "2026-11-18",
    summary: "A pay step in the card after a request with checkout: the total, a Pay now button to the business's own checkout page, and an I've paid button that checks the payment.",
    notes: [
      "After a customer sends an order or booking with a price, the card shows the total and a Pay now button to your Stripe or Checkout.com checkout page, with a TEST badge while you are in test mode.",
      "An I've paid button in the card asks your payment provider whether the payment went through and shows Paid or Waiting for payment, without the customer typing their reference.",
      "Card details are only ever entered on the payment provider's own page, never in ChatGPT.",
    ],
    features: { menuCard: true, cardResults: true, cardNavigation: true, whatsappContact: true, businessLinks: true, quickActions: true, paymentAnswers: true, stripeCheckout: true, listingDetails: true, fullAnnotations: true, members: true, payCard: true, fullName: false, softwareMenu: false, businessOnlyInstructions: false, customerSignIn: false, appTools: false, eventGuide: false },
  },
  {
    version: "0.14.0",
    date: "2026-11-18",
    summary: "A business's plug-in shows its full name in ChatGPT, the business's name with what it is, and its own logo as the plug-in's icon.",
    notes: [
      "ChatGPT shows your plug-in under your business's name followed by what it is, for example \"msg2ai – AI messaging for hotels, rentals and events\", so customers can tell it apart from others.",
      "If your business.csv has a logo, ChatGPT can show it as your plug-in's icon.",
      "Nothing changes in how it answers customers or handles requests.",
    ],
    features: FULL_NAME_FEATURES,
  },
  {
    version: "0.15.0",
    date: "2026-11-18",
    summary: "Software & SaaS plug-ins get a menu made for software (Features, Pricing, Help & guides, Support, Book a demo), and every business's plug-in describes only the business to ChatGPT.",
    notes: [
      "For Software & SaaS plug-ins: the menu shows Features (what the product does, the plan each feature is on and its guide), Pricing, Help & guides (your help articles, searchable, each with its link), Support (a support request with a reference) and Book a demo.",
      "Upload features.csv, plans.csv and guides.csv, and add your pricing, support, documentation and status pages to business.csv.",
      "Listed in ChatGPT's plug-in directory: switch Listed in ChatGPT directory on, and Pricing shows only your pricing page, as OpenAI requires.",
      "Every industry: your plug-in now describes only your business to ChatGPT. It no longer calls itself a BizPlug plug-in in its instructions, and ChatGPT is no longer asked to mention BizPlug in its answers. The Contact BizPlug bar in the card stays.",
    ],
    features: SOFTWARE_FEATURES,
  },
  {
    version: "0.16.0",
    date: "2026-11-19",
    summary: "Customer sign-in with Clerk: a business that runs its own Clerk application can make its plug-in answer only its signed-in customers or members.",
    notes: [
      "Customer sign-in: under Integrations, open Clerk sign-in and save the API keys of your own Clerk application. From then on ChatGPT asks each customer to sign in with your Clerk sign-in page when they add your plug-in, and your plug-in answers only signed-in customers.",
      "Use it for a plug-in that is only for your members or existing customers. BizPlug checks each customer's sign-in with your Clerk application on every request and keeps none of their account details.",
      "Without Clerk keys saved, nothing changes: your plug-in stays open to anyone, as before.",
    ],
    features: { ...SOFTWARE_FEATURES, customerSignIn: true },
  },
  {
    version: "0.17.0",
    date: "2026-11-19",
    summary: "Account tools: a business that runs its own MCP server can offer its tools in its plug-in, so signed-in customers work in their own account from ChatGPT.",
    notes: [
      "Account tools: if your product has its own MCP server, save its address under Integrations, in the Clerk sign-in panel. Your plug-in then also offers your server's tools, so a customer can work in their own account with you from ChatGPT.",
      "Customers sign in with your Clerk application to use those tools. The rest of your plug-in (menu, answers, requests) stays open to anyone, so people who are not customers yet can still ask about your product.",
      "Your plug-in offers the tools your server listed when you saved the address, and keeps exactly those until you press Refresh. Each call goes to your server with the customer's own sign-in; BizPlug keeps neither the sign-in nor what was asked or answered.",
      "Without a saved address nothing changes: with Clerk sign-in alone, your whole plug-in still answers only signed-in customers, as in 0.16.0.",
    ],
    features: { ...SOFTWARE_FEATURES, customerSignIn: true, appTools: true },
  },
  {
    version: "0.18.0",
    date: "2026-11-19",
    summary: "Event guide: an Events & Conferences plug-in for a show or conference answers with its agenda, speakers, exhibitors and sponsors, and sends exhibiting, sponsoring and visiting enquiries.",
    notes: [
      "For shows and conferences: upload sessions.csv (the agenda), speakers.csv, exhibitors.csv and sponsors.csv, and your plug-in becomes an event guide. The menu shows About the event, Agenda (by day), Speakers, Exhibitors & sponsors (searchable, each with its website and email) and Send an enquiry.",
      "An enquiry (exhibiting, sponsoring, visiting, speaking or anything else) reaches your team with a reference, like any other request. People contact an exhibitor directly with the details you publish.",
      "A show needs no inventory.csv. A venue that publishes no programme keeps the venue menu (availability, date holds) as before.",
    ],
    features: { ...SOFTWARE_FEATURES, customerSignIn: true, appTools: true, eventGuide: true },
  },
];

export const LATEST_VERSION = PLUGIN_VERSIONS[PLUGIN_VERSIONS.length - 1].version;
/** "16 November 2026", for a version's ISO date. */
export const versionDate = (v: PluginVersion) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${v.date}T00:00:00Z`));
/** Plug-ins published before versions were recorded ran this one. */
export const FIRST_VERSION = PLUGIN_VERSIONS[0].version;

const parts = (v: string) => v.split(".").map((n) => Number(n) || 0);
/**
 * One number for a business's published plug-in: the plug-in version with the release as its third part, so
 * release 4 on 0.12.0 reads 0.12.4. Plug-in versions step the second number, which leaves the third for the release.
 */
export const releaseVersion = (version: string, release: number) => `${parts(version)[0]}.${parts(version)[1] ?? 0}.${release}`;
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

/** What a business's plug-in can use, to tell whether a version changes anything for it. */
export type UpgradeContext = {
  /** The industry has members (industry-functions.ts `members`). */
  members: boolean;
  /** A Stripe or Checkout.com account is connected and payments are not switched off. */
  checkout: boolean;
  /** A software product (industry-functions.ts `software`). */
  software: boolean;
  /** A show or conference can publish its programme (industry-functions.ts `show`, Events & Conferences). */
  show: boolean;
};

/**
 * Features that only act for some plug-ins. Every other feature changes every plug-in. A version matters to a
 * plug-in when at least one feature it turns on applies to it; one that does not is not offered as an upgrade.
 */
const APPLIES: Partial<Record<keyof PluginFeatures, (c: UpgradeContext) => boolean>> = {
  members: (c) => c.members,
  stripeCheckout: (c) => c.checkout,
  payCard: (c) => c.checkout,
  softwareMenu: (c) => c.software,
  eventGuide: (c) => c.show,
};

export function versionMatters(v: PluginVersion, c: UpgradeContext): boolean {
  const before = PLUGIN_VERSIONS[PLUGIN_VERSIONS.indexOf(v) - 1];
  const added = (Object.keys(v.features) as (keyof PluginFeatures)[]).filter((k) => v.features[k] && !before?.features[k]);
  // A version that turns on no feature changed something for everyone.
  if (!added.length) return true;
  return added.some((k) => APPLIES[k]?.(c) ?? true);
}

/** The versions after `v` that change something for this plug-in. */
export const relevantVersionsAfter = (v: string, c: UpgradeContext) => versionsAfter(v).filter((x) => versionMatters(x, c));

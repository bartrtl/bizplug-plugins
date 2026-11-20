// Per-industry plug-in definitions, derived from industries.ts.
// Modelled on the VisitPass ChatGPT plug-in package: plugin.json + mcp.json per plug-in.
// `pnpm plugins:build` writes plugins/<slug>/{plugin.json,mcp.json}; CI fails if they drift.
import { industries, type Industry } from "@/lib/industries";
import { getFunction, type Engine, type IndustryFunction, type Span } from "@/lib/industry-functions";
import { pricing } from "@/lib/pricing";
import { siteConfig } from "@/lib/seo";
import { directoryPath, type DirectoryDef } from "@/lib/directory-store";

export const PLUGIN_VERSION = "0.26.0"; // versions and their notes: plugin-versions.ts
export const MCP_HOST = "https://mcp.bizplug.ai";
/** Where plug-ins published to test from the client portal answer: the same app, on its test host. */
export const MCP_TEST_HOST = "https://mcp-test.bizplug.ai";

/** The public plug-in packages on GitHub, one folder per industry slug. */
export const PLUGINS_REPO = "https://github.com/msg2ai/bizplug-plugins";
export const pluginRepoUrl = (slug: string) => `${PLUGINS_REPO}/tree/main/plugins/${slug}`;

/** Where "Add plug-in for my business" sends a business: the plug-in in the client portal. Signed-out visitors are sent to sign-up first (src/proxy.ts). */
export const addPluginUrl = (slug: string) => `/portal/plug-ins/${slug}`;

export type PluginTool = {
  name: string;
  title: string;
  description: string;
  readOnly: boolean;
};

export type PluginTestCase = { prompt: string; expect: string; shouldTrigger: boolean };

/** One option of a plug-in's menu: what show_menu returns in ChatGPT and what the plug-in pages list. */
/** `kind` tells the ChatGPT card (widgets/plugin-widget.ts) which inputs the option asks for. */
export type MenuKind = "lookup" | "request" | "question" | "status" | "contact" | "members" | "features" | "pricing" | "guides" | "support" | "agenda" | "speakers" | "exhibitors" | "enquiry" | "account" | "tour" | "daypass" | "committees" | "news";
/**
 * `only`: on a software plug-in (industry-functions.ts `software`), the option belongs to the menu from plug-in
 * 0.15.0 ("software") or to the menu before it ("legacy"); plugin-mcp.ts shows the one a business's version has.
 * On an events plug-in (industry-functions.ts `show`), "show" options are the event guide of a show or conference that
 * published its programme (from 0.18.0), and "venue" options the menu of a venue; plugin-mcp.ts shows one of the two.
 * `hidden`: the card needs the option (a demo request is sent from the open times) but draws no button for it.
 */
export type MenuOption = { tool: string; kind: MenuKind; title: string; description: string; example: string; only?: "software" | "legacy" | "show" | "venue"; hidden?: boolean; /** 0.19.0, kind "account": which entry of the business's account menu this is, and its icon. */ key?: string; icon?: string };

export type IndustryPlugin = {
  slug: string;
  name: string;
  displayName: string;
  functionTitle: string;
  engine: Engine;
  shortDescription: string;
  longDescription: string;
  defaultPrompts: string[];
  tools: PluginTool[];
  /** The options show_menu returns, in order. The portal, /industries/<slug> and /plugins render the same list. */
  menu: MenuOption[];
  testCases: PluginTestCase[];
  mcpUrl: string;
};

const lower = (s: string) => s.toLowerCase();

/**
 * Industries whose businesses may publish their member businesses (`members` in industry-functions.ts; coworking, chambers)
 * get this tool and a Members menu option, from plug-in version 0.12.0. The server (plugin-mcp.ts) shows the
 * option only for a business that published a member list.
 */
export const MEMBERS_TOOL = "find_members";
/** 0.21.0 (`memberMessages`): drafts a first message from the person to one member; nothing is sent (members.ts). */
export const MEMBER_MESSAGE_TOOL = "write_to_member";

/** Software products (`software` in industry-functions.ts), from plug-in version 0.15.0 (software.ts). */
export const SOFTWARE_TOOLS = { features: "get_features", pricing: "get_pricing", guides: "search_help", support: "request_support" } as const;
export const isSoftwareTool = (name: string) => (Object.values(SOFTWARE_TOOLS) as string[]).includes(name);
/** Events (`show` in industry-functions.ts), from plug-in version 0.18.0: the event guide (event-guide.ts). */
export const SHOW_TOOLS = { agenda: "get_agenda", speakers: "find_speakers", exhibitors: "find_exhibitors", enquiry: "send_event_enquiry" } as const;
export const isShowTool = (name: string) => (Object.values(SHOW_TOOLS) as string[]).includes(name);
/**
 * Industries whose businesses may publish their locations with tours and day passes (`visits` in industry-functions.ts;
 * coworking), from plug-in version 0.22.0 (visits.ts). The server (plugin-mcp.ts) lists the tools only on a version
 * with the flag, and shows Book a tour and Day pass only for a business that published a location offering it.
 */
export const VISIT_TOOLS = { options: "get_visit_options", tour: "book_tour", pass: "request_day_pass" } as const;
export const isVisitTool = (name: string) => (Object.values(VISIT_TOOLS) as string[]).includes(name);
/** Who publishes the member list, in the tool copy: coworking's wording is unchanged since 0.12.0. */
const MEMBERS_HOST: Record<string, string> = { coworking: "the coworking business", chambers: "the chamber or association" };
const membersDirect = (slug: string) =>
  `Contact is direct: the person writes or calls the member themselves, and neither ${MEMBERS_HOST[slug] ?? "the business"} nor BizPlug introduces, forwards or vouches.`;

// [look-up, request, status] descriptions per engine. {n} is the industry's noun.
const TOOL_COPY: Record<Engine, [string, string, string]> = {
  order: [
    "List or search what this business sells, with ids and prices, from its published {n} list. Creates nothing.",
    "Send the customer's order to the business with a priced summary. Use only once the customer has confirmed the items. The business confirms and takes payment itself; nothing is charged in chat.",
    "Look up the status of an order by its reference.",
  ],
  stay: [
    "Check which {n} options are free for the customer's dates and party size, with the published rate and total price. Creates nothing.",
    "Send a booking request for the chosen {n} and dates to the business. Use only once the customer has chosen an option. The business confirms; nothing is held or charged in chat.",
    "Look up the status of a booking request by its reference.",
  ],
  appt: [
    "List bookable {n} options and the open times on a day, from the business's published hours. Creates nothing.",
    "Send a request for a {n} at an open time to the business. Use only once the customer has picked a time. The business confirms the appointment.",
    "Look up the status of a request by its reference.",
  ],
  quote: [
    "Work out a price estimate for a {n} from the business's published price list, or list what can be estimated. Creates nothing and is never a final price.",
    "Send the customer's {n} request and estimate to the business so it can confirm a price and a time. Use only once the customer agrees to send it.",
    "Look up the status of a request by its reference.",
  ],
  track: [
    "Look up the published status for a reference the customer already has. Creates nothing.",
    "Send a new {n} to the business. Use only once the customer has given the details and agrees to send it.",
    "Look up the status of a request by its reference.",
  ],
};

const TITLES: Record<Engine, [string, string, string]> = {
  order: ["Browse and prices", "Place the order", "Order status"],
  stay: ["Availability and price", "Request the booking", "Booking status"],
  appt: ["Open times", "Request the appointment", "Request status"],
  quote: ["Price estimate", "Request the job", "Job status"],
  track: ["Look up a reference", "Send a request", "Request status"],
};

// The menu: [look-up, request, status] in customer words, with a question to try. Examples stay generic
// here; a plug-in bound to one business swaps in its own first item (plugin-mcp.ts).
const MENU_COPY: Record<Engine, [string, string, string]> = {
  order: ["See what is on offer, with prices.", "Send your order. The business confirms it and takes payment itself.", "Check an order with its reference."],
  stay: ["See what is free for your dates and party size, with the total price.", "Send a booking request. The business confirms it; nothing is held or charged here.", "Check a booking request with its reference."],
  appt: ["See what can be booked and the open times on a day.", "Ask for an open time. The business confirms the appointment.", "Check a request with its reference."],
  quote: ["Get an estimate from the published price list. It is never a final price.", "Send your request and estimate so the business can confirm a price and a time.", "Check a request with its reference."],
  track: ["Look up the status of a reference you already have.", "Send a new request to the business.", "Check a request with its reference."],
};

const MENU_EXAMPLES: Record<Engine, [string, string, string]> = {
  order: ["What do you have, and how much is it?", "I'd like to order for pickup", "What's the status of my order?"],
  stay: ["What's available this Saturday for 2 people?", "Please request the first option for me", "What's the status of my booking request?"],
  appt: ["What times are open this week?", "Book the first open time on Tuesday", "What's the status of my request?"],
  quote: ["Can I get a price estimate?", "Send my request to the business", "What's the status of my request?"],
  track: ["What's the status of my reference number?", "I'd like to send a new request", "What's the status of my request?"],
};

// What a stay look-up sounds like depends on whether it is booked by the night, by the day or for one date.
const STAY_FIRST: Record<Span, string> = {
  nights: "Do you have anything free this weekend for 2 guests?",
  days: "What's free next Saturday, and what does it cost?",
  single: "What's available this Saturday for 2 people?",
};

function buildMenu(i: Industry, fn: IndustryFunction): MenuOption[] {
  const { engine, tools } = fn;
  const example = (idx: 0 | 1 | 2) => (engine === "stay" && idx === 0 ? STAY_FIRST[fn.span ?? "single"] : MENU_EXAMPLES[engine][idx]);
  const KINDS = ["lookup", "request", "status"] as const;
  const step = (idx: 0 | 1 | 2): MenuOption => ({ tool: tools[idx], kind: KINDS[idx], title: TITLES[engine][idx], description: MENU_COPY[engine][idx], example: example(idx) });
  const question: MenuOption = { tool: "get_business_info", kind: "question", title: "Ask a question", description: `Answers from the business's own information: ${i.covers}.`, example: i.ask };
  // 0.15.0, software products: what it does, what it costs, how to use it, getting help, and a demo. The engine's
  // look-up and request stay, as Book a demo; the menu before 0.15.0 stays for plug-ins pinned to it.
  if (fn.software) {
    const legacy = (o: MenuOption): MenuOption => ({ ...o, only: "legacy" });
    return [
      { tool: SOFTWARE_TOOLS.features, kind: "features", title: "Features", description: "What it does: find a feature, the plan it is on and the guide that explains it.", example: "Does it sync with my CRM?", only: "software" },
      { tool: SOFTWARE_TOOLS.pricing, kind: "pricing", title: "Pricing", description: "The plans and what each includes, or the pricing page.", example: "What does it cost?", only: "software" },
      { tool: SOFTWARE_TOOLS.guides, kind: "guides", title: "Help & guides", description: "Search the help articles and guides, and open the one you need.", example: "How do I get started?", only: "software" },
      { tool: SOFTWARE_TOOLS.support, kind: "support", title: "Support", description: "Send a question or a problem to the support team, and check it later with its reference.", example: "I need help with my account", only: "software" },
      { ...step(0), title: "Book a demo", description: "See the open times for a demo and ask for one. The team confirms it by email.", only: "software" },
      legacy(step(0)),
      { ...step(1), title: "Request a demo", hidden: true, only: "software" },
      legacy(step(1)),
      legacy(question),
      step(2),
      { tool: "get_contact", kind: "contact", title: "Contact", description: "Email, website, and the support and status pages.", example: "How do I contact the team?", only: "software" },
      legacy({ tool: "get_contact", kind: "contact", title: "Contact the business", description: "Phone, email, website and opening hours.", example: "How do I contact the business?" }),
    ];
  }
  // 0.18.0, events: a show or conference that published its programme gets the event guide; a venue keeps its menu.
  if (fn.show) {
    const venue = (o: MenuOption): MenuOption => ({ ...o, only: "venue" });
    return [
      { ...question, title: "About the event", description: "Dates, venue, opening hours, tickets and the event's own questions and answers.", example: "When and where is it?", only: "show" },
      { tool: SHOW_TOOLS.agenda, kind: "agenda", title: "Agenda", description: "The sessions by day: times, formats and speakers.", example: "What's on the first day?", only: "show" },
      { tool: SHOW_TOOLS.speakers, kind: "speakers", title: "Speakers", description: "Who speaks, their role and the sessions to catch them in.", example: "Who is speaking about sustainability?", only: "show" },
      { tool: SHOW_TOOLS.exhibitors, kind: "exhibitors", title: "Exhibitors & sponsors", description: "Find an exhibitor or sponsor by name or what it does, and contact it directly.", example: "Which exhibitors do stage lighting?", only: "show" },
      { tool: SHOW_TOOLS.enquiry, kind: "enquiry", title: "Send an enquiry", description: "Ask the organisers about exhibiting, sponsoring, visiting or speaking. The team replies by email.", example: "I'd like to exhibit next year", only: "show" },
      venue(step(0)),
      venue(step(1)),
      venue(question),
      venue(step(2)),
      { tool: "get_contact", kind: "contact", title: "Contact the business", description: "Phone, email, website and opening hours.", example: "How do I contact the business?" },
    ];
  }
  // A plug-in that mainly explains the business (chambers) starts with its questions and answers.
  // 0.22.0, coworking: a tour and a day pass, after the booking options.
  const visits: MenuOption[] = fn.visits
    ? [
        { tool: VISIT_TOOLS.tour, kind: "tour", title: "Book a tour", description: "Ask to see a location, when the business has published its locations: choose the location and a day. The business confirms the tour.", example: "Can I come for a tour on Tuesday morning?" },
        { tool: VISIT_TOOLS.pass, kind: "daypass", title: "Day pass", description: "Ask for a day pass at a location that sells one, with the published rate. The business confirms it; nothing is paid here.", example: "Can I get a day pass for tomorrow?" },
      ]
    : [];
  // 0.25.0, chambers: committees and news on their own screens, shown only for a business that published them.
  const showcase: MenuOption[] = fn.infoFirst
    ? [
        { tool: "get_business_info", kind: "committees", title: "Committees", description: "The committees and working groups, what each works on and who chairs it, when the business publishes them.", example: "Which committees can members join?" },
        { tool: "get_business_info", kind: "news", title: "News & events", description: "The latest news, upcoming events and the newsletter, with links to read more and sign up.", example: "What events are coming up?" },
      ]
    : [];
  return [
    ...(fn.infoFirst ? [question, ...showcase, step(1), step(0), ...visits] : [step(0), step(1), ...visits, question]),
    step(2),
    ...(fn.members
      ? [{ tool: MEMBERS_TOOL, kind: "members" as const, title: "Members", description: "The member businesses here, when the business has published its member list: find one by name, kind of business, or what you need or offer, and contact it directly.", example: "Which member businesses here could help with web design?" }]
      : []),
    { tool: "get_contact", kind: "contact", title: "Contact the business", description: "Phone, email, website and opening hours.", example: "How do I contact the business?" },
  ];
}

export function buildPlugin(i: Industry): IndustryPlugin {
  const noun = lower(i.name);
  const fn = getFunction(i.slug);
  if (!fn) throw new Error(`No industry function defined for ${i.slug}`);
  const rule = fn.note ? ` ${fn.note}` : "";
  const tools: PluginTool[] = [
    {
      name: "show_menu",
      title: "Menu",
      description: "Return this plug-in's menu: what the customer can do here, each with a short title, a one-line description and a question to try. Call it when the customer asks what this can do, asks for a menu or options, or opens without a question. ChatGPT shows the menu as a card with a button and a short form for each option; where there is no card, show the options exactly as returned (same titles, same order). Creates nothing.",
      readOnly: true,
    },
    ...fn.tools.map((name, idx) => ({
      name,
      title: TITLES[fn.engine][idx],
      description: TOOL_COPY[fn.engine][idx].replaceAll("{n}", fn.noun) + (idx < 2 ? rule : ""),
      readOnly: idx !== 1,
    })),
    {
      name: "get_business_info",
      title: "Business information",
      description: `Answer a general question about this ${noun} business using only its published profile: ${i.covers}. Creates nothing. If the profile does not cover the question, say so and use get_contact.${rule}`,
      readOnly: true,
    },
    {
      name: "get_contact",
      title: "Contact details",
      description: "Return the business's published contact details and opening hours for anything the other tools cannot do.",
      readOnly: true,
    },
    ...(fn.members
      ? [
          {
            name: MEMBERS_TOOL,
            title: "Members",
            description: `Find the member businesses of this ${noun} business, from the member list it published. Search by a name, a kind of business, or what the person needs or offers, optionally narrowed to an industry or a location; with no query it lists the members by industry. Returns each match with its description, what it is looking for, what it offers and its published contact details. Creates nothing and sends nothing. ${membersDirect(i.slug)} Share only what the business lists for a member.`,
            readOnly: true,
          },
          {
            name: MEMBER_MESSAGE_TOOL,
            title: "Write to a member",
            description: `Draft a first message from the person to one member business, in their own words and signed with their own name, and return the member's own published ways to receive it: an email link with the draft filled in, WhatsApp on the member's number, its website. Nothing is sent: the person reads the draft and sends it themselves. Use it when the person wants to contact a member they found with ${MEMBERS_TOOL}. ${membersDirect(i.slug)}`,
            readOnly: true,
          },
        ]
      : []),
    // 0.22.0, coworking: tours and day passes at the business's locations (visits.ts). Offered only to plug-ins on 0.22.0 or later.
    ...(fn.visits
      ? [
          { name: VISIT_TOOLS.options, title: "Tours and day passes", description: `List this ${noun} business's locations from what it published: where tours are given and their tour hours, and where a day pass is sold, with its rate per person per day and what it includes; optionally one location. Creates nothing and sends nothing. Use it for any question about tours, day passes or their prices.`, readOnly: true },
          { name: VISIT_TOOLS.tour, title: "Book a tour", description: "Ask for a tour of one of the business's published locations on a date. Use only once the customer has chosen the location and the day and wants to go ahead. Where the business takes these on WhatsApp, it returns the WhatsApp link and the exact message for the customer to send there, and sends nothing itself; otherwise it sends the request to the business with the customer's name and email and returns a reference. The business confirms the tour; nothing is booked here. Never invent a location or tour hours.", readOnly: false },
          { name: VISIT_TOOLS.pass, title: "Day pass", description: "Ask for a day pass at one of the business's published locations that sells one, for a date and a number of people. Use only once the customer has chosen the location and the day and wants to go ahead; for the price alone use the tours and day passes look-up. It returns the published rate times the people, or says the business confirms the price when no rate is published. Where the business takes these on WhatsApp, it returns the WhatsApp link and the exact message to send there, and sends nothing itself; otherwise it sends the request to the business with the customer's name and email and returns a reference. The business confirms; nothing is booked or paid here. Never invent a price or a location.", readOnly: false },
        ]
      : []),
    // 0.15.0, software products (software.ts). Offered only to plug-ins on 0.15.0 or later (plugin-mcp.ts).
    ...(fn.software
      ? [
          { name: SOFTWARE_TOOLS.features, title: "Features", description: "List or search what this software product does, from the features it published: each with what it does, the plan that includes it and the guide that explains it. Creates nothing.", readOnly: true },
          { name: SOFTWARE_TOOLS.pricing, title: "Pricing", description: "Return the product's plans as it published them, or only its pricing page when the product shows no plans here. Creates nothing; never quote a price that is not returned, and never start a subscription or an upgrade.", readOnly: true },
          { name: SOFTWARE_TOOLS.guides, title: "Help & guides", description: "Search the product's published help articles and guides by words or topic, and return each with its link. Creates nothing.", readOnly: true },
          { name: SOFTWARE_TOOLS.support, title: "Support request", description: "Send the customer's question or problem to the product's support team, with a reference to check it later. Use only once the customer has given the details and agrees to send it. The team replies by email.", readOnly: false },
        ]
      : []),
    // 0.18.0, events: the event guide. Offered only to a show or conference on 0.18.0 or later (plugin-mcp.ts).
    ...(fn.show
      ? [
          { name: SHOW_TOOLS.agenda, title: "Agenda", description: "List the sessions of this show or conference from the agenda it published, by day, with times, formats and speakers; optionally one day or sessions matching words (a topic, a speaker, a format). Says when the event is over. Creates nothing.", readOnly: true },
          { name: SHOW_TOOLS.speakers, title: "Speakers", description: "Find the speakers the event published, by name, company or topic, each with their role, published bio and the sessions they speak in. Creates nothing.", readOnly: true },
          { name: SHOW_TOOLS.exhibitors, title: "Exhibitors & sponsors", description: "Find the exhibitors and sponsors the event published, by name, what they do or a category, each with its published website and company contact details. Creates nothing and sends nothing: the customer contacts a company directly, and nobody introduces or forwards.", readOnly: true },
          { name: SHOW_TOOLS.enquiry, title: "Event enquiry", description: "Send the customer's enquiry about exhibiting, sponsoring, visiting, speaking or anything else to the event's organisers, with a reference. Use only once the customer has given the details and agrees to send it. The organisers reply by email; nothing is booked or paid.", readOnly: false },
        ]
      : []),
  ];
  return {
    slug: i.slug,
    name: i.name,
    displayName: `BizPlug ${i.name}`,
    functionTitle: fn.title,
    engine: fn.engine,
    shortDescription: `${fn.title} for ${noun} businesses.`,
    longDescription: `The ${noun} plug-in from BizPlug. Main function: ${lower(fn.title)}. It works from the business's own published profile, covering ${i.covers}, and sends requests to the business to confirm. It never takes payment and only shares what the business has published.${rule} Provided by ${siteConfig.name}: ${siteConfig.url}, ${siteConfig.email}.`,
    defaultPrompts: [fn.title, i.ask, "How do I contact the business?"],
    tools,
    menu: buildMenu(i, fn),
    testCases: [
      { prompt: "What can this plug-in do?", expect: "Calls show_menu, which shows the menu card; does not list the options again, or lists them exactly as returned where there is no card.", shouldTrigger: true },
      { prompt: fn.title, expect: `Calls ${fn.infoFirst ? "get_business_info" : fn.tools[0]} and answers from the published profile.`, shouldTrigger: true },
      { prompt: i.ask, expect: "Answers from the business profile, or says it is not covered and offers contact details.", shouldTrigger: true },
      { prompt: "Go ahead and send it.", expect: `Calls ${fn.tools[1]} only after the customer has confirmed the details, and reports that the business still has to confirm.`, shouldTrigger: true },
      ...(fn.software
        ? [
            { prompt: "What does it cost?", expect: `Calls ${SOFTWARE_TOOLS.pricing} and shows the published plans, or only the pricing page when the product shows no plans; never invents a price or offers a subscription.`, shouldTrigger: true },
            { prompt: "How do I connect my CRM?", expect: `Calls ${SOFTWARE_TOOLS.guides} (or ${SOFTWARE_TOOLS.features}) and gives the matching guide with its link, or says none is published.`, shouldTrigger: true },
          ]
        : []),
      ...(fn.members
        ? [{ prompt: "Which member businesses here could help with web design?", expect: `Calls ${MEMBERS_TOOL} and lists the matching members with their published contact details, or says the business has not published a member list; says the customer contacts a member directly and offers no introduction.`, shouldTrigger: true }]
        : []),
      ...(fn.visits
        ? [
            { prompt: "Which of your locations give tours, and is there a day pass?", expect: `Calls ${VISIT_TOOLS.options} and lists only the published locations, tour hours and day pass rates, or says the business has not published its locations; invents no location, hours or price.`, shouldTrigger: true },
            { prompt: "I'd like a tour next Tuesday at 10:00 for two people.", expect: `Asks which location when the business has more than one, then calls ${VISIT_TOOLS.tour}. Gives the WhatsApp link and the exact message to send when the business takes tours on WhatsApp, without asking for a name or email; otherwise asks for the customer's name and email first and gives the reference. Says the business still has to confirm, and never that the tour is booked.`, shouldTrigger: true },
            { prompt: "How much is a day pass for two people tomorrow?", expect: `Calls ${VISIT_TOOLS.options} and quotes only the published rate, or says the business confirms the price; calls ${VISIT_TOOLS.pass} only once the customer wants to go ahead, and takes no payment.`, shouldTrigger: true },
          ]
        : []),
      { prompt: "Write me a poem about the ocean.", expect: "Does not call any tool.", shouldTrigger: false },
    ],
    mcpUrl: `${MCP_HOST}/plugin/${i.slug}`,
  };
}

export const plugins: IndustryPlugin[] = industries.map(buildPlugin);

/** The menu a customer sees on the current plug-in version, as the public pages and the portal list it. */
// An events plug-in lists the venue menu here: the event guide is per business, for a show that published its programme.
export const currentMenu = (p: IndustryPlugin) => p.menu.filter((o) => o.only !== "legacy" && o.only !== "show" && !o.hidden);

export function getPlugin(slug: string) {
  return plugins.find((p) => p.slug === slug);
}

/** Who publishes the plug-in packages, as each package's `author`. */
export const PLUGIN_AUTHOR = { name: "Bart Cant - Rethink Labs", email: siteConfig.email, url: siteConfig.url };
/** The logo every industry plug-in package carries, under public/. */
export const PLUGIN_LOGO = "logo.png";
/** BizPlug's lime, for surfaces that tint a plug-in with its brand colour. */
export const PLUGIN_BRAND_COLOR = "#d4ff3a";

export function pluginJson(p: IndustryPlugin) {
  return {
    $schema: "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
    name: `bizplug-${p.slug}`,
    version: PLUGIN_VERSION,
    description: p.longDescription,
    author: PLUGIN_AUTHOR,
    homepage: `${siteConfig.url}/industries/${p.slug}`,
    repository: PLUGINS_REPO,
    mcpServers: "./mcp.json",
    extensions: {
      "com.openai": {
        interface: {
          displayName: p.displayName,
          shortDescription: p.shortDescription,
          longDescription: p.longDescription,
          defaultPrompt: p.defaultPrompts,
          category: "Business",
          websiteURL: `${siteConfig.url}/industries/${p.slug}`,
          privacyPolicyURL: `${siteConfig.url}/privacy`,
          termsOfServiceURL: `${siteConfig.url}/terms`,
          developerName: siteConfig.name,
          supportURL: `${siteConfig.url}/contact`,
          supportEmail: siteConfig.email,
          brandColor: PLUGIN_BRAND_COLOR,
          // The package carries its own copy of the logo (scripts/build-plugins.ts copies it from public/).
          logo: "./assets/icon.png",
          composerIcon: "./assets/icon.png",
        },
        review: {
          commerce: false,
          test_cases: p.testCases,
          demo_recording_url: null,
        },
        publication: { status: "draft", pricing: `${pricing.plugin.monthlyLabel}/month or ${pricing.plugin.annualLabel}/year` },
      },
    },
  };
}

export function mcpJson(p: IndustryPlugin) {
  return {
    $schema: "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
    mcpServers: {
      [`bizplug-${p.slug}`]: {
        type: "streamable-http",
        url: p.mcpUrl,
        extensions: { "com.openai": { auth: { type: "none" } } },
      },
    },
  };
}

// ---------- Event directory plug-ins (src/lib/directory-store.ts) ----------

export function directoryPluginJson(d: DirectoryDef) {
  return {
    $schema: "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
    name: `bizplug-${d.slug}`,
    version: PLUGIN_VERSION,
    description: d.longDescription,
    author: PLUGIN_AUTHOR,
    mcpServers: "./mcp.json",
    extensions: {
      "com.openai": {
        interface: {
          displayName: d.displayName,
          shortDescription: d.shortDescription,
          longDescription: d.longDescription,
          defaultPrompt: d.defaultPrompts,
          category: "Business",
          websiteURL: `${siteConfig.url}${d.pagePath}`,
          privacyPolicyURL: `${siteConfig.url}/privacy`,
          termsOfServiceURL: `${siteConfig.url}/terms`,
          // The package carries its own copy of the icon (scripts/build-plugins.ts copies it from public/).
          ...(d.icon ? { logo: "./assets/icon.png", composerIcon: "./assets/icon.png" } : {}),
        },
        review: {
          commerce: false,
          test_cases: [
            { prompt: d.defaultPrompts[0], expect: "Calls search_startups with the thesis in query and stage/region as filters, and lists matching startups with pitch, country and programme.", shouldTrigger: true },
            { prompt: "My thesis is AI for SME finance. Priorities: payments first, then SMEs, then AI. Rank the startups I should meet.", expect: "Calls rank_startups with the thesis and the priorities in order, and shows a ranked shortlist with each fit score and its reasons, without calling it investment advice.", shouldTrigger: true },
            { prompt: "Tell me more about the first one. How much have they raised?", expect: "Calls get_startup and says funding is not published, offering a web look-up or an intro request.", shouldTrigger: true },
            { prompt: "Introduce me to the founders.", expect: "Asks for the investor's own name and firm (never filling them from memory), calls contact_founders, and shows the draft intro with the startup's own email, WhatsApp, LinkedIn or website links for the investor to send directly; does not say BizPlug will pass anything on.", shouldTrigger: true },
            { prompt: "What can this plug-in do?", expect: "Calls show_menu and shows its options exactly as returned, starting with ranking by investment thesis and ending with Contact BizPlug; does not describe intros as BizPlug introductions.", shouldTrigger: true },
            { prompt: "Who is behind this, and how do I contact them?", expect: "Calls about_bizplug and gives BizPlug's website, email and, where set, WhatsApp link.", shouldTrigger: true },
            { prompt: "Should I invest in this startup?", expect: "Does not give investment advice; offers the published details instead.", shouldTrigger: true },
            { prompt: "Write me a poem about the ocean.", expect: "Does not call any tool.", shouldTrigger: false },
          ],
          demo_recording_url: null,
        },
        publication: { status: "draft", pricing: "free" },
      },
    },
  };
}

export function directoryMcpJson(d: DirectoryDef) {
  return {
    $schema: "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
    mcpServers: {
      [`bizplug-${d.slug}`]: {
        type: "streamable-http",
        url: `${MCP_HOST}${directoryPath(d)}`,
        extensions: { "com.openai": { auth: { type: "none" } } },
      },
    },
  };
}

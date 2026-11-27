// What a plug-in can be bundled with: where its requests go, and the systems it can connect to. The client
// portal shows these on every plug-in and lets a client choose the ones they want; the choice goes to the
// BizPlug team with the deploy request. Statuses must stay true (CLAUDE.md): only mark something "included"
// when the standard plan really does it. Custom integrations follow src/lib/integrations.ts: separate work,
// quoted before anything is built.
import type { Engine, Span } from "@/lib/industry-functions";
import { CUSTOMER_LINKS, type CustomerLinkKey } from "@/lib/customer-links";

export type AddonStatus = "included" | "setup" | "custom";
export type AddonGroup = "requests" | "chat" | "website" | "ticketing" | "forms" | "payments" | "calendars" | "reviews" | "social" | "access";

export type Addon = {
  id: string;
  name: string;
  group: AddonGroup;
  status: AddonStatus;
  /** One sentence: what the client gets. */
  what: string;
  /** What the business must have before it can switch this on, shown at the top of its panel. Short and concrete. */
  needs?: string[];
  /** One sentence for the public site: why it is worth having, in the business's terms. Must be true of `what`. */
  value?: string;
  /**
   * How the client sets it up or gets it switched on, step by step. The portal shows these under each option and
   * for everything the client has chosen. Like the statuses, they must describe what really happens.
   */
  steps: string[];
  /** Something to open while following the steps, e.g. the example webhook request or the how-to page. */
  link?: { label: string; href: string };
  /**
   * For work BizPlug does with the client: a way to get most of the result today with what the plan already
   * includes, written as steps the client can follow alone. Only what works today, with its limits said.
   */
  today?: { title: string; steps: string[]; note?: string };
  /** What the custom build adds over `today`. */
  adds?: string;
  /** What BizPlug asks before it can quote or connect, so the client can have it ready. */
  prepare?: string[];
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
  chat: "Chat with your customers",
  website: "Booking from your website",
  ticketing: "Event-specific tools",
  forms: "Forms",
  payments: "Payment pages",
  calendars: "Calendars and booking pages",
  reviews: "Directions and reviews",
  social: "Social media",
  access: "Who can use your plug-in",
};

// Offered on every plug-in.
const ALWAYS: Addon[] = [
  {
    id: "email", name: "Email", group: "requests", status: "included",
    what: "Every order, booking or request is emailed to the inbox you choose.",
    needs: ["An inbox your team reads."],
    value: "Every request lands in the inbox your team already watches, with a button to reply to the customer, so there is no new tool to check.",
    steps: [
      "Enter the inbox that should receive requests and press Save. It applies to your test and live plug-in at once. Left empty, requests go to the notify_email column of business.csv.",
      "Press Send a test email and check that inbox, and its spam folder.",
      "Each email has the request, the customer's contact details and a Reply to customer button. Use the button: a plain reply goes to BizPlug, not to the customer.",
    ],
  },
  {
    id: "google-sheets", name: "Google Sheets", group: "requests", status: "included",
    what: "A row per request in a sheet in your own Google Drive. You connect it yourself with Google sign-in.",
    needs: ["A Google account that should own the sheet.", "Your plug-in live on test (request your test deploy first)."],
    value: "A running list of every order, booking and enquiry that you can sort, share and total, with nothing copied by hand.",
    steps: [
      "Your plug-in must be live on test first: request your test deploy.",
      "Press Connect Google Sheets and sign in with the Google account that should own the sheet. BizPlug gets access to the one sheet it creates, not to the rest of your Drive.",
      "A sheet named BizPlug requests appears in your Drive, and every request adds a row. You can disconnect on the same page at any time; the sheet stays yours.",
      "Press Add a test row and look for it in the sheet.",
    ],
  },
  {
    id: "webhook", name: "Webhook", group: "requests", status: "included",
    what: "Each request is posted to a URL you give us, which is how Zapier, Make and n8n receive it.",
    needs: ["A system or tool that can receive a web request at an https:// address."],
    value: "Your own system gets each request as data the moment it is made, so it can go straight into the software you already run.",
    steps: [
      "Create the URL that will receive your requests. In Zapier: Webhooks by Zapier, Catch Hook. In Make: Webhooks, Custom webhook. In n8n: a Webhook node set to POST (use its production URL). The URL must start with https://.",
      "Paste the URL and press Save. It is stored encrypted and applies to your test and live plug-in at once. Treat it like a password: anyone who has it can post to it.",
      "Press Send a test request. You see what your URL answered, or the error if it failed.",
      "Each request is posted once as JSON; the example request shows every field. A failed delivery is not retried, so keep the URL working.",
    ],
    link: { label: "Example request (JSON)", href: "/webhooks/example-request.json" },
  },
];

/**
 * How every custom integration goes, from ticking the box to live. The same for all of them, so it lives once;
 * it follows `integrationSteps` in integrations.ts. Nothing is built before the client agrees to a quote.
 */
export const CUSTOM_PROCESS = [
  "Open it under Integrations and press Request. Your plug-in does not wait for it: the standard plug-in can be tested and go live in the meantime.",
  "Request your deploy. Your choice goes to BizPlug with the request. Write what you already know (see Have this ready) in the box above the deploy button, Anything we should know.",
  "BizPlug, or one of its partners, emails you with any questions left and checks what the other system allows.",
  "You get a quote: what will be built, how long it takes and what it costs. The fee is separate from your plan. Nothing is built or charged until you agree.",
  "It is built and tested with you, then switched on for your plug-in.",
];

// Posted by BizPlug itself to a Slack incoming webhook the client creates for their channel (business-notify.ts).
const SLACK: Addon = {
  id: "slack", name: "Slack", group: "requests", status: "included",
  what: "Every request posted to a channel in your Slack workspace, by BizPlug itself.",
  needs: ["A Slack workspace.", "Permission to add an app to it. In many workspaces only an admin can."],
  value: "The whole team sees a new request in its channel the moment it arrives, so the first person free can pick it up.",
  steps: [
    "In Slack, make an incoming webhook for the channel that should get your requests: at api.slack.com/apps create an app for your workspace, open Incoming Webhooks, switch it on, press Add New Webhook to Workspace and choose the channel. In many workspaces only an admin can add an app.",
    "Copy the webhook URL Slack gives you. It starts with https://hooks.slack.com/.",
    "Paste it into Slack webhook URL and press Save. It is stored encrypted and applies to your test and live plug-in at once. Treat it like a password: anyone who has it can post to that channel.",
    "Press Send a test message and look for it in the channel. From then on every request is posted there, next to the email you already get.",
  ],
  link: { label: "How to get requests in Slack", href: "/how-to/requests/slack" },
};

// The business's own WhatsApp number: a link that opens a chat with it (wa.me). No WhatsApp service in between.
const WHATSAPP: Addon = {
  id: "whatsapp", name: "WhatsApp", group: "chat", status: "included",
  what: "A WhatsApp button to your business's own number, with your contact details and after each request.",
  needs: ["A phone number that is on WhatsApp or WhatsApp Business."],
  value: "Customers who would rather chat than wait for an email reach you on WhatsApp in one tap, with their message already started.",
  steps: [
    "Enter your business's WhatsApp number with its country code, and the message a customer starts with, then press Save. It applies to your test and live plug-in at once.",
    "Press Open WhatsApp to test it: WhatsApp opens a chat with that number and your message filled in. Nothing is sent until you press send there.",
    "Customers get the same button with your contact details and after they send a request. Requests still reach you by email; the button is an extra way for a customer to reach you.",
    "The button shows from plug-in version 0.5.0. If your plug-in runs an older version, press Upgrade on your plug-in page.",
  ],
  link: { label: "How WhatsApp works with your plug-in", href: "/how-to/requests/whatsapp" },
};

const WHATSAPP_PREPARE = [
  "The phone number your business wants to use on WhatsApp, and whether it is already used in WhatsApp or the WhatsApp Business app.",
  "Who answers customers there, and in which hours.",
];
const CONCIERGE_LINK = { label: "How WhatsApp works with your plug-in", href: "/how-to/requests/whatsapp" };
const WHATSAPP_READY: Addon = {
  id: "whatsapp-concierge", name: "WhatsApp ordering and booking", group: "chat", status: "setup",
  what: "Customers finish their order or booking on WhatsApp with your business, through msg2ai.",
  steps: [
    "Open WhatsApp ordering and booking under Integrations, press Request, and request your deploy.",
    "BizPlug contacts you to connect your business's WhatsApp number through msg2ai, the WhatsApp service of the company behind BizPlug.",
    "Once it is connected, the plug-in gives your customer a WhatsApp link to finish the order or booking with your business there. The assistant then asks for no name or email.",
    "Try it on your test plug-in before you request production.",
  ],
  prepare: WHATSAPP_PREPARE,
  link: CONCIERGE_LINK,
};
// The business's assistant in msg2ai, the WhatsApp service of the company behind BizPlug: the client enters the
// assistant's WhatsApp number and its join code, and the WhatsApp button opens that assistant (client-integrations.ts).
const MSG2AI_ASSISTANT: Addon = {
  id: "msg2ai-assistant", name: "Msg2ai WhatsApp assistant", group: "chat", status: "included",
  what: "The WhatsApp button opens your assistant in msg2ai, which continues with your customer on WhatsApp.",
  needs: ["A WhatsApp assistant in msg2ai, with its WhatsApp number and its join code."],
  steps: [
    "Enter the WhatsApp number of your assistant in msg2ai, with its country code, and the assistant's join code, then press Save. It applies to your test and live plug-in at once.",
    "Press Open WhatsApp to test it: WhatsApp opens a chat with that number and the message Join followed by your code filled in. Nothing is sent until you press send there.",
    "Customers get the same button with your contact details and after they send a request. While an assistant is saved here, the button opens the assistant instead of the number saved under WhatsApp.",
    "Requests still reach you by email. msg2ai is a separate product with its own plan: BizPlug only opens the chat, and what the assistant says there is set up in msg2ai.",
    "The button shows from plug-in version 0.5.0. If your plug-in runs an older version, press Upgrade on your plug-in page.",
  ],
  link: CONCIERGE_LINK,
};

// Other systems BizPlug posts each request to itself (request-destinations.ts). The client enters what the
// system needs and tests it; the fields and their hints are on the card.
const destLink = { label: "How to send requests to your other tools", href: "/how-to/requests/team-tools" };
const DEST_END = "It is stored encrypted and applies to your test and live plug-in at once. Requests still reach you by email as well.";
const TEAMS: Addon = {
  id: "teams", name: "Microsoft Teams", group: "requests", status: "included",
  what: "Every request posted to a channel in Microsoft Teams, by BizPlug itself.",
  needs: ["A Microsoft Teams channel.", "The Workflows app in Teams, to make the webhook."],
  value: "A new request appears in your Teams channel the moment it arrives, so nobody has to watch an inbox for it.",
  steps: [
    "In Teams, open the channel, choose More options, then Workflows, and pick the template Send webhook alerts to a channel. Save it and copy the webhook URL it gives you.",
    `Paste the URL into Teams webhook URL and press Save. ${DEST_END}`,
    "Press Send a test message and look for it in the channel.",
  ],
  link: destLink,
};
const HUBSPOT: Addon = {
  id: "hubspot", name: "HubSpot", group: "requests", status: "included",
  what: "Every request sent to HubSpot as a form submission, which creates or updates the customer's contact.",
  needs: ["A HubSpot account (the free one is enough).", "A form in it with the fields Email, First name, Last name, Phone number and Message, and CAPTCHA off."],
  value: "Every customer who asks through ChatGPT or Claude becomes a contact in your CRM, so follow-up starts from a complete list.",
  steps: [
    "In HubSpot, make a form with the fields Email, First name, Last name, Phone number and Message, and switch CAPTCHA off for it. The form does not need to be on a page.",
    "Open the form's embed code and copy the two values in it: portalId (your Hub ID) and formId.",
    `Enter them and press Save. ${DEST_END}`,
    "Press Send a test contact and look for the submission on the form, and for the contact BizPlug test in your contacts. If HubSpot rejects a field, the card shows which one.",
  ],
  link: destLink,
};
const TWENTY: Addon = {
  id: "twenty", name: "Twenty CRM", group: "requests", status: "included",
  what: "Every request filed in your own Twenty CRM: the customer as a person (found by email, else added) and a note with the request, tagged with the event or plug-in and the date and time.",
  needs: ["A Twenty workspace (cloud or self-hosted) and an API key from Settings, APIs & Webhooks."],
  value: "Every customer who asks through ChatGPT or Claude lands in your CRM with the event and the time, ready to follow up.",
  steps: [
    "In Twenty, open Settings, APIs & Webhooks, and create an API key. Copy it.",
    `Paste it here; leave the address empty for Twenty's cloud, or give your own https address if you host Twenty yourself. Press Save: BizPlug checks the key with Twenty first. ${DEST_END}`,
    "Press Add a test person and look for BizPlug test in your People, with a note on it.",
    "From then on each request adds or finds the person by email and adds a note titled with the event or plug-in, the request and the date and time. Attendees who share their LinkedIn profile (My registration) get it on their person and in a note.",
  ],
  link: destLink,
};
const NOTION: Addon = {
  id: "notion", name: "Notion", group: "requests", status: "included",
  what: "Every request added as a page in a Notion database.",
  needs: ["A Notion workspace where you can create a connection.", "A database for the requests, shared with that connection."],
  value: "Each request becomes a page in the database where you already plan your work, ready to assign and track.",
  steps: [
    "In Notion, make a database for your requests, or pick one you have. BizPlug fills in its title column and writes the request in the page.",
    "Make an internal connection in Notion's developer settings and copy its token. Then open the database, choose Add connections and add that connection.",
    `Paste the token and the link to the database and press Save. BizPlug checks both at once and tells you if Notion refuses them. ${DEST_END}`,
    "Press Add a test page and look for it in the database.",
  ],
  link: destLink,
};
const TRELLO: Addon = {
  id: "trello", name: "Trello", group: "requests", status: "included",
  what: "Every request added as a card on a Trello list.",
  needs: ["A Trello account with a board and a list for the requests.", "An API key and a token from Trello's Power-Up admin page."],
  value: "Each request becomes a card at the top of your list and moves through your board like any other job.",
  steps: [
    "At trello.com/apps/admin, make a Power-Up for your workspace, open its API key page and generate an API key. Use the Token link next to it and press Allow to get a token.",
    `Paste the key, the token and the link to your board. Name the list the cards should go to, or leave it empty for the first list. Press Save: BizPlug looks the list up at once. ${DEST_END}`,
    "Press Add a test card and look for it at the top of the list.",
    "The token can read and change your whole Trello account, so keep it secret. You can revoke it in Trello at any time.",
  ],
  link: destLink,
};
const AIRTABLE: Addon = {
  id: "airtable", name: "Airtable", group: "requests", status: "included",
  what: "Every request added as a record in an Airtable table.",
  needs: ["An Airtable base with a table that has the columns Reference, Request, Summary, Notes, Customer, Email, Phone and Received.", "A personal access token that can write records to that base."],
  value: "Each request becomes a record you can filter, group and report on next to the rest of your operations.",
  steps: [
    "In your table, make these text columns, spelled exactly: Reference, Request, Summary, Notes, Customer, Email, Phone, Received. Other columns are left alone.",
    "At airtable.com/create/tokens, make a personal access token with the scope data.records:write and add your base to it.",
    `Paste the token and the link to the table and press Save. ${DEST_END}`,
    "Press Add a test record and look for it in the table. If a column is missing, the card shows what Airtable answered.",
  ],
  link: destLink,
};

// Buttons to the business's own pages (client-integrations.ts CUSTOMER_LINKS): one add-on per tool, so each has
// its own tile and logo. The client pastes a link, the customer gets a button. BizPlug only opens the link;
// whatever happens on that page is the business's own tool.
const LINK_VALUE: Record<string, (name: string) => string> = {
  payments: (n) => `A customer who is ready can pay a deposit or the full amount right after the request, on your own ${n} page.`,
  calendars: (n) => `Customers who want a confirmed slot go straight to your ${n} page, instead of waiting for a reply.`,
  reviews: (n) => (n === "Google Maps" ? "Customers find their way to you in one tap." : `Happy customers are one tap from leaving you a review on ${n}.`),
  social: (n) => `Customers can open your ${n} from ChatGPT or Claude in one tap, and follow what you post.`,
};
const LINK_NOTE: Record<string, string> = {
  payments: "The button shows after a customer sends a request. BizPlug takes no payment and is not told whether the customer paid: check payments in your payment tool, and confirm the request yourself.",
  calendars: "The button shows with your contact details. The booking is made on that page, in your booking tool. Your plug-in does not read its free times: the availability it shows still comes from the files you upload.",
  reviews: "The button shows with your contact details.",
  social: "The button shows with your contact details.",
};
export const linkAddonId = (key: string) => `link-${key}`;
const LINK_ADDONS: Addon[] = (Object.keys(CUSTOMER_LINKS) as CustomerLinkKey[]).map((key) => {
  const d = CUSTOMER_LINKS[key];
  const other = d.name.startsWith("Other ");
  return {
    id: linkAddonId(key), name: d.name, group: d.group, status: "included",
    what: other ? `A ${d.label} button to a page of your own.` : `A ${d.label} button to your ${d.name} page.`,
    ...(other ? {} : { value: LINK_VALUE[d.group](d.name) }),
    needs: [other ? "A public page of your own, at an https:// address." : `Your own ${d.name} page or account, and the link to it.`],
    steps: [
      `Copy the link to your ${other ? "page" : `${d.name} page`}, paste it and press Save. It applies to your test and live plug-in at once.`,
      "Press Open to check that it opens the right page.",
      LINK_NOTE[d.group],
      "The buttons show from plug-in version 0.6.0. If your plug-in runs an older version, press Upgrade on your plug-in page.",
    ],
    link: { label: "How to add buttons to your own pages", href: "/how-to/requests/customer-buttons" },
  };
});

// Offered where the plug-in is about availability.
const calendarLimit = "Your plug-in does not read your calendar: it works from the availability in the files you upload, and your business confirms every request itself.";
// 0.32.0: the business's own forms (form-links.ts), set up by the client alone in one tile.
const FORMS: Addon = {
  id: "forms", name: "Forms", group: "forms", status: "included",
  what: "Your own forms (Google Forms, Microsoft Forms, Typeform, Jotform, Tally and more) on your card and offered by the assistant, opened with what the customer already said filled in.",
  needs: ["A form in a form tool, and its share or prefilled link"],
  value: "Applications, registrations and surveys start from the chat, already filled in with what the customer said.",
  steps: [
    "Make the form in your form tool as usual, and copy its share link.",
    "To have answers filled in, use the form's prefilled link and put {name}, {email}, {phone}, {date} or {details} where an answer goes (in Google Forms: Get pre-filled link; Typeform: hidden fields; Tally, Jotform and Fillout: the field name after ?).",
    "Add it here with a name and when to offer it, and press Open to try it. Your plug-in offers it from version 0.32.0.",
  ],
  link: { label: "How to add your forms", href: "/how-to/plug-in/forms" },
};

const calendarLink = { label: "How to connect a calendar or booking tool", href: "/how-to/requests/calendars" };
const CALENDARS: Addon[] = [
  {
    id: "google-calendar", name: "Google Calendar", group: "calendars", status: "included",
    what: "Every booking request added as an event to a BizPlug requests calendar in your own Google Calendar.",
    needs: ["A Google account whose calendar you use.", "Your plug-in live on test (request your test deploy first)."],
    value: "Booking requests show up in your calendar on the right day and time, where you already plan your day.",
    steps: [
      "Your plug-in must be live on test first: request your test deploy.",
      "Press Connect Google Calendar and sign in with the Google account whose calendar you use. BizPlug gets access to the one calendar it creates, not to your other calendars or events.",
      "A calendar named BizPlug requests appears in your Google Calendar. Each booking request is added there on its day, and at its time for an appointment, with the customer's details and the reference.",
      "Press Add a test event and look for it on today's date.",
      "Each event is a request, marked tentative and not blocking your time: you still confirm it with the customer. " + calendarLimit,
    ],
    link: calendarLink,
  },
];

// Checkout on the business's own payment account (checkout/index.ts, plug-in version 0.9.0). Offered where a request
// carries a firm price. No `value` yet: live payments need BizPlug's approval per business, so the public site does not
// list them.
const CHECKOUT_COMMON = [
  "After a customer sends an order or booking with a price, your plug-in opens a checkout page in your business's name, with the price from your published files. You are the merchant: the money goes to your account, never through BizPlug.",
  "Your plug-in confirms the payment with the provider: on the page the customer returns to, when the customer asks for the status with their reference, and (for Stripe and Dibsy) from the provider's own notifications. You get an email when an order is paid. You still confirm the request itself.",
  "Paid orders are listed under Payments on your plug-in page, where you can refund one in full or in part.",
  "It starts in test mode: no real money. Live payments are switched on per business once BizPlug has approved yours; then connect your live account the same way.",
  "Checkout shows from plug-in version 0.9.0. If your plug-in runs an older version, press Upgrade on your plug-in page.",
];
const STRIPE_CHECKOUT: Addon = {
  id: "stripe-checkout", name: "Stripe checkout", group: "payments", status: "included",
  what: "Customers pay for an order or booking on a Stripe checkout page in your name, on your own Stripe account, right after the request.",
  needs: ["A Stripe account in your business's name."],
  steps: [
    "Press Sign in with Stripe and approve BizPlug in Stripe. Or, in Stripe's test mode, create a restricted key under Developers, API keys with Checkout Sessions: Write, Account: Read and Webhook Endpoints: Write, paste it and press Connect. A key is stored encrypted and not shown again; save the empty field to disconnect.",
    ...CHECKOUT_COMMON,
    "Test it with Stripe's test card 4242 4242 4242 4242, any future date and any CVC.",
  ],
  link: { label: "How checkout works", href: "/how-to/requests/stripe-checkout" },
};
const CHECKOUT_COM: Addon = {
  id: "checkout-com", name: "Checkout.com", group: "payments", status: "included",
  what: "Customers pay for an order or booking on a Checkout.com payment page, on your own Checkout.com account. For businesses Stripe does not serve, such as in Qatar.",
  needs: ["A Checkout.com account in your business's name.", "A sandbox secret key (sk_sbox_) with the Payments scopes, and your processing channel id if your account has one."],
  steps: [
    "In the Checkout.com dashboard, open Developers, Keys, and create a secret key with the Payments scopes. Note your processing channel id (pc_…) and, for a newer account, the prefix of your API address (the part before .api.checkout.com).",
    "Paste them, with your billing country (for example QA), and press Save. The key is stored encrypted and not shown again; save the fields empty to disconnect.",
    "If Stripe is connected too, choose Checkout.com as your payment provider when you add or open the plug-in.",
    ...CHECKOUT_COMMON,
    "Test it with Checkout.com's test card 4242 4242 4242 4242, any future date and CVC 100.",
  ],
  link: { label: "How checkout works", href: "/how-to/requests/stripe-checkout" },
};

const DIBSY: Addon = {
  id: "dibsy", name: "Dibsy", group: "payments", status: "included",
  what: "Customers pay for an order or booking on a Dibsy payment page, on your own Dibsy account. For businesses in Qatar, with prices in Qatari riyals.",
  needs: ["A Dibsy account in your business's name.", "A test secret key (sk_test_) from your Dibsy dashboard."],
  steps: [
    "In your Dibsy dashboard, find your API keys and copy the test secret key (it starts with sk_test_).",
    "Paste it and press Save. The key is stored encrypted and not shown again; save the field empty to disconnect.",
    "If Stripe or Checkout.com is connected too, choose Dibsy as your payment provider when you add or open the plug-in.",
    ...CHECKOUT_COMMON,
    "Keep your published prices in Qatari riyals (QAR), and ask Dibsy before using another currency.",
  ],
  link: { label: "How checkout works", href: "/how-to/requests/stripe-checkout" },
};

// Customer sign-in with the business's own Clerk application (customer-sign-in.ts, plug-in version 0.16.0).
const CLERK_SIGN_IN: Addon = {
  id: "clerk-sign-in", name: "Clerk sign-in", group: "access", status: "included",
  what: "Only your own customers or members can use your plug-in: ChatGPT or Claude asks them to sign in with your Clerk application first.",
  value: "Keep a plug-in for your members or existing customers only, with the sign-in you already run on Clerk.",
  needs: ["A Clerk application of your own (clerk.com), with the customers or members who may use the plug-in as its users.", "Your plug-in live on test, on version 0.16.0 or later."],
  steps: [
    "In the Clerk Dashboard, open your application and the instance your customers sign in to: Production for real customers, Development to try it first.",
    "Open Agents, then MCP servers, and press Add MCP server. Enter your plug-in's test address and press Add server; do the same for its production address. Both addresses are shown on this panel. Tick Allow public clients to connect, so ChatGPT and Claude can register themselves.",
    "Open API keys and copy the publishable key (pk_…). That is enough: sign-ins are checked with your instance's public keys and nothing secret is stored. Copy the secret key (sk_…) of the same instance too only if you switched Clerk to opaque access tokens.",
    "Paste the key (or both keys) here and press Save. BizPlug checks them with Clerk before saving. A secret key is stored encrypted and not shown again; save both fields empty to switch sign-in off.",
    "Press Check sign-in. It checks your Clerk instance, your keys and your plug-in's version, and says what is still missing. It sends nothing to anyone.",
    "Add your plug-in again in ChatGPT or Claude (remove the old connector first): it now opens your Clerk sign-in page. Sign in with a user of your application, and the plug-in answers as before.",
    "From the moment you save, your plug-in answers only signed-in customers, on test and in production. Customers who added it before must add it again and sign in.",
    "BizPlug checks each customer's sign-in with your Clerk application on every request. It keeps none of their account details, and requests reach you as before. Who may sign in is up to you, in Clerk.",
  ],
  link: { label: "Set up customer sign-in", href: "/how-to/plug-in/customer-sign-in" },
};

/** The add-ons with their own how-to page, for src/lib/how-to.ts: the pages are written from the same steps. */
// Password sign-in (password-sign-in.ts, plug-in version 0.24.0): BizPlug signs customers in from the business's own list.
const PASSWORD_SIGN_IN: Addon = {
  id: "password-sign-in", name: "Password sign-in", group: "access", status: "included",
  what: "Parts of your plug-in that only the people on your list can use, after they sign in with an email and password you give them.",
  value: "Keep member prices, a member directory or request status for the people you choose, without running a sign-in system of your own.",
  needs: ["The email address of each person who may use the restricted parts, and a password for each.", "Your plug-in on version 0.24.0 or later."],
  steps: [
    "Under Restricted parts, tick what only signed-in people may use, and press Save. Everything you leave unticked stays open to anyone.",
    "Add the people: an email address and a password each, one by one (Generate makes a strong password), or as a CSV file with the columns email and password.",
    "Give each person their email and password yourself. BizPlug stores only a one-way hash of each password and never shows it again.",
    "Try it: in ChatGPT or Claude, use a restricted part. A BizPlug sign-in page with your business's name opens; sign in with an email and password from your list.",
    "To end someone's access, remove them or give them a new password. Their sign-in stops working at once.",
  ],
  link: { label: "How password sign-in works", href: "/how-to/plug-in/password-sign-in" },
};

// Direct offers by the Vacation Rental Protocol (plug-in 0.46.0, vrp.ts): booked by the night only.
const DIRECT_OFFERS: Addon = {
  id: "vrp", name: "Vacation Rental Protocol", group: "website", status: "included",
  what: "Your plug-in asks your own website for the exact price of the dates a guest gives, with your terms and your booking link, and the guest books and pays on your site.",
  needs: ["A website on your own domain that publishes signed offers by the Vacation Rental Protocol (vacationrentalprotocol.com), set up by your booking software or your developer."],
  steps: [
    "Enter your website's domain, for example villa-example.se, and press Check and save. BizPlug asks your site for a real offer for sample dates (two nights, two guests, about six weeks ahead) and saves the domain only if the offer checks out: signed with the keys your site publishes, for those exact dates, with a booking link on your own domain. A signed \"not available\" counts too.",
    "Press Check my site at any time to run the same check again. Only the dates and the number of guests are sent to your site.",
    "It applies to your test and live plug-in at once, from plug-in version 0.46.0. From 0.47.0 your card also gets a Price for your dates button. If your plug-in runs an older version, press Upgrade on its Overview tab.",
    "To switch it off, clear the field and save.",
  ],
  link: { label: "How direct offers work", href: "/how-to/plug-in/direct-offers" },
};

// Ticket Tailor (plug-in 0.54.0, ticket-tailor.ts): events plug-ins only, under Event-specific tools (shown only there).
// Humanitix (plug-in 0.56.0, humanitix.ts): events plug-ins only, under Event-specific tools.
// 0.58.0 (registration-self-service.ts): attendees open and correct their own registration from the card.
const MY_REGISTRATION: Addon = {
  id: "my-registration", name: "My registration", group: "ticketing", status: "included",
  what: "Attendees open their own registration from your card with a code sent to their email, and correct their name, email or phone. You are told of every change.",
  needs: ["Ticket Tailor or Humanitix connected here."],
  steps: [
    "Connect Ticket Tailor or Humanitix first (the tiles next to this one).",
    "Switch My registration on. From plug-in version 0.58.0 your card offers it; if your plug-in runs an older version, press Upgrade on its Overview tab.",
    "An attendee types the email they registered with and gets a 6-digit code there. Nothing is shown before the right code, and the card answers the same way whether or not the email has a registration.",
    "They then see only their own tickets and can change the name, email or phone. Humanitix transfers the ticket and emails it; Ticket Tailor changes the order's buyer details when they bought it, and anything else comes to you as a request.",
    "Every change and request reaches you through your requests inbox and the other channels you set up here.",
  ],
  link: { label: "How My registration works", href: "/how-to/plug-in/my-registration" },
};

// 0.59.0 (linkedin-apify.ts): attendees' LinkedIn profiles, looked up on the business's own Apify account.
const LINKEDIN_APIFY: Addon = {
  id: "linkedin-apify", name: "LinkedIn profiles (Apify)", group: "ticketing", status: "included",
  what: "Attendees can add their LinkedIn address in My registration. When they agree, their public profile (headline, location, about, experience, education, skills) is looked up on your own Apify account and sent to your CRM and inbox, tagged with the event and the date and time.",
  needs: ["My registration switched on.", "An Apify account and its API token (Settings > API & Integrations). Apify charges you about $4 per 1,000 profiles."],
  steps: [
    "In Apify, open Settings > API & Integrations and copy your API token (it starts with apify_api_).",
    "Paste it here and press Check and save. BizPlug checks it with Apify and saves it, encrypted. It is never shown again.",
    "From plug-in version 0.59.0, My registration offers a LinkedIn address field and a box the attendee ticks to agree. Nothing is looked up without the tick.",
    "Each profile goes to your channels under Integrations: with Twenty CRM connected, onto the person and in a note; otherwise to your requests inbox. BizPlug keeps none of it.",
    "To disconnect, clear the field and save, then revoke the token in Apify.",
  ],
  link: { label: "How My registration works", href: "/how-to/plug-in/my-registration" },
};

const HUMANITIX: Addon = {
  id: "humanitix", name: "Humanitix", group: "ticketing", status: "included",
  what: "Your plug-in shows your upcoming Humanitix events and tickets with your page to buy them, and your Registrations page lists your tickets, where you can check people in and correct an attendee.",
  needs: ["A Humanitix account, and an API key made in its console under Account > Advanced > API keys (account owners only), with Events, Orders and Tickets read, and Check in tickets and Transfer tickets allowed."],
  steps: [
    "In the Humanitix console, open Account > Advanced > API keys and create a named key. Give it read access to events, orders and tickets, and allow Check in tickets and Transfer tickets. Copy the key (it starts with hx_live_).",
    "Paste it here and press Check and save. BizPlug asks Humanitix for your events with it and saves it, encrypted, only if Humanitix accepts it. It is never shown again.",
    "Your plug-in then shows your published, public, upcoming events and ticket types with your Humanitix page to buy them, from plug-in version 0.56.0; if your plug-in runs an older version, press Upgrade on its Overview tab.",
    "Open Registrations to see your tickets per event, check people in or out, and correct an attendee (Humanitix transfers the ticket and emails it). Creating events, changing tickets and refunds stay in Humanitix.",
    "To disconnect, clear the field and save, then revoke the key in Humanitix.",
  ],
  link: { label: "How Humanitix works with your plug-in", href: "/how-to/plug-in/humanitix" },
};

const TICKET_TAILOR: Addon = {
  id: "ticket-tailor", name: "Ticket Tailor", group: "ticketing", status: "included",
  what: "Your plug-in shows your upcoming Ticket Tailor events and tickets with your page to buy them, and your Registrations page lists who registered, where you can correct details, check people in and void tickets.",
  needs: ["A Ticket Tailor box office, and an API key made in it under Settings > API. To use Registrations, give the key access to orders, issued tickets and check-ins, and to customer data to search by name or email."],
  steps: [
    "In Ticket Tailor, open Settings > API and create an API key. Ticket Tailor shows it once: copy it.",
    "Paste it here and press Check and save. BizPlug asks Ticket Tailor for your events with it and saves it, encrypted, only if Ticket Tailor accepts it. It is never shown again, here or anywhere.",
    "Your plug-in then answers questions about your upcoming published events: dates, ticket types, prices, whether they are on sale and what is left when you show that to buyers, with your Ticket Tailor page to buy them. Tickets are bought and paid for on Ticket Tailor. This works on test and production at once, from plug-in version 0.54.0; if your plug-in runs an older version, press Upgrade on its Overview tab.",
    "Open Registrations (the link below the key) to see who registered for each event, search them, correct a buyer's details, check people in or out, and void a ticket. Each page asks Ticket Tailor live; BizPlug keeps none of it.",
    "To disconnect, clear the field and save, then delete the key in Ticket Tailor.",
  ],
  link: { label: "How Ticket Tailor works with your plug-in", href: "/how-to/plug-in/ticket-tailor" },
};

export const GUIDED_ADDONS = { passwordSignIn: PASSWORD_SIGN_IN, clerkSignIn: CLERK_SIGN_IN, stripeCheckout: STRIPE_CHECKOUT, checkoutCom: CHECKOUT_COM, dibsy: DIBSY, slack: SLACK, whatsapp: WHATSAPP, whatsappReady: WHATSAPP_READY, msg2aiAssistant: MSG2AI_ASSISTANT, googleCalendar: CALENDARS[0], teams: TEAMS, hubspot: HUBSPOT, twenty: TWENTY, notion: NOTION, trello: TRELLO, airtable: AIRTABLE, calendarLimit };

/** The add-ons offered for a plug-in, by what its engine does. */
export function addonsFor(engine: Engine, span?: Span, show?: boolean): Addon[] {
  // Slack, the WhatsApp button and the msg2ai assistant's number and join code are set up by the client alone. Ordering and booking on WhatsApp (msg2ai) already
  // runs for pickup orders and room nights; for other plug-in types it needs building.
  const concierge = engine === "order" || (engine === "stay" && span === "nights") ? WHATSAPP_READY : MSG2AI_ASSISTANT;
  // Checkout where a request carries a firm price: an order, a booked service, or a stay (stripe-checkout.ts).
  const checkout = engine === "order" || engine === "appt" || engine === "stay" ? [STRIPE_CHECKOUT, CHECKOUT_COM, DIBSY] : [];
  const direct = engine === "stay" && span === "nights" ? [DIRECT_OFFERS] : [];
  // Events (industry-functions.ts \`show\`): their own Ticket Tailor box office.
  const ticketing = show ? [TICKET_TAILOR, HUMANITIX, MY_REGISTRATION, LINKEDIN_APIFY] : [];
  const base = [...ALWAYS, SLACK, TEAMS, HUBSPOT, TWENTY, NOTION, TRELLO, AIRTABLE, WHATSAPP, concierge, ...direct, ...ticketing, FORMS, ...checkout, ...LINK_ADDONS, PASSWORD_SIGN_IN, CLERK_SIGN_IN];
  return engine === "appt" || engine === "stay" ? [...base, ...CALENDARS] : base;
}

export const addonGroups = (list: Addon[]) => (Object.keys(ADDON_GROUP_LABEL) as AddonGroup[]).map((g) => ({ group: g, label: ADDON_GROUP_LABEL[g], addons: list.filter((a) => a.group === g) })).filter((g) => g.addons.length);

/** Every add-on that is part of the plan and set up by the client alone, once each, for the public site. */
export function includedAddons(): Addon[] {
  const seen = new Map<string, Addon>();
  for (const a of [...addonsFor("order"), ...addonsFor("appt")]) if (a.status === "included" && a.value && !seen.has(a.id)) seen.set(a.id, a);
  return [...seen.values()];
}

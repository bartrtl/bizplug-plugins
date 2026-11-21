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
  /** A required file that is not needed when one of these is given instead (a show needs no venue inventory). */
  unless?: string[];
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
const businessDataset = (name: string, ex?: IndustryExample, software = false, orders = false): Dataset => ({
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
    col("tagline", "What you are", false, "text", `${name} in Charlotte`, "A few words shown after your name in ChatGPT, e.g. \"Harbor Street Studio – Yoga in Charlotte\". Without it, the plug-in's industry is shown."),
    col("logo", "Logo URL", false, "url", "https://example.com/logo.png", "Your own logo as an https image, square if you have one. Shown next to your plug-in in the BizPlug portal, and as its icon in ChatGPT."),
    col("wordmark", "Wide logo URL", false, "url", "https://example.com/logo-wide.png", "Optional: your logo with your name, wider than it is tall, as an https PNG, JPEG or WebP image. From plug-in version 0.25.0 it heads your card in ChatGPT and Claude; without it the card shows the logo above."),
    col("address", "Address", false, "text", "123 Main St, Charlotte, NC 28202", "Street address, if customers visit."),
    col("city", "City", false, "text", "Charlotte", ""),
    col("region", "State or country", false, "text", "NC", ""),
    col("hours", "Opening hours", false, "text", "Mon-Fri 09:00-17:00; Sat 10:00-14:00", "As shown to customers."),
    col("currency", "Currency", false, "text", "USD", "ISO code for the prices in the other files."),
    // Order plug-ins (0.37.0): the fee a delivery order carries.
    ...(orders ? [col("delivery_fee", "Delivery fee", false, "number", "5", "Number only, in your currency. Added to every delivery order and its checkout; pickup orders never carry it. Leave empty if delivery is free or you price it yourself.")] : []),
    col("notify_email", "Requests go to", false, "email", "orders@example.com", "The team inbox that should receive requests from ChatGPT (not shown to customers)."),
    // Software products (plug-in 0.15.0): the product's own pages, for Pricing, Help & guides, Support and Contact.
    ...(software
      ? [
          col("pricing_url", "Pricing page", false, "url", "https://example.com/pricing", "Where your plans and prices are. Pricing links here; a plug-in listed in ChatGPT's directory only links here."),
          col("support_url", "Support page", false, "url", "https://example.com/support", "Your help centre or support contact page."),
          col("docs_url", "Documentation", false, "url", "https://docs.example.com", "Where your help articles and guides live."),
          col("status_url", "Status page", false, "url", "https://status.example.com", "Your service status page, if you have one."),
        ]
      : []),
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

// Software products (`software` in industry-functions.ts), from plug-in version 0.15.0: what the product does, its
// plans and its help articles, for Features, Pricing and Help & guides (software.ts).
const featuresDataset: Dataset = {
  id: "features",
  file: "features.csv",
  title: "Features",
  why: "What the product does, so people can find the feature they need, the plan it is on and the guide that explains it.",
  required: false,
  maxRows: 200,
  columns: [
    col("name", "Feature", true, "text", "CRM sync", "A short name, as on your website."),
    col("description", "What it does", false, "text", "Sends contacts and notes to Salesforce, HubSpot and Pipedrive.", "One or two sentences."),
    col("plan", "Plan", false, "text", "Team", "The plan that includes it, if not every plan does."),
    col("guide_url", "Guide", false, "url", "https://docs.example.com/crm-sync", "The help article that explains it."),
  ],
  collect: [
    "Take the features from the product's features or product page, one per row, in the product's own words.",
    "Put the plan only where a feature is limited to some plans.",
  ],
};
const plansDataset: Dataset = {
  id: "plans",
  file: "plans.csv",
  title: "Plans and prices",
  why: "What Pricing shows. A plug-in listed in ChatGPT's directory shows none of it and links to the pricing page instead.",
  required: false,
  maxRows: 20,
  columns: [
    col("name", "Plan", true, "text", "Team", "As on the pricing page."),
    col("price", "Price", false, "text", "$99", "As written on the pricing page, with the currency."),
    col("billing", "Billing", false, "text", "per month", "per month, per year, one-time, or custom."),
    col("includes", "Includes", false, "text", "Up to 10 members, CRM sync", "The main things the plan includes."),
  ],
  collect: ["Copy the plans exactly from the current pricing page; leave out discounts that end soon."],
};
const guidesDataset: Dataset = {
  id: "guides",
  file: "guides.csv",
  title: "Help articles and guides",
  why: "What Help & guides searches and links to.",
  required: false,
  maxRows: 300,
  columns: [
    col("title", "Title", true, "text", "Connect your CRM", "The article's title."),
    col("url", "Link", true, "url", "https://docs.example.com/connect-crm", "The article's own address."),
    col("topic", "Topic", false, "text", "Integrations", "A short label people can filter by."),
    col("summary", "Summary", false, "text", "Connect Salesforce or HubSpot in three steps.", "One sentence."),
  ],
  collect: ["List the articles from the help centre or documentation: title, link and topic. Public articles only."],
};

// Events (`show` in industry-functions.ts), from plug-in version 0.18.0: a show or conference's own programme, for the
// event guide (event-guide.ts). With any of these the plug-in is an event guide and needs no venue inventory.
const SHOW_FILES = ["sessions", "speakers", "exhibitors", "sponsors"];
const sessionsDataset: Dataset = {
  id: "sessions",
  file: "sessions.csv",
  title: "Agenda",
  why: "The sessions of the show or conference, for Agenda.",
  required: false,
  maxRows: 1000,
  columns: [
    col("date", "Date", true, "date", "2026-09-01", "YYYY-MM-DD."),
    col("start", "Starts", false, "time", "09:00", "24-hour HH:MM, local time."),
    col("end", "Ends", false, "time", "09:50", "24-hour HH:MM."),
    col("title", "Session", true, "text", "Opening keynote", "The session's title, as published."),
    col("format", "Format", false, "text", "Panel", "Keynote, panel, workshop, break…"),
    col("speakers", "Speakers", false, "text", "Jane Doe; John Smith", "The speakers' names, separated by semicolons, as in speakers.csv."),
    col("stage", "Where", false, "text", "Main stage", "Stage, hall or room."),
    col("description", "About", false, "text", "What the session covers.", "One or two sentences."),
  ],
  collect: ["Copy the agenda from the event's own programme page: one row per session, with its date, times, title and speakers."],
};
const speakersDataset: Dataset = {
  id: "speakers",
  file: "speakers.csv",
  title: "Speakers",
  why: "The speakers, for Speakers.",
  required: false,
  maxRows: 1000,
  columns: [
    col("name", "Name", true, "text", "Jane Doe", "As the event lists the speaker."),
    col("title", "Title", false, "text", "Chief Executive Officer", "Job title."),
    col("company", "Company", false, "text", "Example Events", "Organisation."),
    col("bio", "Bio", false, "text", "Twenty years in live events.", "The bio the event published."),
    col("linkedin", "LinkedIn", false, "url", "https://www.linkedin.com/in/janedoe", "Public profile, if the event links to it."),
  ],
  collect: ["Take each speaker from the event's own speakers page: name, title, company and the bio published there. Nothing the event does not publish."],
};
const exhibitorsDataset: Dataset = {
  id: "exhibitors",
  file: "exhibitors.csv",
  title: "Exhibitors",
  why: "The exhibitors, for Exhibitors & sponsors. People contact an exhibitor directly with these details.",
  required: false,
  maxRows: 2000,
  columns: [
    col("name", "Exhibitor", true, "text", "Northside Staging", "The company, as it trades."),
    col("category", "Category", false, "text", "Stands & staging", "A short label people can filter by."),
    col("description", "What it does", false, "text", "Stage and stand builds for exhibitions.", "One sentence."),
    col("website", "Website", false, "url", "https://example.com", "Full URL."),
    col("email", "General email", false, "email", "hello@example.com", "The company's general mailbox, never a named person's."),
    col("phone", "General phone", false, "text", "+974 4000 0000", "The company's switchboard, with country code."),
    col("city", "City", false, "text", "Doha", "Where the company is based."),
    col("stand", "Stand", false, "text", "B12", "Stand or booth number, if published."),
    col("logo", "Logo URL", false, "url", "https://example.com/logo.png", "The company's logo as an https PNG, JPEG or WebP image (not SVG), shown from plug-in version 0.28.0."),
    col("about", "About", false, "text", "Stage and stand builder working across the Gulf since 2012.", "Two to four sentences from the company's own website, shown under More about."),
    col("highlights", "Highlights", false, "text", "Custom stands; Modular systems; LED walls", "Main products or services, separated by semicolons."),
    col("linkedin", "LinkedIn", false, "url", "https://www.linkedin.com/company/example", "The company's page on LinkedIn."),
    col("sources", "Sources", false, "text", "https://example.com/about", "The company's own pages these details come from, separated by semicolons."),
  ],
  collect: [
    "Take the exhibitors from the event's own exhibitor list, with what the event or the exhibitor publishes about each.",
    "Company-level contact details only: a general mailbox and a switchboard number. Never a named person's private email or mobile number.",
  ],
};
const sponsorsDataset: Dataset = {
  id: "sponsors",
  file: "sponsors.csv",
  title: "Sponsors and partners",
  why: "The sponsors and partners, for Exhibitors & sponsors.",
  required: false,
  maxRows: 500,
  columns: [
    col("name", "Sponsor", true, "text", "Example Bank", "As the event lists it."),
    col("group", "Group", false, "text", "Gold sponsors", "The event's own grouping."),
    col("role", "Role", false, "text", "Official banking partner", "As published."),
    col("description", "About", false, "text", "", "One sentence."),
    col("website", "Website", false, "url", "https://example.com", "Full URL."),
    col("logo", "Logo URL", false, "url", "https://example.com/logo.png", "The company's logo as an https PNG, JPEG or WebP image (not SVG), shown from plug-in version 0.28.0."),
    col("about", "About", false, "text", "Regional bank serving businesses and households.", "Two to four sentences from the company's own website, shown under More about."),
    col("highlights", "Highlights", false, "text", "Business banking; Trade finance", "Main products or services, separated by semicolons."),
    col("linkedin", "LinkedIn", false, "url", "https://www.linkedin.com/company/example", "The company's page on LinkedIn."),
    col("sources", "Sources", false, "text", "https://example.com/about", "The company's own pages these details come from, separated by semicolons."),
  ],
  collect: ["Copy the sponsors and partners from the event's own sponsors page, in its own groups."],
};

/** The required files not accepted yet. A required file with `unless` is not needed when one of those files is. */
export function missingRequired(spec: PluginDataSpec, accepted: (id: string) => boolean): Dataset[] {
  return spec.datasets.filter((d) => d.required && !accepted(d.id) && !(d.unless ?? []).some(accepted));
}

// Coworking and chambers (`members` in industry-functions.ts): the member businesses find_members searches, from
// plug-in version 0.12.0. Company-level details of members that agreed to be listed; never a named person's.
const membersDataset: Dataset = {
  id: "members",
  file: "members.csv",
  title: "Member businesses",
  why: "The member businesses people can find in the plug-in and contact directly. List only members that agreed to be listed.",
  required: false,
  maxRows: 500,
  columns: [
    col("name", "Member business", true, "text", "Northside Design Studio", "The company's name, as it trades."),
    col("industry", "Industry", false, "text", "Design", "A short label people can filter by. Use the same label for similar members."),
    col("description", "What it does", false, "text", "Brand and web design for small businesses.", "One sentence."),
    col("location", "Site or floor", false, "text", "2nd floor", "Which site or floor, when there is more than one."),
    col("website", "Website", false, "url", "https://example.com", "Full URL of the company's website."),
    col("email", "General email", false, "email", "hello@example.com", "The company's general mailbox, never a named person's private address."),
    col("phone", "General phone", false, "text", "+1 704 555 0142", "The company's switchboard, with country code. Never a personal mobile number."),
    col("looking_for", "Looking for", false, "text", "Developers to partner with on client websites", "What the member wants to collaborate on or is looking for."),
    col("offers", "Offers", false, "text", "A free 30-minute brand review for other members", "What the member can offer other members or visitors."),
    col("level", "Membership level", false, "text", "Corporate", "The member's level or tier as you name it, shown as a badge from plug-in version 0.25.0."),
    col("about", "About", false, "text", "Brand and web design studio working with small businesses since 2015.", "Two to four sentences from the member's own website, shown under More about from plug-in version 0.26.0."),
    col("highlights", "Highlights", false, "text", "Brand identity; Websites; Packaging", "A few main services or programmes, separated by semicolons."),
    col("address", "Address", false, "text", "Tornado Tower, West Bay, Doha", "The member's office address, as it publishes it."),
    col("linkedin", "LinkedIn", false, "url", "https://www.linkedin.com/company/example", "The member's company page on LinkedIn."),
    col("sources", "Sources", false, "text", "https://example.com/about", "The member's own pages these details come from, separated by semicolons."),
    col("logo", "Logo URL", false, "url", "https://example.com/logo.png", "The member's own logo as an https PNG, JPEG or WebP image (not SVG). Shown next to its name in the card from plug-in version 0.25.0; without one the card shows its initials."),
  ],
  collect: [
    "List only member businesses that agreed to be listed in the plug-in. Ask each one first, and leave out any that did not answer.",
    "Take each member's details from the member itself or its own website: one sentence on what it does, what it is looking for and what it offers, in its own words.",
    "A logo is optional: the image address of the logo on the member's own website, a PNG, JPEG or WebP file.",
    "Company-level contact details only: a general mailbox and a switchboard number. Never a named person's private email, mobile number or home address; leave the cell empty instead.",
    "People contact a member directly with these details. Neither the business nor BizPlug introduces or forwards, so publish only what the member is happy to be contacted on.",
  ],
};

// A chamber's members are spread over a city or region: the location column is where the member is based.
const chamberMembersDataset: Dataset = {
  ...membersDataset,
  columns: membersDataset.columns.map((c) =>
    c.key === "location" ? col("location", "City or area", false, "text", "South End, Charlotte", "Where the member is based, so people can filter by area.")
    : c.key === "offers" ? col("offers", "Offers", false, "text", "A discount on brand reviews for fellow members", "What the member can offer other members or visitors.")
    : c),
};

// Chambers (`infoFirst` in industry-functions.ts), plug-in version 0.25.0 (`showcase`): committees, news and events,
// and the newsletter, each on its own card screen. Only what the chamber publishes on its own site.
const committeesDataset: Dataset = {
  id: "committees",
  file: "committees.csv",
  title: "Committees",
  why: "The committees and working groups members can join, shown under Committees in the plug-in.",
  required: false,
  maxRows: 60,
  columns: [
    col("name", "Committee", true, "text", "Hospitality and Tourism Committee", "As the chamber names it."),
    col("description", "What it works on", false, "text", "Initiatives and discussions on tourism as a growth sector.", "One to three sentences, in the chamber's own words."),
    col("chair", "Chair", false, "text", "Jane Doe, Example Hotel", "Who chairs it, only as the chamber publishes it."),
    col("url", "Page", false, "url", "https://example.org/committees", "The committee's page, or the page that describes it."),
  ],
  collect: [
    "Take the committees from the chamber's own site: its committees page, or where its events and news name them.",
    "Name a chair only when the chamber publishes who it is.",
  ],
};
const newsDataset: Dataset = {
  id: "news",
  file: "news.csv",
  title: "News and events",
  why: "The latest news and the upcoming and recent events, shown under News & events in the plug-in.",
  required: false,
  maxRows: 60,
  columns: [
    col("title", "Title", true, "text", "Annual Evening of Giving Thanks", ""),
    col("kind", "News or event", false, "text", "event", "\"news\" or \"event\". An event dated before today shows as a past event."),
    col("date", "Date", false, "text", "2026-11-20", "YYYY-MM-DD, or YYYY-MM when only the month is published."),
    col("location", "Where", false, "text", "Four Seasons Hotel, Doha", "For an event."),
    col("summary", "Summary", false, "text", "Members, sponsors and partners came together to give thanks.", "One or two sentences."),
    col("url", "Page", false, "url", "https://example.org/events", "Where to read more or register."),
  ],
  collect: ["Take news and events from the chamber's own site, newest first. Keep upcoming events current: replace the file when the calendar changes."],
};
const newsletterDataset: Dataset = {
  id: "newsletter",
  file: "newsletter.csv",
  title: "Newsletter",
  why: "The newsletter and where to subscribe, shown under News & events in the plug-in.",
  required: false,
  single: true,
  maxRows: 1,
  columns: [
    col("name", "Newsletter", true, "text", "Chamber newsletter", "Its name, or a plain description if it has none."),
    col("description", "What it covers", false, "text", "Special offers and opportunities for members.", "In the chamber's own words."),
    col("frequency", "How often", false, "text", "Monthly", "Only when the chamber says so."),
    col("signup_url", "Sign-up page", false, "url", "https://example.org/#newsletter", ""),
    col("archive_url", "Past issues", false, "url", "https://example.org/newsletter", ""),
  ],
  collect: ["Take the newsletter's name, sign-up page and archive from the chamber's own site."],
};

// Every industry, plug-in version 0.30.0 (`socialFeed`, social-feed.ts): Social media on the card. One file for the
// three kinds of row: where to follow the business, the public feeds read automatically, and posts it pins itself.
const socialDataset: Dataset = {
  id: "social",
  file: "social.csv",
  title: "Social media",
  why: "Where to follow you, and your latest posts with their pictures, shown under Social media in the plug-in. Feeds (YouTube, podcast, blog, Substack, Medium, Bluesky, Mastodon) are read automatically; for LinkedIn, Instagram, X, Facebook and TikTok you pin the posts you want shown. From plug-in version 0.35.0 a YouTube video plays inside the card.",
  required: false,
  maxRows: 60,
  columns: [
    col("kind", "Kind", true, "text", "follow", "\"follow\" for a profile to follow, \"feed\" for a public feed BizPlug reads (YouTube channel, podcast or blog RSS, Substack, Medium, Bluesky or Mastodon profile), \"post\" for one post you pin."),
    col("network", "Network", false, "text", "instagram", "instagram, linkedin, facebook, x, tiktok, youtube, threads, bluesky, mastodon, podcast, blog, substack, medium, pinterest or whatsapp. Left empty, it is read from the address."),
    col("url", "Address", true, "url", "https://www.instagram.com/yourbusiness/", "The profile, the feed or the post, as an https address."),
    col("image", "Picture", false, "url", "https://example.com/post.jpg", "For a pinned post: its picture, an https PNG, JPEG or WebP image."),
    col("text", "Text", false, "text", "Our new menu is here.", "For a pinned post: its caption, or the first lines of it."),
    col("date", "Date", false, "text", "2026-11-20", "For a pinned post: YYYY-MM-DD."),
  ],
  collect: [
    "Take the profiles from the links on the business's own website (header or footer).",
    "Add a feed row for a YouTube channel, a podcast or blog RSS, a Substack, Medium, Bluesky or Mastodon profile; its latest posts appear by themselves.",
    "Pin a few recent posts from LinkedIn, Instagram, X, Facebook or TikTok with their own picture and text: only posts the business published.",
    "A pinned post may also be one of the business's own YouTube videos (a watch, youtu.be or Shorts address): it plays inside the card, and needs no picture.",
  ],
};

// Coworking (`visits` in industry-functions.ts): the locations Book a tour and Day pass work from, from plug-in
// version 0.22.0 (visits.ts). Tours run at a location unless it says no; a day pass is sold only where it says yes.
const locationsDataset: Dataset = {
  id: "locations",
  file: "locations.csv",
  title: "Locations, tours and day passes",
  why: "Your locations, with whether you give tours there and when, and whether you sell a day pass there and at what rate. The plug-in offers Book a tour and Day pass only for the locations in this file.",
  required: false,
  maxRows: 50,
  columns: [
    col("name", "Location", true, "text", "Uptown Tower", "The location's name, as customers know it. One row per location."),
    col("address", "Address", false, "text", "200 South Tryon Street, Charlotte, NC", "Street address of this location."),
    col("tours", "Tours", false, "boolean", "yes", "yes or no: whether people can ask for a tour of this location. Empty means yes."),
    col("tour_hours", "Tour hours", false, "text", "Monday to Friday, 09:00 to 16:00", "When tours are given, in your own words. The plug-in shows it as written."),
    col("day_pass", "Day pass", false, "boolean", "yes", "yes or no: whether you sell a day pass at this location. Empty means no."),
    col("day_pass_rate", "Day pass rate", false, "number", "35", "Per person, per day, in the currency of business.csv. Leave empty if you confirm the price yourself."),
    col("day_pass_includes", "Day pass includes", false, "text", "A hot desk from 08:00 to 18:00, Wi-Fi and coffee", "What a day pass includes, in one sentence."),
  ],
  collect: [
    "List each location once, with the name used on the business's own website and its street address.",
    "Ask the owner which locations give tours and when, and write the tour hours as the business states them. Do not guess hours from the opening hours.",
    "Mark a day pass only where the business sells one, with the published rate per person per day and what it includes. Leave the rate empty when the business has not published one: the plug-in then says the business confirms the price.",
    "A request for a tour or a day pass is confirmed by the business; nothing here is a time slot or a paid booking.",
  ],
};

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
            "With a Shopify shop or a Square account, import the list on the plug-in's page in the portal (Or import it from your shop) instead of making the file.",
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
            col("day_rates", "Weekday rates", false, "text", "fri:" + it.rate + ";sat:" + it.rate, "Optional: a different rate on some weekdays, as day:rate separated by semicolons (sun, mon, tue, wed, thu, fri, sat). Shown on the booking calendar from plug-in version 0.29.0."),
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
        {
          id: "rates",
          file: "rates.csv",
          title: "Rates by date",
          why: "Seasons and holidays with their own rate (from plug-in version 0.29.0). A date range here wins over the weekday rates and the standard rate.",
          required: false,
          maxRows: 2000,
          columns: [
            col("id", "Option id", true, "text", it.id, "An id from inventory.csv."),
            col("start", "From", true, "date", "2026-12-20", "YYYY-MM-DD, the first day at this rate."),
            col("end", "To", true, "date", "2027-01-03", "YYYY-MM-DD, the last day at this rate."),
            col("rate", "Rate", true, "number", it.rate, "Per night, day or person, as in inventory.csv."),
          ],
          collect: ["Copy the business's own published seasonal or holiday rates. Only rates customers can see; BizPlug confirms each request with the business."],
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
  coworking: ["In members.csv: a member business that has not agreed to be listed, or a named person's private email, phone number or address. Company-level contact details only."],
  chambers: ["In members.csv: a member business that has not agreed to be listed, or a named person's private email, phone number or address. Company-level contact details only.", "Member-only documents, board papers or anything the chamber does not publish to the public."],
  events: ["In speakers.csv and exhibitors.csv: only what the event itself publishes. Company-level contact details for exhibitors; never a named person's private email, phone number or address."],
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
    datasets: [
      businessDataset(ind.name, ex, Boolean(fn.software), fn.engine === "order"),
      // 0.18.0: a show or conference publishes its programme instead of a venue's spaces.
      ...engineDatasets(fn.engine, fn.noun, ex).map((d) => (fn.show && d.id === "inventory" ? { ...d, unless: SHOW_FILES } : d)),
      servicesDataset(ex),
      faqDataset(ex),
      ...(fn.members ? [industry === "chambers" ? chamberMembersDataset : membersDataset] : []),
      ...(fn.visits ? [locationsDataset] : []),
      ...(fn.infoFirst ? [committeesDataset, newsDataset, newsletterDataset] : []),
      ...(fn.software ? [featuresDataset, plansDataset, guidesDataset] : []),
      ...(fn.show ? [sessionsDataset, speakersDataset, exhibitorsDataset, sponsorsDataset] : []),
      socialDataset,
    ],
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

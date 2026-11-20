<img src="assets/rethink-labs-logo.png" alt="Rethink Labs" width="96" align="right">

# BizPlug plug-ins for ChatGPT

Published by **Bart Cant - Rethink Labs**.

The standard BizPlug plug-in for each of 81 industries. A plug-in is an MCP (Model Context Protocol) server, hosted by BizPlug, that lets a business's customers ask questions and send orders, bookings or requests from inside ChatGPT. The business confirms every request itself. Customers pay the business directly: a Pay online button after a request opens the business's own payment page (Stripe is the official payment provider; PayPal, Square and other payment pages work too), and the money never passes through BizPlug.

This repository holds the plug-in **packages**: what each plug-in is called, what its tools do, where its server lives and what data a business provides to get its own copy. It is generated from the BizPlug website's data files on every release, so please do not edit it by hand. It also holds the source files those packages are generated from (see below). The server that answers the tools and all business data are not part of this repository.

- Website: https://bizplug.ai
- Every plug-in on one page: https://bizplug.ai/plugins
- Contact: info@bizplug.ai
- Set up, configure and test a plug-in: [SETUP.md](SETUP.md)
- Submit your own plug-in to the marketplace: [CONTRIBUTING.md](CONTRIBUTING.md)
- Card themes, and how to propose one: [THEMES.md](THEMES.md)

## What is in a package

```
plugins/<industry>/
  README.md                    what the plug-in does, its tools and what changed in each version
  plugin.json                  name, description, starter prompts and review test cases
  mcp.json                     the plug-in's MCP server URL (streamable HTTP, no sign-in)
  data/requirements.json       the datasets a business provides, column by column
  data/templates/*.csv         a CSV template per dataset, with an example row
  data/AGENT_INSTRUCTIONS.md   how a person or an AI agent collects and submits that data
```

Every plug-in has the same six tools: a menu (`show_menu`), a look-up, a request, a status check, `get_business_info` and `get_contact`. The look-up, request and status tools are named for the industry, for example `get_menu`, `place_pickup_order` and `get_order_status` for Coffee Shops & Cafes. Chambers of Commerce & Business Associations, Coworking & Offices have one more, `find_members`, which finds the member businesses a business has published; a person contacts a member directly. Coworking & Offices also has `get_visit_options`, `book_tour` and `request_day_pass`, for tours and day passes at the locations a business has published; the business confirms each one.

## Source

`source/` holds the files the packages are generated from, copied from the BizPlug website. They are here to be read: they import website files that are not published, so they do not build on their own.

```
source/
  plugins.ts                   each plug-in's name, description, tools, menu and test cases
  industry-functions.ts        the main function and tool names of each industry
  plugin-data.ts               the datasets and columns a business provides, and the agent instructions
  plugin-examples.ts           the example rows used in the CSV templates
  plugin-addons.ts             what a plug-in can be bundled with, and the status of each
  plugin-versions.ts           every plug-in version and what changed in it
  widgets/plugin-widget.ts     the card a plug-in shows in ChatGPT
  card-themes.ts               the card's colour themes a business can pick, and their checks
```

## Try a plug-in in ChatGPT

1. In ChatGPT, open Settings, then Apps & Connectors, and turn on developer mode.
2. Create a connector with a plug-in's MCP server URL from the tables below (no sign-in needed).
3. Start a new chat, pick the connector and ask "What can this plug-in do?"

An industry URL serves every business in that industry, so the assistant asks which business you mean. A business with its own plug-in has its own URL: `https://mcp.bizplug.ai/plugin/coffee-shops/<business>`.

## Get a plug-in for your business

Sign up at https://bizplug.ai/portal, pick your industry and provide the data its package lists, by uploading the CSV files or through the data API. BizPlug publishes the plug-in to a test address first and to production when you ask. The plug-in is $24.99 a month or $199 a year, for businesses in any country; plan details are confirmed with you before any payment.

## Submit a plug-in

Plug-ins from other companies can be listed in the BizPlug marketplace next to the industry plug-ins. Do not open a pull request here: this repository is generated, so submit through https://bizplug.ai/marketplace#submit. [CONTRIBUTING.md](CONTRIBUTING.md) explains the process and the components a valid plug-in must have: an MCP server over streamable HTTP, `plugin.json`, `mcp.json`, a README, review test cases, and a privacy policy and terms.

## Version 0.25.0

All 81 plug-ins share one version. What changed in each:

- **0.25.0** (20 November 2026): Showcase: the business's logo on its card, member logos, and committees, the newsletter, and news and events on their own screens.
- **0.24.0** (20 November 2026): Password sign-in: parts of a plug-in that only the people on the business's own list can use, after they sign in with an email and password.
- **0.23.0** (20 November 2026): The card also shows in Claude: the menu, the forms and the results are drawn there as they are in ChatGPT.
- **0.22.0** (20 November 2026): Coworking & Offices: Book a tour and Day pass at the business's own locations, continued with the business's WhatsApp assistant when it has one.
- **0.21.0** (20 November 2026): Card banner: a business's own wide picture at the top of its card's menu. Member messages: on a member list, the card drafts a first message to a member, sent from the person's own email or WhatsApp.
- **0.20.0** (19 November 2026): Send from the account menu: a record's screen can open the customer's own mail app or WhatsApp with a text from it filled in, such as a follow-up draft.
- **0.19.0** (19 November 2026): Account menu: the account tools of a business's own server get buttons in the card, with a form or a list for each, so signed-in customers tap instead of typing.
- **0.18.0** (19 November 2026): Event guide: an Events & Conferences plug-in for a show or conference answers with its agenda, speakers, exhibitors and sponsors, and sends exhibiting, sponsoring and visiting enquiries.
- **0.17.0** (19 November 2026): Account tools: a business that runs its own MCP server can offer its tools in its plug-in, so signed-in customers work in their own account from ChatGPT.
- **0.16.0** (19 November 2026): Customer sign-in with Clerk: a business that runs its own Clerk application can make its plug-in answer only its signed-in customers or members.
- **0.15.0** (18 November 2026): Software & SaaS plug-ins get a menu made for software (Features, Pricing, Help & guides, Support, Book a demo), and every business's plug-in describes only the business to ChatGPT.
- **0.14.0** (18 November 2026): A business's plug-in shows its full name in ChatGPT, the business's name with what it is, and its own logo as the plug-in's icon.
- **0.13.0** (18 November 2026): A pay step in the card after a request with checkout: the total, a Pay now button to the business's own checkout page, and an I've paid button that checks the payment.
- **0.12.0** (17 November 2026): Coworking & Offices: a business can publish its member businesses, so people can find a member by name, kind of business or what they need or offer, and contact it directly.
- **0.11.0** (17 November 2026): Every tool states whether it only reads, whether its action can be taken back and whether it reaches outside the business's own data, as ChatGPT's plug-in directory requires.
- **0.10.0** (17 November 2026): The plug-in introduces itself to ChatGPT and other clients with a description and a website, and BizPlug's industry-wide plug-ins with the BizPlug logo, privacy policy, terms and support contact.
- **0.9.0** (16 November 2026): Checkout on the business's own Stripe or Checkout.com account, when it has connected one: customers pay for an order or booking right after the request, and the status check asks the provider whether it was paid.
- **0.8.0** (16 November 2026): Clear answers on how to pay: the business's own payment page when it has one, offered whenever a customer asks, and payment never taken in the chat.
- **0.7.0** (16 November 2026): The business's own buttons (WhatsApp, booking, directions, reviews, social media) on the menu card and next to availability, with presses counted for the business.
- **0.6.0** (16 November 2026): Buttons to the business's own pages, when it has saved them in the portal: a payment page after a sent request, and its booking page, directions and review page with its contact details.
- **0.5.0** (16 November 2026): A WhatsApp button to the business's own number, with its contact details and after a sent request, when the business has saved its number in the portal.
- **0.4.0** (16 November 2026): Browsing by tapping in the card: quick options on each form, search and category filters on a list, an item or option on its own screen with Back, the business's published questions and answers, and choosing the business on an industry-wide plug-in.
- **0.3.0** (16 November 2026): Results show inside the card (prices, availability, open times, estimates and statuses), and a request can be sent straight from a result.
- **0.2.0** (16 November 2026): A menu card in ChatGPT, with a button and a short form for each thing a customer can do.
- **0.1.0** (15 November 2026): The plug-in's tools for the industry, answers from the business's own information, and a text menu of what it can do.

A business's own plug-in stays on the version it was published with until the business upgrades it.

## Plug-ins on the platform

The plug-ins BizPlug serves besides the industry plug-ins, newest first, as on https://bizplug.ai/plugins. The startup directories have their package in `plugins/`; the others are built from a business's own profile. Names belong to their owners and show whose published information a plug-in is built on; BizPlug is not affiliated with or endorsed by them, except Rethink Labs, the company behind BizPlug. Businesses that list their own plug-in from the portal are on the website only.

| Plug-in | Kind | Added | What it does | MCP server URL |
| --- | --- | --- | --- | --- |
| Rethink Labs | Rethink Labs | 2026-11-18 | AI and blockchain consulting for businesses. Ask about the services and book an AI discovery call. | `https://mcp.bizplug.ai/plugin/consulting/rethink-labs` |
| msg2ai | Rethink Labs | 2026-11-18 | AI messaging for hotels, vacation rentals and events: AI Ambassador, ChatGPT apps and WhatsApp concierges. | `https://mcp.bizplug.ai/plugin/consulting/msg2ai` |
| AI Ambassador | Rethink Labs | 2026-11-18 | An AI assistant that answers guests and attendees around the clock on WhatsApp, SMS and RCS. | `https://mcp.bizplug.ai/plugin/consulting/ai-ambassador` |
| ActionNotes.ai | Rethink Labs | 2026-11-18 | AI note-taking for conferences: contacts, conversations and commitments, with follow-ups. | `https://mcp.bizplug.ai/plugin/consulting/actionnotes` |
| Doha Metro Guide | City guide | 2026-11-15 | Plan Doha Metro journeys and find what to see and do near each station. | `https://mcp.bizplug.ai/plugin/public-transit/doha-metro` |
| [gener8tor Charlotte Startups for Investors](plugins/gener8tor-charlotte) | Startup directory | 2026-11-15 | Find the gBETA Charlotte startups that match your investment thesis. | `https://mcp.bizplug.ai/plugin/startups/gener8tor-charlotte` |
| [Web Summit Qatar Startups for Investors](plugins/websummit-qatar) | Startup directory | 2026-11-14 | Find Web Summit Qatar 2026 startups that match your investment thesis. | `https://mcp.bizplug.ai/plugin/startups/websummit-qatar` |

## The 81 industry plug-ins

The standard plug-in of each industry, as on https://bizplug.ai/plugins/industries. A business gets its own copy, built from its profile.

### Business essentials

| Industry | What it does | MCP server URL |
| --- | --- | --- |
| [Events & Conferences](plugins/events) | Venue availability, pricing and date holds | `https://mcp.bizplug.ai/plugin/events` |
| [Hospitality & Hotels](plugins/hospitality) | Room availability, rates and booking requests | `https://mcp.bizplug.ai/plugin/hospitality` |
| [Marketing Agencies](plugins/agencies) | Book a strategy call | `https://mcp.bizplug.ai/plugin/agencies` |
| [Nonprofits & Charities](plugins/nonprofits) | Volunteer and donation requests | `https://mcp.bizplug.ai/plugin/nonprofits` |
| [SaaS & Software](plugins/saas) | Book a product demo | `https://mcp.bizplug.ai/plugin/saas` |
| [Consulting & Professional Services](plugins/consulting) | Book a discovery call | `https://mcp.bizplug.ai/plugin/consulting` |

### Retail & food

| Industry | What it does | MCP server URL |
| --- | --- | --- |
| [Retail & E-commerce](plugins/retail) | Product search and reserve in store | `https://mcp.bizplug.ai/plugin/retail` |
| [Restaurants & Food Service](plugins/restaurants) | Order ahead and takeaway | `https://mcp.bizplug.ai/plugin/restaurants` |
| [Coffee Shops & Cafes](plugins/coffee-shops) | Mobile order-ahead for pickup | `https://mcp.bizplug.ai/plugin/coffee-shops` |
| [Bars & Nightlife](plugins/bars-nightlife) | Table and guest-list requests | `https://mcp.bizplug.ai/plugin/bars-nightlife` |
| [Catering & Events](plugins/catering) | Catering price by headcount | `https://mcp.bizplug.ai/plugin/catering` |
| [Food Delivery](plugins/food-delivery) | Delivery orders | `https://mcp.bizplug.ai/plugin/food-delivery` |
| [Meal Kits & Subscriptions](plugins/meal-kits) | Pick a plan and order a weekly box | `https://mcp.bizplug.ai/plugin/meal-kits` |
| [Grocery & Supermarkets](plugins/grocery) | Build a pickup or delivery list | `https://mcp.bizplug.ai/plugin/grocery` |
| [Ghost & Cloud Kitchens](plugins/ghost-kitchens) | Order from a cloud-kitchen brand | `https://mcp.bizplug.ai/plugin/ghost-kitchens` |
| [Fashion & Apparel](plugins/fashion) | Find sizes and reserve for try-on | `https://mcp.bizplug.ai/plugin/fashion` |
| [Electronics & Gadgets](plugins/electronics) | Check stock and reserve a gadget | `https://mcp.bizplug.ai/plugin/electronics` |
| [Furniture & Home Goods](plugins/furniture) | Browse pieces and request an order | `https://mcp.bizplug.ai/plugin/furniture` |
| [Beauty E-commerce](plugins/beauty-ecommerce) | Shop products and place an order | `https://mcp.bizplug.ai/plugin/beauty-ecommerce` |
| [Subscription Boxes](plugins/subscriptions) | Choose a box and start a subscription request | `https://mcp.bizplug.ai/plugin/subscriptions` |
| [Convenience & C-Stores](plugins/convenience-stores) | Reserve items for quick pickup | `https://mcp.bizplug.ai/plugin/convenience-stores` |

### Property & auto

| Industry | What it does | MCP server URL |
| --- | --- | --- |
| [Real Estate](plugins/real-estate) | Request property showings | `https://mcp.bizplug.ai/plugin/real-estate` |
| [Local & Home Services](plugins/home-services) | Estimate a local home service | `https://mcp.bizplug.ai/plugin/home-services` |
| [Automotive & Dealerships](plugins/automotive) | Book service and test drives | `https://mcp.bizplug.ai/plugin/automotive` |

### Health & wellness

| Industry | What it does | MCP server URL |
| --- | --- | --- |
| [Healthcare & Clinics](plugins/healthcare) | Find and request appointments | `https://mcp.bizplug.ai/plugin/healthcare` |
| [Fitness & Gyms](plugins/fitness) | Book classes, trials and tours | `https://mcp.bizplug.ai/plugin/fitness` |
| [Beauty & Salons](plugins/beauty) | Book salon services with a stylist | `https://mcp.bizplug.ai/plugin/beauty` |
| [Dental Practices](plugins/dental) | Book cleanings, exams and consults | `https://mcp.bizplug.ai/plugin/dental` |
| [Optometry & Eye Care](plugins/optometry) | Book eye exams and fittings | `https://mcp.bizplug.ai/plugin/optometry` |
| [Dermatology & Skin](plugins/dermatology) | Book skin-care visits | `https://mcp.bizplug.ai/plugin/dermatology` |
| [Chiropractic & PT](plugins/chiropractic) | Book adjustments and therapy sessions | `https://mcp.bizplug.ai/plugin/chiropractic` |
| [Mental Health & Therapy](plugins/mental-health) | Request an intake or session | `https://mcp.bizplug.ai/plugin/mental-health` |
| [Veterinary & Pet Care](plugins/veterinary) | Book pet appointments | `https://mcp.bizplug.ai/plugin/veterinary` |
| [Pharmacies](plugins/pharmacy) | Store services and callback requests | `https://mcp.bizplug.ai/plugin/pharmacy` |
| [Med Spas & Aesthetics](plugins/med-spa) | Book aesthetic treatments and consults | `https://mcp.bizplug.ai/plugin/med-spa` |
| [Senior Care & Communities](plugins/senior-care) | Schedule community tours | `https://mcp.bizplug.ai/plugin/senior-care` |
| [Home Health & Hospice](plugins/home-health) | Request a care assessment | `https://mcp.bizplug.ai/plugin/home-health` |

### Community & public

| Industry | What it does | MCP server URL |
| --- | --- | --- |
| [Education & Schools](plugins/education) | Book campus visits and info sessions | `https://mcp.bizplug.ai/plugin/education` |
| [Logistics & Delivery](plugins/logistics) | Shipping rate estimate and pickup request | `https://mcp.bizplug.ai/plugin/logistics` |
| [Government & Public Sector](plugins/government) | Service requests and case status | `https://mcp.bizplug.ai/plugin/government` |
| [Utilities & Energy](plugins/utilities) | Outage and service-request status | `https://mcp.bizplug.ai/plugin/utilities` |
| [Telecom & ISPs](plugins/telecom) | Compare plans and request service | `https://mcp.bizplug.ai/plugin/telecom` |
| [Religious Organizations](plugins/religious-orgs) | RSVP to services and events, book pastoral time | `https://mcp.bizplug.ai/plugin/religious-orgs` |
| [Membership Associations](plugins/associations) | Membership applications and renewals | `https://mcp.bizplug.ai/plugin/associations` |
| [Childcare & Daycare](plugins/childcare) | Schedule tours and enrollment calls | `https://mcp.bizplug.ai/plugin/childcare` |
| [Tutoring & Test Prep](plugins/tutoring) | Book tutoring sessions and prep trials | `https://mcp.bizplug.ai/plugin/tutoring` |
| [Universities & Colleges](plugins/universities) | Book campus tours and advising | `https://mcp.bizplug.ai/plugin/universities` |
| [Political Campaigns & Advocacy](plugins/political-campaigns) | Volunteer and event sign-ups | `https://mcp.bizplug.ai/plugin/political-campaigns` |
| [Public Transit & Mobility](plugins/public-transit) | Service alerts and issue reports | `https://mcp.bizplug.ai/plugin/public-transit` |
| [Coworking & Offices](plugins/coworking) | Desk and office availability and rates | `https://mcp.bizplug.ai/plugin/coworking` |

### Travel & leisure

| Industry | What it does | MCP server URL |
| --- | --- | --- |
| [Travel & Tourism](plugins/travel) | Tour and trip availability with price per traveller | `https://mcp.bizplug.ai/plugin/travel` |
| [Airlines](plugins/airlines) | Flight status and support requests | `https://mcp.bizplug.ai/plugin/airlines` |
| [Cruise Lines](plugins/cruise-lines) | Sailing availability and cabin pricing | `https://mcp.bizplug.ai/plugin/cruise-lines` |
| [Car Rental](plugins/car-rental) | Vehicle availability and rental price | `https://mcp.bizplug.ai/plugin/car-rental` |
| [Theme Parks & Attractions](plugins/theme-parks) | Ticket availability for a visit date | `https://mcp.bizplug.ai/plugin/theme-parks` |
| [Museums & Galleries](plugins/museums) | Timed tickets and exhibitions | `https://mcp.bizplug.ai/plugin/museums` |
| [Casinos & Gaming](plugins/casinos) | Hotel rooms and show tickets (no wagering) | `https://mcp.bizplug.ai/plugin/casinos` |
| [Sports Teams & Venues](plugins/sports-teams) | Seat availability and ticket requests | `https://mcp.bizplug.ai/plugin/sports-teams` |
| [Wedding & Events Pros](plugins/wedding-services) | Check your date and request a consultation | `https://mcp.bizplug.ai/plugin/wedding-services` |
| [Photography & Creative](plugins/photography) | Book a shoot or consultation | `https://mcp.bizplug.ai/plugin/photography` |

### Finance & B2B

| Industry | What it does | MCP server URL |
| --- | --- | --- |
| [Financial Services & Banking](plugins/financial-services) | Book a banker or advisor meeting | `https://mcp.bizplug.ai/plugin/financial-services` |
| [Insurance](plugins/insurance) | Quote request intake | `https://mcp.bizplug.ai/plugin/insurance` |
| [Legal Services](plugins/legal) | Book an initial consultation | `https://mcp.bizplug.ai/plugin/legal` |
| [Lending & Mortgages](plugins/lending) | Book a loan or mortgage consultation | `https://mcp.bizplug.ai/plugin/lending` |
| [Wealth & Investing](plugins/wealth) | Book an intro meeting with an advisor | `https://mcp.bizplug.ai/plugin/wealth` |
| [Crypto & Fintech](plugins/crypto) | Fee estimate and onboarding request | `https://mcp.bizplug.ai/plugin/crypto` |
| [Tax & Accounting](plugins/accounting) | Book a tax or bookkeeping consult | `https://mcp.bizplug.ai/plugin/accounting` |
| [Chambers of Commerce & Business Associations](plugins/chambers) | Chamber information, membership enquiries and member businesses | `https://mcp.bizplug.ai/plugin/chambers` |
| [Recruiting & Staffing](plugins/recruiting) | Book an intro call for employers or candidates | `https://mcp.bizplug.ai/plugin/recruiting` |
| [HR & Internal Comms](plugins/hr-comms) | Book a platform demo | `https://mcp.bizplug.ai/plugin/hr-comms` |
| [Cybersecurity](plugins/cybersecurity) | Book a security assessment call | `https://mcp.bizplug.ai/plugin/cybersecurity` |
| [Developer Tools](plugins/dev-tools) | Book a technical demo or onboarding | `https://mcp.bizplug.ai/plugin/dev-tools` |

### Home & trades

| Industry | What it does | MCP server URL |
| --- | --- | --- |
| [HVAC & Heating/Cooling](plugins/hvac) | Instant estimate and service visit request | `https://mcp.bizplug.ai/plugin/hvac` |
| [Plumbing](plugins/plumbing) | Estimate and book a plumber | `https://mcp.bizplug.ai/plugin/plumbing` |
| [Electricians](plugins/electricians) | Estimate and book an electrician | `https://mcp.bizplug.ai/plugin/electricians` |
| [Cleaning Services](plugins/cleaning) | Price a clean by home size and book | `https://mcp.bizplug.ai/plugin/cleaning` |
| [Landscaping & Lawn](plugins/landscaping) | Estimate lawn and landscape work | `https://mcp.bizplug.ai/plugin/landscaping` |
| [Pest Control](plugins/pest-control) | Estimate treatment and request a visit | `https://mcp.bizplug.ai/plugin/pest-control` |
| [Moving & Storage](plugins/moving-storage) | Moving estimate and storage rates | `https://mcp.bizplug.ai/plugin/moving-storage` |
| [Solar & Clean Energy](plugins/solar) | Rough system estimate and site survey request | `https://mcp.bizplug.ai/plugin/solar` |
| [Property Management](plugins/property-management) | Maintenance requests and status | `https://mcp.bizplug.ai/plugin/property-management` |

---

Published by Bart Cant - Rethink Labs. BizPlug is built and run by msg2ai (https://msg2.ai) and is not affiliated with OpenAI. ChatGPT is a trademark of OpenAI.

# Set up, configure and test a BizPlug plug-in

This page covers the three steps in order. The examples use the Coffee Shops & Cafes plug-in (`plugins/coffee-shops`); every other industry works the same way with its own tool names and files. This page is generated with the rest of the repository, so please do not edit it by hand.

- [Setup](#setup): add a plug-in to ChatGPT
- [Configuration](#configuration): give a plug-in your business's own data
- [Testing](#testing): check it before customers use it

## Setup

A plug-in is an MCP server hosted by BizPlug. There is nothing to install or run: you give ChatGPT the plug-in's address.

1. In ChatGPT, open Settings, then Apps & Connectors, and turn on developer mode.
2. Create a connector. Paste the plug-in's MCP server URL, for example `https://mcp.bizplug.ai/plugin/coffee-shops`. Every URL is in the [README](README.md) and in each package's `mcp.json`. No sign-in is needed.
3. Start a new chat, pick the connector and ask "What can this plug-in do?" It answers with its menu.

There are two kinds of address:

| Address | What it serves |
| --- | --- |
| `https://mcp.bizplug.ai/plugin/<industry>` | Every business in that industry. The assistant asks which business you mean. |
| `https://mcp.bizplug.ai/plugin/<industry>/<business>` | One business, with its own data. This is the address a business gives its customers. |

## Configuration

A plug-in answers only from what the business has published. Configuring it means providing that data. Each package lists exactly what is needed:

- `plugins/<industry>/data/requirements.json`: the datasets and their columns, with which are required.
- `plugins/<industry>/data/templates/*.csv`: one CSV template per dataset, with an example row.
- `plugins/<industry>/data/AGENT_INSTRUCTIONS.md`: step-by-step instructions for a person or an AI agent collecting the data, including what must never be uploaded (secrets, card or ID numbers, customers' personal data).

### 1. Add the plug-in to your account

Sign up at https://bizplug.ai/portal, save your business profile and add your industry's plug-in from the marketplace.

### 2. Provide the data

Either upload each CSV file under its dataset on the plug-in's page in the portal, or send it through the data API:

1. Create an API key at https://bizplug.ai/portal/api.
2. List your plug-ins and their ids: `GET https://bizplug.ai/api/portal/v1/plugins` with the header `Authorization: Bearer <key>`.
3. Send each file: `PUT https://bizplug.ai/api/portal/v1/plugins/<plugin-id>/datasets/<file name>` with `Content-Type: text/csv` and the file as the body, or `Content-Type: application/json` and `{"rows": [{...}]}` keyed by the column names.

Both ways check the file against its dataset and list every error. Fix them and send the file again until it is accepted.

### 3. Choose what to bundle

On the plug-in's page you can tick what you want bundled with it, such as where requests are sent and which systems it connects to. Each option says whether it is included, set up with you, or a custom integration that is quoted separately before anything is built. Your choice goes to the BizPlug team with your deploy request.

### 4. Request a deploy

1. When the required files are accepted, press Request test deploy. BizPlug publishes the plug-in to a test address, `https://mcp-test.bizplug.ai/plugin/<industry>/<business>`, and emails you.
2. Test it (see [Testing](#testing)).
3. Press Request production. The plug-in then answers at `https://mcp.bizplug.ai/plugin/<industry>/<business>`. The plug-in is $24.99 a month or $199 a year; plan details are confirmed with you before any payment.

Files you upload after a deploy do not go live by themselves: request a deploy again to publish them. Each deploy request also runs an automated review of the files, which flags problems for the team to look at.

### Versions

A published plug-in keeps the version it was published with until you press Upgrade on its page: on test first, then on production. Upgrading changes how the plug-in behaves, never your data.

| Version | Date | What changed |
| --- | --- | --- |
| 0.1.0 | 2026-11-15 | The plug-in's tools for your industry, questions answered from your own information, and a text menu of what it can do. |
| 0.2.0 | 2026-11-16 | A menu card in ChatGPT: your customers see a button for each thing they can do. Each button opens a short form (dates and party size, an item, a reference, a question or a request), so customers tap and fill in instead of typing everything. |
| 0.3.0 | 2026-11-16 | Results show inside the card: prices, availability, open times, estimates and statuses, instead of only as text in the chat. Customers can go from a result straight to a request in the card: pick an option or a time, add their name and email, and send. |
| 0.4.0 | 2026-11-16 | Customers browse by tapping: your own categories and services, and shortcuts for dates and party size, appear as buttons on each form. A list can be searched and filtered by category in the card, and each item or option opens on its own screen, with Back to return. Your published questions and answers show in the card, so common questions are answered with one tap. Other questions still go to the chat. |
| 0.5.0 | 2026-11-16 | A WhatsApp button to your own number: save your WhatsApp number and a first message under Integrations on your plug-in page, and customers can open a chat with you from your contact details and after they send a request. Requests still reach you by email as before. WhatsApp is an extra way for a customer to reach you, and nothing is sent until they press send in WhatsApp. |
| 0.6.0 | 2026-11-16 | A Pay online button after a request, to your own payment page (for example a Stripe Payment Link). BizPlug takes no payment: the customer pays on your page. Book online, Get directions and Leave a review buttons with your contact details, each to a link you save under Integrations on your plug-in page. |
| 0.7.0 | 2026-11-16 | Your buttons show on your menu card, so a customer can message, book, find or follow you without asking first. A Book button to your booking page shows next to availability and open times, where a customer decides. The assistant knows which buttons you have and points to the right one at the right moment. Your Traction Dashboard counts how often each button is pressed, and where each request was delivered. |
| 0.8.0 | 2026-11-16 | When a customer asks how to pay or whether they can pay online, the assistant answers from your settings: your own payment page if you saved one (Stripe, PayPal, Square or another), otherwise that payment is arranged with you directly. Your payment page is also listed with your contact details, so a customer can find it before or without sending a request. It still shows after a request as before. The assistant never takes card details or payment in the chat. The customer pays on your page, and the money never passes through BizPlug. |
| 0.9.0 | 2026-11-16 | Connect your own Stripe account (sign in with Stripe, or paste a key) or your Checkout.com account under Integrations: after a customer sends an order or booking with a price, they get a Pay now button to a checkout page in your business's name. The money goes to your account, never through BizPlug. The price is taken from your published files, never from the chat. Your plug-in confirms each payment with the provider, you get an email when an order is paid, and you can refund it from Payments on your plug-in page. Test mode first: no real money. Live payments are switched on for your plug-in once BizPlug has approved it. You still confirm every request yourself. |
| 0.10.0 | 2026-11-17 | Your plug-in tells ChatGPT who it is: your business's own summary as its description, and your website as its link. Nothing changes in how it answers customers or handles requests. |
| 0.11.0 | 2026-11-17 | Each tool of your plug-in now states whether it only reads information or sends something that cannot be taken back. ChatGPT uses this to decide when to ask a customer to confirm. Sending a request is marked as an action that cannot be undone, so ChatGPT may ask the customer to confirm before it is sent. Nothing else changes. |
| 0.12.0 | 2026-11-17 | For coworking plug-ins: upload members.csv with the member businesses that agreed to be listed, and your plug-in gets a Members button. People search your members by name, kind of business or location, and open each one to see what it does, what it is looking for and what it offers. Find a collaborator: a person says what they need or what they can offer, and the plug-in shows the members whose entries match. Contact is direct: the plug-in shows the website, general email and phone number you list for each member, and the person writes or calls the member themselves. Neither you nor BizPlug introduces, forwards or vouches. Other plug-ins do not change. |
| 0.13.0 | 2026-11-18 | After a customer sends an order or booking with a price, the card shows the total and a Pay now button to your Stripe or Checkout.com checkout page, with a TEST badge while you are in test mode. An I've paid button in the card asks your payment provider whether the payment went through and shows Paid or Waiting for payment, without the customer typing their reference. Card details are only ever entered on the payment provider's own page, never in ChatGPT. |
| 0.14.0 | 2026-11-18 | ChatGPT shows your plug-in under your business's name followed by what it is, for example "msg2ai – AI messaging for hotels, rentals and events", so customers can tell it apart from others. If your business.csv has a logo, ChatGPT can show it as your plug-in's icon. Nothing changes in how it answers customers or handles requests. |
| 0.15.0 | 2026-11-18 | For Software & SaaS plug-ins: the menu shows Features (what the product does, the plan each feature is on and its guide), Pricing, Help & guides (your help articles, searchable, each with its link), Support (a support request with a reference) and Book a demo. Upload features.csv, plans.csv and guides.csv, and add your pricing, support, documentation and status pages to business.csv. Listed in ChatGPT's plug-in directory: switch Listed in ChatGPT directory on, and Pricing shows only your pricing page, as OpenAI requires. Every industry: your plug-in now describes only your business to ChatGPT. It no longer calls itself a BizPlug plug-in in its instructions, and ChatGPT is no longer asked to mention BizPlug in its answers. The Contact BizPlug bar in the card stays. |
| 0.16.0 | 2026-11-19 | Customer sign-in: under Integrations, open Clerk sign-in and save the API keys of your own Clerk application. From then on ChatGPT asks each customer to sign in with your Clerk sign-in page when they add your plug-in, and your plug-in answers only signed-in customers. Use it for a plug-in that is only for your members or existing customers. BizPlug checks each customer's sign-in with your Clerk application on every request and keeps none of their account details. Without Clerk keys saved, nothing changes: your plug-in stays open to anyone, as before. |
| 0.17.0 | 2026-11-19 | Account tools: if your product has its own MCP server, save its address under Integrations, in the Clerk sign-in panel. Your plug-in then also offers your server's tools, so a customer can work in their own account with you from ChatGPT. Customers sign in with your Clerk application to use those tools. The rest of your plug-in (menu, answers, requests) stays open to anyone, so people who are not customers yet can still ask about your product. Your plug-in offers the tools your server listed when you saved the address, and keeps exactly those until you press Refresh. Each call goes to your server with the customer's own sign-in; BizPlug keeps neither the sign-in nor what was asked or answered. Without a saved address nothing changes: with Clerk sign-in alone, your whole plug-in still answers only signed-in customers, as in 0.16.0. |
| 0.18.0 | 2026-11-19 | For shows and conferences: upload sessions.csv (the agenda), speakers.csv, exhibitors.csv and sponsors.csv, and your plug-in becomes an event guide. The menu shows About the event, Agenda (by day), Speakers, Exhibitors & sponsors (searchable, each with its website and email) and Send an enquiry. An enquiry (exhibiting, sponsoring, visiting, speaking or anything else) reaches your team with a reference, like any other request. People contact an exhibitor directly with the details you publish. A show needs no inventory.csv. A venue that publishes no programme keeps the venue menu (availability, date holds) as before. |
| 0.19.0 | 2026-11-19 | Account menu: if your server's tool list also declares a menu, your card shows a button for each entry, next to your plug-in's own options. A customer taps a button, fills in a short form or picks from a list, and the card runs your tool and shows the result. A button can save something (a new note), list records and open one (sessions, notes, action items, reports), start a longer job and show it when it is ready (a report), or hand over to the chat (dictating a note with ChatGPT's microphone). The menu is read with your tool list when you save your server's address, and stays as it was until you save the address again. Customers still sign in with your Clerk application before any of these run. Without a menu in your tool list nothing changes: your account tools work from the chat as in 0.17.0. |
| 0.20.0 | 2026-11-19 | Send by email and Send on WhatsApp: an entry of your account menu can add these buttons to a record's screen. They open the customer's own mail app or WhatsApp with the text you name filled in, for example a follow-up draft, addressed to the contact on the record when it has one. The customer reads the message and sends it themselves. Nothing is sent by the card, by BizPlug or by your server, and the text does not pass through BizPlug's servers. Without `send` in your menu nothing changes. |
| 0.21.0 | 2026-11-20 | Card banner: add a wide picture of your business (your own photo or artwork, https) on your plug-in's page, next to the card theme. Your card shows it at the top of its menu, above the buttons, on test and production at once. The picture is shown through bizplug.ai, so your card only loads images from BizPlug and your customers' browsers never contact another site. PNG, JPEG or WebP, up to 3 MB; a wide picture (about 1.91 to 1, for example 1200 by 628) fits best. Without a banner nothing changes. Write to a member (coworking and chambers with a published member list): on a member's screen, Write to them asks the person's name, company and what they would like to discuss, and drafts a first message. Open in email starts it in their own mail app with the draft filled in; Open in WhatsApp opens a chat with the member's own number. The person reads it and sends it themselves: nothing is sent, kept or forwarded by the card, the business or BizPlug. |
| 0.22.0 | 2026-11-20 | For coworking plug-ins: upload locations.csv with your locations, whether you give tours there and when, and whether you sell a day pass there and at what rate. Your plug-in then gets a Book a tour button and a Day pass button, each for the locations that offer it. A customer picks a location, a day and how many people. A day pass shows your published rate for that many people; where you gave no rate, it says you confirm the price. If you saved your msg2ai WhatsApp assistant or your own WhatsApp number under Integrations, the customer continues on WhatsApp with the message to send there, and is asked for no name or email. Otherwise the request reaches you like a booking request, with a reference. Nothing is booked until you confirm. Paying for a day pass and live tour time slots are not part of this version. Other plug-ins do not change. |

## Testing

### In ChatGPT

Add the test address as a connector (see [Setup](#setup)) and try the plug-in as a customer would. Each package carries its own test cases in `plugin.json`, under `extensions["com.openai"].review.test_cases`: a prompt, what should happen, and whether a tool should be called at all. For Coffee Shops & Cafes:

| Prompt | Expected |
| --- | --- |
| What can this plug-in do? | Calls show_menu, which shows the menu card; does not list the options again, or lists them exactly as returned where there is no card. |
| Mobile order-ahead for pickup | Calls get_menu and answers from the published profile. |
| What time do you open, and do you have oat milk? | Answers from the business profile, or says it is not covered and offers contact details. |
| Go ahead and send it. | Calls place_pickup_order only after the customer has confirmed the details, and reports that the business still has to confirm. |
| Write me a poem about the ocean. | Does not call any tool. |

Beyond those, check your own data:

- **Look-up** (`get_menu`): every item, price, date or time shown matches what you uploaded, and nothing is shown that you did not upload.
- **Request** (`place_pickup_order`): the assistant asks the customer to confirm the details before it sends anything, and says the business still has to confirm.
- **Status** (`get_order_status`): a reference you have published a status for is found. For any other reference, including a request you have just sent, the plug-in says there is no published status and that the business replies by email.
- **Questions**: answers come from your FAQ file and business details. For anything they do not cover, the plug-in says so and offers your contact details instead of guessing.
- **Contact details** (`get_business_info`, `get_contact`): name, hours, phone, email and address are right.

### Without ChatGPT

The server speaks MCP over streamable HTTP, so any MCP client can connect to the same URL. To see a plug-in's tools from a terminal:

```bash
curl -s -X POST https://mcp.bizplug.ai/plugin/coffee-shops \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

The response lists the six tools with their descriptions and input schemas.

### If something is wrong

- **Wrong or missing information:** correct the CSV file, upload it again and request a new test deploy.
- **Anything else:** write to info@bizplug.ai with the plug-in's address and the question you asked.

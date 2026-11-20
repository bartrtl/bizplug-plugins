# BizPlug Chambers of Commerce & Business Associations

Version 0.29.0. Chamber information, membership enquiries and member businesses for chambers of commerce & business associations businesses.

- Main function: Chamber information, membership enquiries and member businesses
- MCP server URL: `https://mcp.bizplug.ai/plugin/chambers` (streamable HTTP, no sign-in)
- A business's own plug-in: `https://mcp.bizplug.ai/plugin/chambers/<business>`
- About this plug-in: https://bizplug.ai/industries/chambers

## What a customer can do

- **Ask a question**: Answers from the business's own information: membership levels and benefits, events, programs, committees, advocacy and member businesses.
- **Committees**: The committees and working groups, what each works on and who chairs it, when the business publishes them.
- **News & events**: The latest news, upcoming events and the newsletter, with links to read more and sign up.
- **Send a request**: Send a new request to the business.
- **Look up a reference**: Look up the status of a reference you already have.
- **Request status**: Check a request with its reference.
- **Members**: The member businesses here, when the business has published its member list: find one by name, kind of business, or what you need or offer, and contact it directly.
- **Contact the business**: Phone, email, website and opening hours.

## Tools

| Tool | What it does |
| --- | --- |
| `show_menu` | Return this plug-in's menu: what the customer can do here, each with a short title, a one-line description and a question to try. Call it when the customer asks what this can do, asks for a menu or options, or opens without a question. ChatGPT shows the menu as a card with a button and a short form for each option; where there is no card, show the options exactly as returned (same titles, same order). Creates nothing. |
| `lookup_membership_reference` | Look up the published status for a reference the customer already has. Creates nothing. Share only what the chamber or association has published about membership, dues, events and programs. Never promise that membership will be approved, or any introduction, business lead or policy outcome, and never take payment of dues in chat. |
| `send_chamber_enquiry` | Send a new membership or event enquiry to the business. Use only once the customer has given the details and agrees to send it. Share only what the chamber or association has published about membership, dues, events and programs. Never promise that membership will be approved, or any introduction, business lead or policy outcome, and never take payment of dues in chat. |
| `get_enquiry_status` | Look up the status of a request by its reference. |
| `get_business_info` | Answer a general question about this chambers of commerce & business associations business using only its published profile: membership levels and benefits, events, programs, committees, advocacy and member businesses. Creates nothing. If the profile does not cover the question, say so and use get_contact. Share only what the chamber or association has published about membership, dues, events and programs. Never promise that membership will be approved, or any introduction, business lead or policy outcome, and never take payment of dues in chat. |
| `get_contact` | Return the business's published contact details and opening hours for anything the other tools cannot do. |
| `find_members` | Find the member businesses of this chambers of commerce & business associations business, from the member list it published. Search by a name, a kind of business, or what the person needs or offers, optionally narrowed to an industry or a location; with no query it lists the members by industry. Returns each match with its description, what it is looking for, what it offers and its published contact details. Creates nothing and sends nothing. Contact is direct: the person writes or calls the member themselves, and neither the chamber or association nor BizPlug introduces, forwards or vouches. Share only what the business lists for a member. |
| `write_to_member` | Draft a first message from the person to one member business, in their own words and signed with their own name, and return the member's own published ways to receive it: an email link with the draft filled in, WhatsApp on the member's number, its website. Nothing is sent: the person reads the draft and sends it themselves. Use it when the person wants to contact a member they found with find_members. Contact is direct: the person writes or calls the member themselves, and neither the chamber or association nor BizPlug introduces, forwards or vouches. |

## Changes

- **0.29.0** (20 November 2026): The booking calendar for car rental, tickets, desks and venues, with prices that change by day.
- **0.28.0** (20 November 2026): Event guides: exhibitor and sponsor logos, and a More about panel for each company with Ask ChatGPT for more.
- **0.27.0** (20 November 2026): Hotels: a booking screen with a calendar of free nights, adults, children and rooms, room cards with nightly prices, the hotel's policies, and a booking button on each room.
- **0.26.0** (20 November 2026): Member details: each member's address, LinkedIn page and a More about panel, with Ask ChatGPT for more.
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

## Files

- `plugin.json`: name, description, starter prompts and review test cases
- `mcp.json`: the plug-in's MCP server URL
- `data/`: the datasets a business provides, with CSV templates and instructions

Generated from the BizPlug website's data files. Do not edit by hand.

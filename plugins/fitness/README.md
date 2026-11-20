# BizPlug Fitness & Gyms

Version 0.31.0. Book classes, trials and tours for fitness & gyms businesses.

- Main function: Book classes, trials and tours
- MCP server URL: `https://mcp.bizplug.ai/plugin/fitness` (streamable HTTP, no sign-in)
- A business's own plug-in: `https://mcp.bizplug.ai/plugin/fitness/<business>`
- About this plug-in: https://bizplug.ai/industries/fitness

## What a customer can do

- **Open times**: See what can be booked and the open times on a day.
- **Request the appointment**: Ask for an open time. The business confirms the appointment.
- **Ask a question**: Answers from the business's own information: classes, memberships and trial passes.
- **Request status**: Check a request with its reference.
- **Social media**: The latest posts from the business's social media, with their pictures, and where to follow it.
- **Contact the business**: Phone, email, website and opening hours.

## Tools

| Tool | What it does |
| --- | --- |
| `show_menu` | Return this plug-in's menu: what the customer can do here, each with a short title, a one-line description and a question to try. Call it when the customer asks what this can do, asks for a menu or options, or opens without a question. ChatGPT shows the menu as a card with a button and a short form for each option; where there is no card, show the options exactly as returned (same titles, same order). Creates nothing. |
| `find_class_slots` | List bookable class or trial options and the open times on a day, from the business's published hours. Creates nothing. |
| `request_class_spot` | Send a request for a class or trial at an open time to the business. Use only once the customer has picked a time. The business confirms the appointment. |
| `get_booking_status` | Look up the status of a request by its reference. |
| `get_business_info` | Answer a general question about this fitness & gyms business using only its published profile: classes, memberships and trial passes. Creates nothing. If the profile does not cover the question, say so and use get_contact. |
| `get_contact` | Return the business's published contact details and opening hours for anything the other tools cannot do. |

## Changes

- **0.31.0** (20 November 2026): Menu layouts: choose how your card's menu is organised, from the Ask bar, App and Story layouts or one from the open-source layout directory.
- **0.30.0** (20 November 2026): Social media on the card: the business's latest posts with their pictures, from its feeds and the posts it pins, and where to follow it.
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

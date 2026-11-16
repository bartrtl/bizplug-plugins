# BizPlug Fitness & Gyms

Version 0.4.0. Book classes, trials and tours for fitness & gyms businesses.

- Main function: Book classes, trials and tours
- MCP server URL: `https://mcp.bizplug.ai/plugin/fitness` (streamable HTTP, no sign-in)
- A business's own plug-in: `https://mcp.bizplug.ai/plugin/fitness/<business>`
- About this plug-in: https://bizplug.ai/industries/fitness

## What a customer can do

- **Open times**: See what can be booked and the open times on a day.
- **Request the appointment**: Ask for an open time. The business confirms the appointment.
- **Ask a question**: Answers from the business's own information: classes, memberships and trial passes.
- **Request status**: Check a request with its reference.
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

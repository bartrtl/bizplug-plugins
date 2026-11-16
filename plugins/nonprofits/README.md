# BizPlug Nonprofits & Charities

Version 0.4.0. Volunteer and donation requests for nonprofits & charities businesses.

- Main function: Volunteer and donation requests
- MCP server URL: `https://mcp.bizplug.ai/plugin/nonprofits` (streamable HTTP, no sign-in)
- A business's own plug-in: `https://mcp.bizplug.ai/plugin/nonprofits/<business>`
- About this plug-in: https://bizplug.ai/industries/nonprofits

## What a customer can do

- **Look up a reference**: Look up the status of a reference you already have.
- **Send a request**: Send a new request to the business.
- **Ask a question**: Answers from the business's own information: programs, events, volunteering and giving.
- **Request status**: Check a request with its reference.
- **Contact the business**: Phone, email, website and opening hours.

## Tools

| Tool | What it does |
| --- | --- |
| `show_menu` | Return this plug-in's menu: what the customer can do here, each with a short title, a one-line description and a question to try. Call it when the customer asks what this can do, asks for a menu or options, or opens without a question. ChatGPT shows the menu as a card with a button and a short form for each option; where there is no card, show the options exactly as returned (same titles, same order). Creates nothing. |
| `lookup_request_status` | Look up the published status for a reference the customer already has. Creates nothing. Never take card or bank details in chat. |
| `submit_volunteer_or_donation_request` | Send a new volunteer or donation request to the business. Use only once the customer has given the details and agrees to send it. Never take card or bank details in chat. |
| `get_request_status` | Look up the status of a request by its reference. |
| `get_business_info` | Answer a general question about this nonprofits & charities business using only its published profile: programs, events, volunteering and giving. Creates nothing. If the profile does not cover the question, say so and use get_contact. Never take card or bank details in chat. |
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

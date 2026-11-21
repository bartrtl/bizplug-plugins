# Industry plug-ins

BizPlug has a standard plug-in for each of 81 industries. Each one is a package in [`plugins/<slug>/`](plugins), and every business in that industry can get its own copy, built from its own profile. This page explains what an industry plug-in is made of, and how to propose a new industry.

This page is generated with the rest of the repository, so please do not edit it by hand. A new industry is proposed with an issue, never a pull request: the packages in `plugins/` are generated from the BizPlug website, so a pull request that adds one would be overwritten by the next update.

## What an industry plug-in is

A plug-in is an MCP server, hosted by BizPlug, that answers customers in ChatGPT and Claude from a business's own published information and passes their requests to the business. The business confirms every request itself.

Each package is generated from the website's data files on every update:

```
plugins/<slug>/
  README.md                    what customers can do, the tools and what changed in each version
  plugin.json                  name, description, starter prompts and review test cases
  mcp.json                     the MCP server URL: https://mcp.bizplug.ai/plugin/<slug>
  assets/icon.png              the plug-in's logo
  data/requirements.json       the data files a business provides, column by column
  data/templates/*.csv         a CSV template per data file, with an example row
  data/AGENT_INSTRUCTIONS.md   how a person or an AI agent collects that data
```

The definitions are in [`source/`](source): `industry-functions.ts` (each industry's engine, tool names and options), `plugins.ts` (tools, menu and test cases), `plugin-data.ts` (data files and columns) and `plugin-examples.ts` (the example rows).

### Built from an engine

Every industry runs on one of 5 engines. The engine decides the plug-in's three main tools (a look-up, a request and a status check), its menu and the data a business provides. An industry adds its own words: its name, the tool names, what is ordered, booked or requested, a sample customer question, and what the plug-in covers.

Every plug-in also has `show_menu`, `get_business_info`, `get_contact`, `open_form`, and its data files always include `business.csv`, `services.csv`, `faqs.csv`, `social.csv`. A customer's request is always sent to the business, which confirms it; nothing is charged in the chat.

### `order`

Browse a catalog with prices, send a pickup or delivery order, check its status.

- Tools, as Restaurants & Food Service names them: `browse_menu` (Browse and prices), `place_order` (Place the order), `get_order_status` (Order status). The tool names differ from industry to industry.
- Data the engine adds: `catalog.csv` (required).
- 13 industries: Restaurants & Food Service, Coffee Shops & Cafes, Food Delivery, Ghost & Cloud Kitchens, Meal Kits & Subscriptions, Grocery & Supermarkets, Convenience & C-Stores, Retail & E-commerce, Fashion & Apparel, Electronics & Gadgets, Furniture & Home Goods, Beauty E-commerce, Subscription Boxes.

### `stay`

Check what is free for dates and party size with the total price, send a booking request, check its status.

- Tools, as Hospitality & Hotels names them: `check_room_availability` (Availability and price), `request_booking` (Request the booking), `get_booking_status` (Booking status). The tool names differ from industry to industry.
- Data the engine adds: `inventory.csv` (required), `blocked-dates.csv`, `rates.csv`.
- A stay industry is booked one of 3 ways:
  - Booked by the night: Hospitality & Hotels, Casinos & Gaming.
  - Booked by the day, first and last day both counted: Events & Conferences, Car Rental, Coworking & Offices.
  - Booked for one date: Wedding & Events Pros, Bars & Nightlife, Travel & Tourism, Cruise Lines, Theme Parks & Attractions, Museums & Galleries, Sports Teams & Venues.
- Priced per guest instead of per unit: Travel & Tourism, Cruise Lines, Theme Parks & Attractions, Museums & Galleries, Sports Teams & Venues.
- 12 industries: Hospitality & Hotels, Casinos & Gaming, Events & Conferences, Wedding & Events Pros, Bars & Nightlife, Travel & Tourism, Cruise Lines, Theme Parks & Attractions, Museums & Galleries, Sports Teams & Venues, Car Rental, Coworking & Offices.

### `appt`

Find open times on a day, request an appointment, check its status.

- Tools, as Healthcare & Clinics names them: `find_appointment_slots` (Open times), `request_appointment` (Request the appointment), `get_appointment_status` (Request status). The tool names differ from industry to industry.
- Data the engine adds: `bookable.csv` (required), `open-hours.csv` (required).
- 32 industries: Healthcare & Clinics, Dental Practices, Optometry & Eye Care, Dermatology & Skin, Chiropractic & PT, Mental Health & Therapy, Veterinary & Pet Care, Med Spas & Aesthetics, Beauty & Salons, Fitness & Gyms, Automotive & Dealerships, Home Health & Hospice, Senior Care & Communities, Real Estate, Legal Services, Tax & Accounting, Financial Services & Banking, Wealth & Investing, Lending & Mortgages, Tutoring & Test Prep, Childcare & Daycare, Photography & Creative, Education & Schools, Universities & Colleges, Consulting & Professional Services, Marketing Agencies, SaaS & Software, Developer Tools, Cybersecurity, Recruiting & Staffing, HR & Internal Comms, Religious Organizations.

### `quote`

Work out an estimate from published price rules, request a quote or a visit, check its status.

- Tools, as HVAC & Heating/Cooling names them: `get_service_estimate` (Price estimate), `request_service_visit` (Request the job), `get_job_status` (Job status). The tool names differ from industry to industry.
- Data the engine adds: `price-rules.csv` (required).
- 14 industries: HVAC & Heating/Cooling, Plumbing, Electricians, Local & Home Services, Cleaning Services, Landscaping & Lawn, Pest Control, Solar & Clean Energy, Moving & Storage, Catering & Events, Logistics & Delivery, Insurance, Telecom & ISPs, Crypto & Fintech.

### `track`

Look up a reference the customer already has, send a new request, check its status.

- Tools, as Government & Public Sector names them: `lookup_case_status` (Look up a reference), `submit_service_request` (Send a request), `get_request_status` (Request status). The tool names differ from industry to industry.
- Data the engine adds: `records.csv`.
- 10 industries: Government & Public Sector, Utilities & Energy, Property Management, Nonprofits & Charities, Chambers of Commerce & Business Associations, Membership Associations, Political Campaigns & Advocacy, Airlines, Public Transit & Mobility, Pharmacies.

### Options

A few industries switch on an option that adds tools, menu options and data files. Options are added by the BizPlug team, because each one needs work on the plug-in server and its own plug-in version.

| Option | What it adds | Tools | Data files | Industries |
| --- | --- | --- | --- | --- |
| `members` | The business may publish its member businesses. People search them and contact a member directly; nobody introduces or forwards. | `find_members`, `write_to_member` | `members.csv` | Coworking & Offices, Chambers of Commerce & Business Associations |
| `infoFirst` | The menu starts with Ask a question, because the plug-in mainly explains the business. Committees and News & events show when the business published them. | none | `committees.csv`, `news.csv`, `newsletter.csv` | Chambers of Commerce & Business Associations |
| `software` | A software product: the menu is Features, Pricing, Help & guides, Support and Book a demo. | `get_features`, `get_pricing`, `search_help`, `request_support` | `features.csv`, `plans.csv`, `guides.csv` | SaaS & Software |
| `visits` | The business may publish its locations, with tours and day passes. The business confirms each one. | `get_visit_options`, `book_tour`, `request_day_pass` | `locations.csv` | Coworking & Offices |
| `show` | A show or conference that published its programme gets an event guide (agenda, speakers, exhibitors and sponsors, enquiries) instead of the venue's menu. | `get_agenda`, `find_speakers`, `find_exhibitors`, `send_event_enquiry` | `sessions.csv`, `speakers.csv`, `exhibitors.csv`, `sponsors.csv` | Events & Conferences |

24 industries also carry a rule the assistant always follows, shown in their tool descriptions; for example, health plug-ins never give medical advice, and finance plug-ins never ask for account numbers.

### Groups

The website groups the industries like this:

| Group | Industries | For example |
| --- | --- | --- |
| Business essentials | 6 | Events & Conferences, Hospitality & Hotels, Marketing Agencies, Nonprofits & Charities, ... |
| Retail & food | 15 | Retail & E-commerce, Restaurants & Food Service, Coffee Shops & Cafes, Bars & Nightlife, ... |
| Property & auto | 3 | Real Estate, Local & Home Services, Automotive & Dealerships |
| Health & wellness | 13 | Healthcare & Clinics, Fitness & Gyms, Beauty & Salons, Dental Practices, ... |
| Community & public | 13 | Education & Schools, Logistics & Delivery, Government & Public Sector, Utilities & Energy, ... |
| Travel & leisure | 10 | Travel & Tourism, Airlines, Cruise Lines, Car Rental, ... |
| Finance & B2B | 12 | Financial Services & Banking, Insurance, Legal Services, Lending & Mortgages, ... |
| Home & trades | 9 | HVAC & Heating/Cooling, Plumbing, Electricians, Cleaning Services, ... |

Added since the first 80: Chambers of Commerce & Business Associations (`chambers`, 2026-11-18).

## Propose a new industry

1. Check that the industry is not already here: see the tables in the [README](README.md#the-81-industry-plug-ins). If yours is close to an existing one, a business can usually use that one.
2. Open the [Propose a new industry](https://github.com/msg2ai/bizplug-plugins/issues/new?template=new-industry.yml) form and fill it in.
3. The BizPlug team replies in the issue, and may ask questions there.

What the form asks for:

| Field | What to give | Example |
| --- | --- | --- |
| Name | The industry's name as businesses would look for it | Bicycle shops & repair |
| Group | One of the groups above | Retail & food |
| Engine | The engine that fits the main thing customers want to do, or "Not sure" | `appt`, for booking a repair |
| What is booked, ordered or requested | One short noun | repair service |
| A sample customer question | One question a customer would ask | Can you fix a flat tyre today, and what does it cost? |
| What customers ask about | The topics the plug-in should answer from the business's profile | services and prices, opening hours, rentals, repairs |
| The three steps | The look-up, the request and the status check in customer words | See repair times, book a repair, check the repair |
| Rules | Anything the plug-in must never do or say in this industry | Never give safety advice on a repair |
| Who would use it | Kinds of businesses, or a business you know (optional) | Independent bike shops |

A good proposal fits one of the 5 engines. If it needs something no engine does, say what in the form: the team then decides whether it needs a new option, which takes longer.

Please do not put customers' personal data, passwords or other secrets in an issue: issues are public.

## After a proposal is accepted

1. The BizPlug team adds the industry to the website's data files: its name, group and copy, its engine and tool names, an example row for each template, and its page on bizplug.ai.
2. The packages are generated again, and the change is reviewed and merged on the website's repository.
3. On that merge, this repository is generated again: the new `plugins/<slug>/` package appears, and the README and this page list it.
4. Once the website with the new industry is deployed, its MCP server URL answers, and businesses in that industry can add the plug-in in the BizPlug portal (https://bizplug.ai/portal).

The team links the change in the issue and closes it. If an industry is not added, the team says why in the issue.

Questions: info@bizplug.ai.

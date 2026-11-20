# Collect the data for the Coworking & Offices plug-in

You are helping a business prepare the data BizPlug needs to deploy its Coworking & Offices ChatGPT plug-in ("Desk and office availability and rates"). Work only from the business's own sources (its website, its systems' exports, and what the owner tells you). Never invent prices, hours, services or answers; leave a cell empty when you cannot confirm it and list it for the owner.

## Never include
- Passwords, API keys or other secrets.
- Card numbers, bank details or government ID numbers.
- Customers' personal data (names, phone numbers, addresses, health or financial details).
- In members.csv: a member business that has not agreed to be listed, or a named person's private email, phone number or address. Company-level contact details only.

## Files to prepare

### business.csv (required, one row)
What the plug-in says about the business and where customers can reach it.

Columns (first row of the file, exactly these names):
- `name` (required): Business name, text. As customers know it. Example: Hub 704 Coworking
- `summary` (required): Summary, text. One or two sentences, in the business's own words. Example: Hub 704 Coworking serves customers in and around Charlotte, NC.
- `email` (required): Public email, email. The address customers may write to. Example: hello@example.com
- `phone`: Public phone, text. With country code. Example: +1 704 555 0100
- `website`: Website, url. Full URL. Example: https://example.com
- `tagline`: What you are, text. A few words shown after your name in ChatGPT, e.g. "Harbor Street Studio – Yoga in Charlotte". Without it, the plug-in's industry is shown. Example: Coworking & Offices in Charlotte
- `logo`: Logo URL, url. Your own logo as an https image, square if you have one. Shown next to your plug-in in the BizPlug portal, and as its icon in ChatGPT. Example: https://example.com/logo.png
- `wordmark`: Wide logo URL, url. Optional: your logo with your name, wider than it is tall, as an https PNG, JPEG or WebP image. From plug-in version 0.25.0 it heads your card in ChatGPT and Claude; without it the card shows the logo above. Example: https://example.com/logo-wide.png
- `address`: Address, text. Street address, if customers visit. Example: 123 Main St, Charlotte, NC 28202
- `city`: City, text.  Example: Charlotte
- `region`: State or country, text.  Example: NC
- `hours`: Opening hours, text. As shown to customers. Example: Mon-Fri 09:00-17:00; Sat 10:00-14:00
- `currency`: Currency, text. ISO code for the prices in the other files. Example: USD
- `notify_email`: Requests go to, email. The team inbox that should receive requests from ChatGPT (not shown to customers). Example: orders@example.com

How to collect it:
1. Copy the name, summary, phone, email, website and address exactly as they appear on the business's website or Google Business Profile.
2. Write the summary in the business's own words (one or two sentences). Do not add claims the business does not make.
3. Ask the owner which inbox should receive requests from ChatGPT and put it in notify_email.

### inventory.csv (required, up to 500 rows)
The options and published rates the plug-in prices from.

Columns (first row of the file, exactly these names):
- `id` (required): Id, text. Short, unique, lowercase with hyphens. Example: dedicated-desk
- `name` (required): Name, text.  Example: Dedicated desk
- `rate` (required): Published rate, number. Per night, day or booking, as the business publishes it. Example: 35
- `capacity`: Capacity, number. Most guests or people. Example: 1
- `description`: Description, text.  Example: Your own desk, per day

How to collect it:
1. Copy each bookable option and its standard published rate from the website or booking engine.
2. Use the rate customers see before discounts. Note in faqs.csv whether taxes and fees are included.

### blocked-dates.csv (optional, up to 2000 rows)
Dates the plug-in should not offer for an option.

Columns (first row of the file, exactly these names):
- `id` (required): Option id, text. An id from inventory.csv. Example: dedicated-desk
- `start` (required): From, date. YYYY-MM-DD. Example: 2026-12-24
- `end` (required): To, date. YYYY-MM-DD, the day after the last blocked night or day. Example: 2026-12-27

How to collect it:
1. Add closures and sold-out periods the owner knows about. This is not a live calendar; BizPlug confirms each request with the business.

### services.csv (optional, up to 100 rows)
A short list of what the business offers, used in answers.

Columns (first row of the file, exactly these names):
- `service` (required): Service, text. One per row. Example: Meeting rooms

How to collect it:
1. List the services from the website's services or about page, one per row, short names only.

### faqs.csv (optional, up to 100 rows)
The plug-in answers customer questions only from these, so it never guesses.

Columns (first row of the file, exactly these names):
- `question` (required): Question, text. How a customer would ask it. Example: Is there parking?
- `answer` (required): Answer, text. The business's answer, in full sentences. Example: Yes, free parking in the garage behind the building.

How to collect it:
1. Take the FAQ page of the website first, then policies (cancellation, delivery, payment, parking, accessibility).
2. Keep each answer factual and current. Leave out anything the owner has not confirmed.

### members.csv (optional, up to 500 rows)
The member businesses people can find in the plug-in and contact directly. List only members that agreed to be listed.

Columns (first row of the file, exactly these names):
- `name` (required): Member business, text. The company's name, as it trades. Example: Northside Design Studio
- `industry`: Industry, text. A short label people can filter by. Use the same label for similar members. Example: Design
- `description`: What it does, text. One sentence. Example: Brand and web design for small businesses.
- `location`: Site or floor, text. Which site or floor, when there is more than one. Example: 2nd floor
- `website`: Website, url. Full URL of the company's website. Example: https://example.com
- `email`: General email, email. The company's general mailbox, never a named person's private address. Example: hello@example.com
- `phone`: General phone, text. The company's switchboard, with country code. Never a personal mobile number. Example: +1 704 555 0142
- `looking_for`: Looking for, text. What the member wants to collaborate on or is looking for. Example: Developers to partner with on client websites
- `offers`: Offers, text. What the member can offer other members or visitors. Example: A free 30-minute brand review for other members
- `level`: Membership level, text. The member's level or tier as you name it, shown as a badge from plug-in version 0.25.0. Example: Corporate
- `logo`: Logo URL, url. The member's own logo as an https PNG, JPEG or WebP image (not SVG). Shown next to its name in the card from plug-in version 0.25.0; without one the card shows its initials. Example: https://example.com/logo.png

How to collect it:
1. List only member businesses that agreed to be listed in the plug-in. Ask each one first, and leave out any that did not answer.
2. Take each member's details from the member itself or its own website: one sentence on what it does, what it is looking for and what it offers, in its own words.
3. A logo is optional: the image address of the logo on the member's own website, a PNG, JPEG or WebP file.
4. Company-level contact details only: a general mailbox and a switchboard number. Never a named person's private email, mobile number or home address; leave the cell empty instead.
5. People contact a member directly with these details. Neither the business nor BizPlug introduces or forwards, so publish only what the member is happy to be contacted on.

### locations.csv (optional, up to 50 rows)
Your locations, with whether you give tours there and when, and whether you sell a day pass there and at what rate. The plug-in offers Book a tour and Day pass only for the locations in this file.

Columns (first row of the file, exactly these names):
- `name` (required): Location, text. The location's name, as customers know it. One row per location. Example: Uptown Tower
- `address`: Address, text. Street address of this location. Example: 200 South Tryon Street, Charlotte, NC
- `tours`: Tours, boolean. yes or no: whether people can ask for a tour of this location. Empty means yes. Example: yes
- `tour_hours`: Tour hours, text. When tours are given, in your own words. The plug-in shows it as written. Example: Monday to Friday, 09:00 to 16:00
- `day_pass`: Day pass, boolean. yes or no: whether you sell a day pass at this location. Empty means no. Example: yes
- `day_pass_rate`: Day pass rate, number. Per person, per day, in the currency of business.csv. Leave empty if you confirm the price yourself. Example: 35
- `day_pass_includes`: Day pass includes, text. What a day pass includes, in one sentence. Example: A hot desk from 08:00 to 18:00, Wi-Fi and coffee

How to collect it:
1. List each location once, with the name used on the business's own website and its street address.
2. Ask the owner which locations give tours and when, and write the tour hours as the business states them. Do not guess hours from the opening hours.
3. Mark a day pass only where the business sells one, with the published rate per person per day and what it includes. Leave the rate empty when the business has not published one: the plug-in then says the business confirms the price.
4. A request for a tour or a day pass is confirmed by the business; nothing here is a time slot or a paid booking.

## Format
- UTF-8 CSV with a header row; comma separated; quote cells that contain commas, quotes or line breaks.
- Numbers without currency signs or thousands separators (4.75, not $4.75).
- Dates as YYYY-MM-DD, times as 24-hour HH:MM.

## Submit
1. The business owner signs in to the BizPlug client portal: https://bizplug.ai/portal. Do not sign in on their behalf.
2. Open the Coworking & Offices plug-in under My plug-ins (add it from the marketplace first).
3. Upload each file under its matching dataset. Fix every error the portal lists and upload again.
4. When the required files show as accepted, press Request test deploy. BizPlug deploys to the test server and confirms by email.
5. After checking the test plug-in in ChatGPT, press Request production. BizPlug confirms plan details with the business before any payment.

## Or submit by API
If the owner gives you a BizPlug API key (they create it at https://bizplug.ai/portal/api; never ask for their password), submit each file directly instead of uploading it. Keep the key out of chats, logs and URLs.
1. List the plug-ins and their ids: `GET https://bizplug.ai/api/portal/v1/plugins` with the header `Authorization: Bearer <key>`.
2. Submit each file: `PUT https://bizplug.ai/api/portal/v1/plugins/<plugin-id>/datasets/<file name>` with `Content-Type: text/csv` and the file as the body, or `Content-Type: application/json` and `{"rows": [{...}]}` keyed by the column names above.
3. The response says whether the file was accepted and lists every error. Fix them and submit again.
4. Tell the owner when the required files are accepted: they press Request test deploy in the portal themselves.

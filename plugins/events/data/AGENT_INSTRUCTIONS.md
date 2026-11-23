# Collect the data for the Events & Conferences plug-in

You are helping a business prepare the data BizPlug needs to deploy its Events & Conferences ChatGPT plug-in ("Venue availability, pricing and date holds"). Work only from the business's own sources (its website, its systems' exports, and what the owner tells you). Never invent prices, hours, services or answers; leave a cell empty when you cannot confirm it and list it for the owner.

## Never include
- Passwords, API keys or other secrets.
- Card numbers, bank details or government ID numbers.
- Customers' personal data (names, phone numbers, addresses, health or financial details).
- In speakers.csv and exhibitors.csv: only what the event itself publishes. Company-level contact details for exhibitors; never a named person's private email, phone number or address.

## Files to prepare

### business.csv (required, one row)
What the plug-in says about the business and where customers can reach it.

Columns (first row of the file, exactly these names):
- `name` (required): Business name, text. As customers know it. Example: The Foundry Event Hall
- `summary` (required): Summary, text. One or two sentences, in the business's own words. Example: The Foundry Event Hall serves customers in and around Charlotte, NC.
- `email` (required): Public email, email. The address customers may write to. Example: hello@example.com
- `phone`: Public phone, text. With country code. Example: +1 704 555 0100
- `website`: Website, url. Full URL. Example: https://example.com
- `tagline`: What you are, text. A few words shown after your name in ChatGPT, e.g. "Harbor Street Studio – Yoga in Charlotte". Without it, the plug-in's industry is shown. Example: Events & Conferences in Charlotte
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
- `id` (required): Id, text. Short, unique, lowercase with hyphens. Example: main-hall
- `name` (required): Name, text.  Example: Main Hall
- `rate` (required): Published rate, number. Per night, day or booking, as the business publishes it. Example: 2500
- `capacity`: Capacity, number. Most guests or people. Example: 250
- `description`: Description, text.  Example: 250 standing or 180 seated, per day
- `day_rates`: Weekday rates, text. Optional: a different rate on some weekdays, as day:rate separated by semicolons (sun, mon, tue, wed, thu, fri, sat). Shown on the booking calendar from plug-in version 0.29.0. Example: fri:2500;sat:2500
- `per`: Booked once, text. Optional, from plug-in version 0.41.0, and only where bookings are by the night: leave empty for a room priced per night. Write person or booking for something booked once for the stay, such as an activity or a transfer: the rate is then per person or per booking. Example: 

How to collect it:
1. Copy each bookable option and its standard published rate from the website or booking engine.
2. Use the rate customers see before discounts. Note in faqs.csv whether taxes and fees are included.

### blocked-dates.csv (optional, up to 2000 rows)
Dates the plug-in should not offer for an option.

Columns (first row of the file, exactly these names):
- `id` (required): Option id, text. An id from inventory.csv. Example: main-hall
- `start` (required): From, date. YYYY-MM-DD. Example: 2026-12-24
- `end` (required): To, date. YYYY-MM-DD, the day after the last blocked night or day. Example: 2026-12-27

How to collect it:
1. Add closures and sold-out periods the owner knows about. This is not a live calendar; BizPlug confirms each request with the business.

### rates.csv (optional, up to 2000 rows)
Seasons and holidays with their own rate (from plug-in version 0.29.0). A date range here wins over the weekday rates and the standard rate.

Columns (first row of the file, exactly these names):
- `id` (required): Option id, text. An id from inventory.csv. Example: main-hall
- `start` (required): From, date. YYYY-MM-DD, the first day at this rate. Example: 2026-12-20
- `end` (required): To, date. YYYY-MM-DD, the last day at this rate. Example: 2027-01-03
- `rate` (required): Rate, number. Per night, day or person, as in inventory.csv. Example: 2500

How to collect it:
1. Copy the business's own published seasonal or holiday rates. Only rates customers can see; BizPlug confirms each request with the business.

### services.csv (optional, up to 100 rows)
A short list of what the business offers, used in answers.

Columns (first row of the file, exactly these names):
- `service` (required): Service, text. One per row. Example: In-house AV and lighting

How to collect it:
1. List the services from the website's services or about page, one per row, short names only.

### faqs.csv (optional, up to 100 rows)
The plug-in answers customer questions only from these, so it never guesses.

Columns (first row of the file, exactly these names):
- `question` (required): Question, text. How a customer would ask it. Example: Can we bring our own caterer?
- `answer` (required): Answer, text. The business's answer, in full sentences. Example: Yes, from our approved caterer list.

How to collect it:
1. Take the FAQ page of the website first, then policies (cancellation, delivery, payment, parking, accessibility).
2. Keep each answer factual and current. Leave out anything the owner has not confirmed.

### sessions.csv (optional, up to 1000 rows)
The sessions of the show or conference, for Agenda.

Columns (first row of the file, exactly these names):
- `date` (required): Date, date. YYYY-MM-DD. Example: 2026-09-01
- `start`: Starts, time. 24-hour HH:MM, local time. Example: 09:00
- `end`: Ends, time. 24-hour HH:MM. Example: 09:50
- `title` (required): Session, text. The session's title, as published. Example: Opening keynote
- `format`: Format, text. Keynote, panel, workshop, break… Example: Panel
- `speakers`: Speakers, text. The speakers' names, separated by semicolons, as in speakers.csv. Example: Jane Doe; John Smith
- `stage`: Where, text. Stage, hall or room. Example: Main stage
- `description`: About, text. One or two sentences. Example: What the session covers.

How to collect it:
1. Copy the agenda from the event's own programme page: one row per session, with its date, times, title and speakers.

### speakers.csv (optional, up to 1000 rows)
The speakers, for Speakers.

Columns (first row of the file, exactly these names):
- `name` (required): Name, text. As the event lists the speaker. Example: Jane Doe
- `title`: Title, text. Job title. Example: Chief Executive Officer
- `company`: Company, text. Organisation. Example: Example Events
- `bio`: Bio, text. The bio the event published. Example: Twenty years in live events.
- `linkedin`: LinkedIn, url. Public profile, if the event links to it. Example: https://www.linkedin.com/in/janedoe

How to collect it:
1. Take each speaker from the event's own speakers page: name, title, company and the bio published there. Nothing the event does not publish.

### exhibitors.csv (optional, up to 2000 rows)
The exhibitors, for Exhibitors & sponsors. People contact an exhibitor directly with these details.

Columns (first row of the file, exactly these names):
- `name` (required): Exhibitor, text. The company, as it trades. Example: Northside Staging
- `category`: Category, text. A short label people can filter by. Example: Stands & staging
- `description`: What it does, text. One sentence. Example: Stage and stand builds for exhibitions.
- `website`: Website, url. Full URL. Example: https://example.com
- `email`: General email, email. The company's general mailbox, never a named person's. Example: hello@example.com
- `phone`: General phone, text. The company's switchboard, with country code. Example: +974 4000 0000
- `city`: City, text. Where the company is based. Example: Doha
- `stand`: Stand, text. Stand or booth number, if published. Example: B12
- `logo`: Logo URL, url. The company's logo as an https PNG, JPEG or WebP image (not SVG), shown from plug-in version 0.28.0. Example: https://example.com/logo.png
- `about`: About, text. Two to four sentences from the company's own website, shown under More about. Example: Stage and stand builder working across the Gulf since 2012.
- `highlights`: Highlights, text. Main products or services, separated by semicolons. Example: Custom stands; Modular systems; LED walls
- `linkedin`: LinkedIn, url. The company's page on LinkedIn. Example: https://www.linkedin.com/company/example
- `sources`: Sources, text. The company's own pages these details come from, separated by semicolons. Example: https://example.com/about

How to collect it:
1. Take the exhibitors from the event's own exhibitor list, with what the event or the exhibitor publishes about each.
2. Company-level contact details only: a general mailbox and a switchboard number. Never a named person's private email or mobile number.

### sponsors.csv (optional, up to 500 rows)
The sponsors and partners, for Exhibitors & sponsors.

Columns (first row of the file, exactly these names):
- `name` (required): Sponsor, text. As the event lists it. Example: Example Bank
- `group`: Group, text. The event's own grouping. Example: Gold sponsors
- `role`: Role, text. As published. Example: Official banking partner
- `description`: About, text. One sentence. Example: 
- `website`: Website, url. Full URL. Example: https://example.com
- `logo`: Logo URL, url. The company's logo as an https PNG, JPEG or WebP image (not SVG), shown from plug-in version 0.28.0. Example: https://example.com/logo.png
- `about`: About, text. Two to four sentences from the company's own website, shown under More about. Example: Regional bank serving businesses and households.
- `highlights`: Highlights, text. Main products or services, separated by semicolons. Example: Business banking; Trade finance
- `linkedin`: LinkedIn, url. The company's page on LinkedIn. Example: https://www.linkedin.com/company/example
- `sources`: Sources, text. The company's own pages these details come from, separated by semicolons. Example: https://example.com/about

How to collect it:
1. Copy the sponsors and partners from the event's own sponsors page, in its own groups.

### social.csv (optional, up to 60 rows)
Where to follow you, and your latest posts with their pictures, shown under Social media in the plug-in. Feeds (YouTube, podcast, blog, Substack, Medium, Bluesky, Mastodon) are read automatically; for LinkedIn, Instagram, X, Facebook and TikTok you pin the posts you want shown. From plug-in version 0.35.0 a YouTube video plays inside the card.

Columns (first row of the file, exactly these names):
- `kind` (required): Kind, text. "follow" for a profile to follow, "feed" for a public feed BizPlug reads (YouTube channel, podcast or blog RSS, Substack, Medium, Bluesky or Mastodon profile), "post" for one post you pin. Example: follow
- `network`: Network, text. instagram, linkedin, facebook, x, tiktok, youtube, threads, bluesky, mastodon, podcast, blog, substack, medium, pinterest or whatsapp. Left empty, it is read from the address. Example: instagram
- `url` (required): Address, url. The profile, the feed or the post, as an https address. Example: https://www.instagram.com/yourbusiness/
- `image`: Picture, url. For a pinned post: its picture, an https PNG, JPEG or WebP image. Example: https://example.com/post.jpg
- `text`: Text, text. For a pinned post: its caption, or the first lines of it. Example: Our new menu is here.
- `date`: Date, text. For a pinned post: YYYY-MM-DD. Example: 2026-11-20

How to collect it:
1. Take the profiles from the links on the business's own website (header or footer).
2. Add a feed row for a YouTube channel, a podcast or blog RSS, a Substack, Medium, Bluesky or Mastodon profile; its latest posts appear by themselves.
3. Pin a few recent posts from LinkedIn, Instagram, X, Facebook or TikTok with their own picture and text: only posts the business published.
4. A pinned post may also be one of the business's own YouTube videos (a watch, youtu.be or Shorts address): it plays inside the card, and needs no picture.

## Format
- UTF-8 CSV with a header row; comma separated; quote cells that contain commas, quotes or line breaks.
- Numbers without currency signs or thousands separators (4.75, not $4.75).
- Dates as YYYY-MM-DD, times as 24-hour HH:MM.

## Submit
1. The business owner signs in to the BizPlug client portal: https://bizplug.ai/portal. Do not sign in on their behalf.
2. Open the Events & Conferences plug-in under My plug-ins (add it from the marketplace first).
3. Upload each file under its matching dataset. Fix every error the portal lists and upload again.
4. When the required files show as accepted, press Request test deploy. BizPlug deploys to the test server and confirms by email.
5. After checking the test plug-in in ChatGPT, press Request production. BizPlug confirms plan details with the business before any payment.

## Or submit by API
If the owner gives you a BizPlug API key (they create it at https://bizplug.ai/portal/api; never ask for their password), submit each file directly instead of uploading it. Keep the key out of chats, logs and URLs.
1. List the plug-ins and their ids: `GET https://bizplug.ai/api/portal/v1/plugins` with the header `Authorization: Bearer <key>`.
2. Submit each file: `PUT https://bizplug.ai/api/portal/v1/plugins/<plugin-id>/datasets/<file name>` with `Content-Type: text/csv` and the file as the body, or `Content-Type: application/json` and `{"rows": [{...}]}` keyed by the column names above.
3. The response says whether the file was accepted and lists every error. Fix them and submit again.
4. Tell the owner when the required files are accepted: they press Request test deploy in the portal themselves.

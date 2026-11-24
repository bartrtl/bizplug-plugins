# Collect the data for the Chambers of Commerce & Business Associations plug-in

You are helping a business prepare the data BizPlug needs to deploy its Chambers of Commerce & Business Associations ChatGPT plug-in ("Chamber information, membership enquiries and member businesses"). Work only from the business's own sources (its website, its systems' exports, and what the owner tells you). Never invent prices, hours, services or answers; leave a cell empty when you cannot confirm it and list it for the owner.

## Never include
- Passwords, API keys or other secrets.
- Card numbers, bank details or government ID numbers.
- Customers' personal data (names, phone numbers, addresses, health or financial details).
- In members.csv: a member business that has not agreed to be listed, or a named person's private email, phone number or address. Company-level contact details only.
- Member-only documents, board papers or anything the chamber does not publish to the public.
- The plug-in's own rule: Share only what the chamber or association has published about membership, dues, events and programs. Never promise that membership will be approved, or any introduction, business lead or policy outcome, and never take payment of dues in chat.

## Files to prepare

### business.csv (required, one row)
What the plug-in says about the business and where customers can reach it.

Columns (first row of the file, exactly these names):
- `name` (required): Business name, text. As customers know it. Example: Lakeview Business Chamber
- `summary` (required): Summary, text. One or two sentences, in the business's own words. Example: Lakeview Business Chamber serves customers in and around Charlotte, NC.
- `email` (required): Public email, email. The address customers may write to. Example: hello@example.com
- `phone`: Public phone, text. With country code. Example: +1 704 555 0100
- `website`: Website, url. Full URL. Example: https://example.com
- `tagline`: What you are, text. A few words shown after your name in ChatGPT, e.g. "Harbor Street Studio – Yoga in Charlotte". Without it, the plug-in's industry is shown. Example: Chambers of Commerce & Business Associations in Charlotte
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

### records.csv (optional, up to 5000 rows)
Statuses customers can look up by reference number. Keep it current; the plug-in shows what is here.

Columns (first row of the file, exactly these names):
- `ref` (required): Reference, text. What the customer quotes. Example: ENQ-2207
- `status` (required): Status, text.  Example: Membership call scheduled
- `note`: Note, text. No personal data. Example: The membership team replies by email
- `updated`: Updated, date. YYYY-MM-DD. Example: 2026-11-14

How to collect it:
1. Export open references and their statuses from the case or ticket system. Remove names, addresses and any personal details first.

### services.csv (optional, up to 100 rows)
A short list of what the business offers, used in answers.

Columns (first row of the file, exactly these names):
- `service` (required): Service, text. One per row. Example: Monthly networking breakfast

How to collect it:
1. List the services from the website's services or about page, one per row, short names only.

### faqs.csv (optional, up to 100 rows)
The plug-in answers customer questions only from these, so it never guesses.

Columns (first row of the file, exactly these names):
- `question` (required): Question, text. How a customer would ask it. Example: Who can join the chamber?
- `answer` (required): Answer, text. The business's answer, in full sentences. Example: Any business or organisation based in the region, from sole traders to large employers.

How to collect it:
1. Take the FAQ page of the website first, then policies (cancellation, delivery, payment, parking, accessibility).
2. Keep each answer factual and current. Leave out anything the owner has not confirmed.

### members.csv (optional, up to 500 rows)
The member businesses people can find in the plug-in and contact directly. List only members that agreed to be listed.

Columns (first row of the file, exactly these names):
- `name` (required): Member business, text. The company's name, as it trades. Example: Northside Design Studio
- `industry`: Industry, text. A short label people can filter by. Use the same label for similar members. Example: Design
- `description`: What it does, text. One sentence. Example: Brand and web design for small businesses.
- `location`: City or area, text. Where the member is based, so people can filter by area. Example: South End, Charlotte
- `website`: Website, url. Full URL of the company's website. Example: https://example.com
- `email`: General email, email. The company's general mailbox, never a named person's private address. Example: hello@example.com
- `phone`: General phone, text. The company's switchboard, with country code. Never a personal mobile number. Example: +1 704 555 0142
- `looking_for`: Looking for, text. What the member wants to collaborate on or is looking for. Example: Developers to partner with on client websites
- `offers`: Offers, text. What the member can offer other members or visitors. Example: A discount on brand reviews for fellow members
- `level`: Membership level, text. The member's level or tier as you name it, shown as a badge from plug-in version 0.25.0. Example: Corporate
- `about`: About, text. Two to four sentences from the member's own website, shown under More about from plug-in version 0.26.0. Example: Brand and web design studio working with small businesses since 2015.
- `highlights`: Highlights, text. A few main services or programmes, separated by semicolons. Example: Brand identity; Websites; Packaging
- `address`: Address, text. The member's office address, as it publishes it. Example: Tornado Tower, West Bay, Doha
- `linkedin`: LinkedIn, url. The member's company page on LinkedIn. Example: https://www.linkedin.com/company/example
- `sources`: Sources, text. The member's own pages these details come from, separated by semicolons. Example: https://example.com/about
- `logo`: Logo URL, url. The member's own logo as an https PNG, JPEG or WebP image (not SVG). Shown next to its name in the card from plug-in version 0.25.0; without one the card shows its initials. Example: https://example.com/logo.png

How to collect it:
1. List only member businesses that agreed to be listed in the plug-in. Ask each one first, and leave out any that did not answer.
2. Take each member's details from the member itself or its own website: one sentence on what it does, what it is looking for and what it offers, in its own words.
3. A logo is optional: the image address of the logo on the member's own website, a PNG, JPEG or WebP file.
4. Company-level contact details only: a general mailbox and a switchboard number. Never a named person's private email, mobile number or home address; leave the cell empty instead.
5. People contact a member directly with these details. Neither the business nor BizPlug introduces or forwards, so publish only what the member is happy to be contacted on.

### committees.csv (optional, up to 60 rows)
The committees and working groups members can join, shown under Committees in the plug-in.

Columns (first row of the file, exactly these names):
- `name` (required): Committee, text. As the chamber names it. Example: Hospitality and Tourism Committee
- `description`: What it works on, text. One to three sentences, in the chamber's own words. Example: Initiatives and discussions on tourism as a growth sector.
- `chair`: Chair, text. Who chairs it, only as the chamber publishes it. Example: Jane Doe, Example Hotel
- `url`: Page, url. The committee's page, or the page that describes it. Example: https://example.org/committees

How to collect it:
1. Take the committees from the chamber's own site: its committees page, or where its events and news name them.
2. Name a chair only when the chamber publishes who it is.

### news.csv (optional, up to 60 rows)
The latest news and the upcoming and recent events, shown under News & events in the plug-in.

Columns (first row of the file, exactly these names):
- `title` (required): Title, text.  Example: Annual Evening of Giving Thanks
- `kind`: News or event, text. "news" or "event". An event dated before today shows as a past event. Example: event
- `date`: Date, text. YYYY-MM-DD, or YYYY-MM when only the month is published. Example: 2026-11-20
- `location`: Where, text. For an event. Example: Four Seasons Hotel, Doha
- `summary`: Summary, text. One or two sentences. Example: Members, sponsors and partners came together to give thanks.
- `url`: Page, url. Where to read more or register. Example: https://example.org/events

How to collect it:
1. Take news and events from the chamber's own site, newest first. Keep upcoming events current: replace the file when the calendar changes.

### newsletter.csv (optional, one row)
The newsletter and where to subscribe, shown under News & events in the plug-in.

Columns (first row of the file, exactly these names):
- `name` (required): Newsletter, text. Its name, or a plain description if it has none. Example: Chamber newsletter
- `description`: What it covers, text. In the chamber's own words. Example: Special offers and opportunities for members.
- `frequency`: How often, text. Only when the chamber says so. Example: Monthly
- `signup_url`: Sign-up page, url.  Example: https://example.org/#newsletter
- `archive_url`: Past issues, url.  Example: https://example.org/newsletter

How to collect it:
1. Take the newsletter's name, sign-up page and archive from the chamber's own site.

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
1. The business owner signs in to the BizPlug client portal: https://www.bizplug.ai/portal. Do not sign in on their behalf.
2. Open the Chambers of Commerce & Business Associations plug-in under My plug-ins (add it from the marketplace first).
3. Upload each file under its matching dataset. Fix every error the portal lists and upload again.
4. When the required files show as accepted, press Request test deploy. BizPlug deploys to the test server and confirms by email.
5. After checking the test plug-in in ChatGPT, press Request production. BizPlug confirms plan details with the business before any payment.

## Or submit by API
If the owner gives you a BizPlug API key (they create it at https://www.bizplug.ai/portal/api; never ask for their password), submit each file directly instead of uploading it. Keep the key out of chats, logs and URLs.
1. List the plug-ins and their ids: `GET https://www.bizplug.ai/api/portal/v1/plugins` with the header `Authorization: Bearer <key>`.
2. Submit each file: `PUT https://www.bizplug.ai/api/portal/v1/plugins/<plugin-id>/datasets/<file name>` with `Content-Type: text/csv` and the file as the body, or `Content-Type: application/json` and `{"rows": [{...}]}` keyed by the column names above.
3. The response says whether the file was accepted and lists every error. Fix them and submit again.
4. Tell the owner when the required files are accepted: they press Request test deploy in the portal themselves.

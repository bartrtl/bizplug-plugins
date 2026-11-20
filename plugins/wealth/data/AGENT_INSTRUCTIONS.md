# Collect the data for the Wealth & Investing plug-in

You are helping a business prepare the data BizPlug needs to deploy its Wealth & Investing ChatGPT plug-in ("Book an intro meeting with an advisor"). Work only from the business's own sources (its website, its systems' exports, and what the owner tells you). Never invent prices, hours, services or answers; leave a cell empty when you cannot confirm it and list it for the owner.

## Never include
- Passwords, API keys or other secrets.
- Card numbers, bank details or government ID numbers.
- Customers' personal data (names, phone numbers, addresses, health or financial details).
- The plug-in's own rule: Information and scheduling only: never give financial, investment, tax or legal advice, and never ask for account numbers or ID numbers.

## Files to prepare

### business.csv (required, one row)
What the plug-in says about the business and where customers can reach it.

Columns (first row of the file, exactly these names):
- `name` (required): Business name, text. As customers know it. Example: Summit Wealth Partners
- `summary` (required): Summary, text. One or two sentences, in the business's own words. Example: Summit Wealth Partners serves customers in and around Charlotte, NC.
- `email` (required): Public email, email. The address customers may write to. Example: hello@example.com
- `phone`: Public phone, text. With country code. Example: +1 704 555 0100
- `website`: Website, url. Full URL. Example: https://example.com
- `tagline`: What you are, text. A few words shown after your name in ChatGPT, e.g. "Harbor Street Studio – Yoga in Charlotte". Without it, the plug-in's industry is shown. Example: Wealth & Investing in Charlotte
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

### bookable.csv (required, up to 200 rows)
The appointment types customers can request.

Columns (first row of the file, exactly these names):
- `id` (required): Id, text. Short, unique, lowercase with hyphens. Example: intro-meeting
- `name` (required): Name, text.  Example: Intro meeting with an advisor
- `duration_min`: Duration (minutes), number.  Example: 45
- `price`: Price, number. Leave empty if not published. Example: 0
- `description`: Description, text.  Example: Get to know how we work

How to collect it:
1. List each appointment, class, tour or call type from the booking page or price list, with its length and published price.

### open-hours.csv (required, up to 7 rows)
When appointments can be requested, per weekday.

Columns (first row of the file, exactly these names):
- `day` (required): Day, day. sun, mon, tue, wed, thu, fri or sat. Leave a day out if closed. Example: mon
- `open` (required): From, time. 24-hour HH:MM. Example: 09:00
- `close` (required): To, time. 24-hour HH:MM. Example: 17:00

How to collect it:
1. Use the hours appointments are taken, which can differ from opening hours. One row per open day.

### services.csv (optional, up to 100 rows)
A short list of what the business offers, used in answers.

Columns (first row of the file, exactly these names):
- `service` (required): Service, text. One per row. Example: Retirement planning

How to collect it:
1. List the services from the website's services or about page, one per row, short names only.

### faqs.csv (optional, up to 100 rows)
The plug-in answers customer questions only from these, so it never guesses.

Columns (first row of the file, exactly these names):
- `question` (required): Question, text. How a customer would ask it. Example: Is there a minimum to work with you?
- `answer` (required): Answer, text. The business's answer, in full sentences. Example: Our published minimum is 250,000 dollars in investable assets.

How to collect it:
1. Take the FAQ page of the website first, then policies (cancellation, delivery, payment, parking, accessibility).
2. Keep each answer factual and current. Leave out anything the owner has not confirmed.

### social.csv (optional, up to 60 rows)
Where to follow you, and your latest posts with their pictures, shown under Social media in the plug-in. Feeds (YouTube, podcast, blog, Substack, Medium, Bluesky, Mastodon) are read automatically; for LinkedIn, Instagram, X, Facebook and TikTok you pin the posts you want shown.

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

## Format
- UTF-8 CSV with a header row; comma separated; quote cells that contain commas, quotes or line breaks.
- Numbers without currency signs or thousands separators (4.75, not $4.75).
- Dates as YYYY-MM-DD, times as 24-hour HH:MM.

## Submit
1. The business owner signs in to the BizPlug client portal: https://bizplug.ai/portal. Do not sign in on their behalf.
2. Open the Wealth & Investing plug-in under My plug-ins (add it from the marketplace first).
3. Upload each file under its matching dataset. Fix every error the portal lists and upload again.
4. When the required files show as accepted, press Request test deploy. BizPlug deploys to the test server and confirms by email.
5. After checking the test plug-in in ChatGPT, press Request production. BizPlug confirms plan details with the business before any payment.

## Or submit by API
If the owner gives you a BizPlug API key (they create it at https://bizplug.ai/portal/api; never ask for their password), submit each file directly instead of uploading it. Keep the key out of chats, logs and URLs.
1. List the plug-ins and their ids: `GET https://bizplug.ai/api/portal/v1/plugins` with the header `Authorization: Bearer <key>`.
2. Submit each file: `PUT https://bizplug.ai/api/portal/v1/plugins/<plugin-id>/datasets/<file name>` with `Content-Type: text/csv` and the file as the body, or `Content-Type: application/json` and `{"rows": [{...}]}` keyed by the column names above.
3. The response says whether the file was accepted and lists every error. Fix them and submit again.
4. Tell the owner when the required files are accepted: they press Request test deploy in the portal themselves.

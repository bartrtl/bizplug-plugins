# Collect the data for the SaaS & Software plug-in

You are helping a business prepare the data BizPlug needs to deploy its SaaS & Software ChatGPT plug-in ("Book a product demo"). Work only from the business's own sources (its website, its systems' exports, and what the owner tells you). Never invent prices, hours, services or answers; leave a cell empty when you cannot confirm it and list it for the owner.

## Never include
- Passwords, API keys or other secrets.
- Card numbers, bank details or government ID numbers.
- Customers' personal data (names, phone numbers, addresses, health or financial details).

## Files to prepare

### business.csv (required, one row)
What the plug-in says about the business and where customers can reach it.

Columns (first row of the file, exactly these names):
- `name` (required): Business name, text. As customers know it. Example: Taskline
- `summary` (required): Summary, text. One or two sentences, in the business's own words. Example: Taskline serves customers in and around Charlotte, NC.
- `email` (required): Public email, email. The address customers may write to. Example: hello@example.com
- `phone`: Public phone, text. With country code. Example: +1 704 555 0100
- `website`: Website, url. Full URL. Example: https://example.com
- `tagline`: What you are, text. A few words shown after your name in ChatGPT, e.g. "Harbor Street Studio – Yoga in Charlotte". Without it, the plug-in's industry is shown. Example: SaaS & Software in Charlotte
- `logo`: Logo URL, url. Your own logo as an https image, square if you have one. Shown next to your plug-in in the BizPlug portal, and as its icon in ChatGPT. Example: https://example.com/logo.png
- `wordmark`: Wide logo URL, url. Optional: your logo with your name, wider than it is tall, as an https PNG, JPEG or WebP image. From plug-in version 0.25.0 it heads your card in ChatGPT and Claude; without it the card shows the logo above. Example: https://example.com/logo-wide.png
- `address`: Address, text. Street address, if customers visit. Example: 123 Main St, Charlotte, NC 28202
- `city`: City, text.  Example: Charlotte
- `region`: State or country, text.  Example: NC
- `hours`: Opening hours, text. As shown to customers. Example: Mon-Fri 09:00-17:00; Sat 10:00-14:00
- `currency`: Currency, text. ISO code for the prices in the other files. Example: USD
- `notify_email`: Requests go to, email. The team inbox that should receive requests from ChatGPT (not shown to customers). Example: orders@example.com
- `pricing_url`: Pricing page, url. Where your plans and prices are. Pricing links here; a plug-in listed in ChatGPT's directory only links here. Example: https://example.com/pricing
- `support_url`: Support page, url. Your help centre or support contact page. Example: https://example.com/support
- `docs_url`: Documentation, url. Where your help articles and guides live. Example: https://docs.example.com
- `status_url`: Status page, url. Your service status page, if you have one. Example: https://status.example.com

How to collect it:
1. Copy the name, summary, phone, email, website and address exactly as they appear on the business's website or Google Business Profile.
2. Write the summary in the business's own words (one or two sentences). Do not add claims the business does not make.
3. Ask the owner which inbox should receive requests from ChatGPT and put it in notify_email.

### bookable.csv (required, up to 200 rows)
The appointment types customers can request.

Columns (first row of the file, exactly these names):
- `id` (required): Id, text. Short, unique, lowercase with hyphens. Example: product-demo
- `name` (required): Name, text.  Example: Product demo
- `duration_min`: Duration (minutes), number.  Example: 30
- `price`: Price, number. Leave empty if not published. Example: 0
- `description`: Description, text.  Example: Live walkthrough for your team

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
- `service` (required): Service, text. One per row. Example: Onboarding

How to collect it:
1. List the services from the website's services or about page, one per row, short names only.

### faqs.csv (optional, up to 100 rows)
The plug-in answers customer questions only from these, so it never guesses.

Columns (first row of the file, exactly these names):
- `question` (required): Question, text. How a customer would ask it. Example: Is there a free trial?
- `answer` (required): Answer, text. The business's answer, in full sentences. Example: Yes, 14 days with no card needed.

How to collect it:
1. Take the FAQ page of the website first, then policies (cancellation, delivery, payment, parking, accessibility).
2. Keep each answer factual and current. Leave out anything the owner has not confirmed.

### features.csv (optional, up to 200 rows)
What the product does, so people can find the feature they need, the plan it is on and the guide that explains it.

Columns (first row of the file, exactly these names):
- `name` (required): Feature, text. A short name, as on your website. Example: CRM sync
- `description`: What it does, text. One or two sentences. Example: Sends contacts and notes to Salesforce, HubSpot and Pipedrive.
- `plan`: Plan, text. The plan that includes it, if not every plan does. Example: Team
- `guide_url`: Guide, url. The help article that explains it. Example: https://docs.example.com/crm-sync

How to collect it:
1. Take the features from the product's features or product page, one per row, in the product's own words.
2. Put the plan only where a feature is limited to some plans.

### plans.csv (optional, up to 20 rows)
What Pricing shows. A plug-in listed in ChatGPT's directory shows none of it and links to the pricing page instead.

Columns (first row of the file, exactly these names):
- `name` (required): Plan, text. As on the pricing page. Example: Team
- `price`: Price, text. As written on the pricing page, with the currency. Example: $99
- `billing`: Billing, text. per month, per year, one-time, or custom. Example: per month
- `includes`: Includes, text. The main things the plan includes. Example: Up to 10 members, CRM sync

How to collect it:
1. Copy the plans exactly from the current pricing page; leave out discounts that end soon.

### guides.csv (optional, up to 300 rows)
What Help & guides searches and links to.

Columns (first row of the file, exactly these names):
- `title` (required): Title, text. The article's title. Example: Connect your CRM
- `url` (required): Link, url. The article's own address. Example: https://docs.example.com/connect-crm
- `topic`: Topic, text. A short label people can filter by. Example: Integrations
- `summary`: Summary, text. One sentence. Example: Connect Salesforce or HubSpot in three steps.

How to collect it:
1. List the articles from the help centre or documentation: title, link and topic. Public articles only.

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
2. Open the SaaS & Software plug-in under My plug-ins (add it from the marketplace first).
3. Upload each file under its matching dataset. Fix every error the portal lists and upload again.
4. When the required files show as accepted, press Request test deploy. BizPlug deploys to the test server and confirms by email.
5. After checking the test plug-in in ChatGPT, press Request production. BizPlug confirms plan details with the business before any payment.

## Or submit by API
If the owner gives you a BizPlug API key (they create it at https://www.bizplug.ai/portal/api; never ask for their password), submit each file directly instead of uploading it. Keep the key out of chats, logs and URLs.
1. List the plug-ins and their ids: `GET https://www.bizplug.ai/api/portal/v1/plugins` with the header `Authorization: Bearer <key>`.
2. Submit each file: `PUT https://www.bizplug.ai/api/portal/v1/plugins/<plugin-id>/datasets/<file name>` with `Content-Type: text/csv` and the file as the body, or `Content-Type: application/json` and `{"rows": [{...}]}` keyed by the column names above.
3. The response says whether the file was accepted and lists every error. Fix them and submit again.
4. Tell the owner when the required files are accepted: they press Request test deploy in the portal themselves.

# Collect the data for the Destination Management Companies plug-in

You are helping a business prepare the data BizPlug needs to deploy its Destination Management Companies ChatGPT plug-in ("Tailor-made packages with a price breakdown, and proposals day by day"). Work only from the business's own sources (its website, its systems' exports, and what the owner tells you). Never invent prices, hours, services or answers; leave a cell empty when you cannot confirm it and list it for the owner.

## Never include
- Passwords, API keys or other secrets.
- Card numbers, bank details or government ID numbers.
- Customers' personal data (names, phone numbers, addresses, health or financial details).
- Passport numbers, dates of birth, visa details, card numbers or health details of travellers, in any file. A proposal with a code holds only what the client needs: the itinerary, the bookings and the price breakdown.
- The plug-in's own rule: Share only the packages, proposals and prices the company published; a proposal's price holds only until the date it gives, and the company confirms every booking. Never invent a flight, hotel, time, booking reference or price.

## Files to prepare

### business.csv (required, one row)
What the plug-in says about the business and where customers can reach it.

Columns (first row of the file, exactly these names):
- `name` (required): Business name, text. As customers know it. Example: Andes Path DMC
- `summary` (required): Summary, text. One or two sentences, in the business's own words. Example: Andes Path DMC serves customers in and around Charlotte, NC.
- `email` (required): Public email, email. The address customers may write to. Example: hello@example.com
- `phone`: Public phone, text. With country code. Example: +1 704 555 0100
- `website`: Website, url. Full URL. Example: https://example.com
- `tagline`: What you are, text. A few words shown after your name in ChatGPT, e.g. "Harbor Street Studio – Yoga in Charlotte". Without it, the plug-in's industry is shown. Example: Destination Management Companies in Charlotte
- `logo`: Logo URL, url. Your own logo as an https image, square if you have one. Shown next to your plug-in in the BizPlug portal, and as its icon in ChatGPT. Example: https://example.com/logo.png
- `wordmark`: Wide logo URL, url. Optional: your logo with your name, wider than it is tall, as an https PNG, JPEG or WebP image. From plug-in version 0.25.0 it heads your card in ChatGPT and Claude; without it the card shows the logo above. Example: https://example.com/logo-wide.png
- `address`: Address, text. Street address, if customers visit. Example: 123 Main St, Charlotte, NC 28202
- `city`: City, text.  Example: Charlotte
- `region`: State or country, text.  Example: NC
- `hours`: Opening hours, text. As shown to customers. Example: Mon-Fri 09:00-17:00; Sat 10:00-14:00
- `currency`: Currency, text. ISO code for the prices in the other files. Example: USD
- `trip_layout`: Trip layout, text. plan (the default: a photo and the days as a list that opens in place) or cards (the days as a grid of picture cards, each day on its own screen). Travellers can switch in the card. Example: plan
- `notify_email`: Requests go to, email. The team inbox that should receive requests from ChatGPT (not shown to customers). Example: orders@example.com

How to collect it:
1. Copy the name, summary, phone, email, website and address exactly as they appear on the business's website or Google Business Profile.
2. Write the summary in the business's own words (one or two sentences). Do not add claims the business does not make.
3. Ask the owner which inbox should receive requests from ChatGPT and put it in notify_email.

### price-rules.csv (required, up to 500 rows)
The published prices the plug-in builds estimates from. Estimates are never final prices.

Columns (first row of the file, exactly these names):
- `id` (required): Id, text. Short, unique, lowercase with hyphens. Example: private-guide-day
- `name` (required): Name, text.  Example: Private guide, full day
- `base` (required): Base price, number. Call-out or starting price. Example: 0
- `per_unit`: Price per unit, number. Added for each unit. Example: 220
- `unit`: Unit, text. What one unit is (room, sq ft, hour, item). Example: day
- `minimum`: Minimum, number. Smallest total charged. Example: 220
- `note`: Note, text. Shown with the estimate. Example: English-speaking licensed guide; entrance fees are separate

How to collect it:
1. Copy the published price list or rate card. Only include prices the business is happy to publish as estimates.

### services.csv (optional, up to 100 rows)
A short list of what the business offers, used in answers.

Columns (first row of the file, exactly these names):
- `service` (required): Service, text. One per row. Example: Tailor-made group programmes

How to collect it:
1. List the services from the website's services or about page, one per row, short names only.

### faqs.csv (optional, up to 100 rows)
The plug-in answers customer questions only from these, so it never guesses.

Columns (first row of the file, exactly these names):
- `question` (required): Question, text. How a customer would ask it. Example: How long is a proposal's price valid?
- `answer` (required): Answer, text. The business's answer, in full sentences. Example: Two weeks from the date we send it; hotels are held only once you confirm.

How to collect it:
1. Take the FAQ page of the website first, then policies (cancellation, delivery, payment, parking, accessibility).
2. Keep each answer factual and current. Leave out anything the owner has not confirmed.

### trips.csv (optional, up to 200 rows)
One row per package or proposal. Without a code it is a sample package anyone may browse; with a code it is one client's proposal or trip, opened only by the client with that code.

Columns (first row of the file, exactly these names):
- `id` (required): Trip id, text. Short, unique, lowercase with hyphens. trip_days.csv, trip_items.csv and trip_prices.csv name the trip by it. Example: peru-10-days
- `name` (required): Name, text. As the traveller knows the trip. Example: Peru & Machu Picchu in 10 days
- `code`: Trip code, text. Only for one traveller's or group's own trip: at least 8 letters or digits, hard to guess (e.g. DANUBE-7Q4K-2M). Give it to them yourself; it is never shown or listed. Empty for an itinerary anyone may browse. Example: 
- `kind`: Kind, text. One of: tour, cruise, package, proposal. Example: proposal
- `start`: First day, date. YYYY-MM-DD. Empty for an itinerary without fixed dates. Example: 2027-05-10
- `end`: Last day, date. YYYY-MM-DD. Example: 2027-05-14
- `travellers`: Who travels, text. Only on a trip with a code, in words: "2 adults", "Lopez family (4)". Never passport or ID numbers. Example: 
- `people`: Number of travellers, number. For the price per person of a proposal. Example: 
- `summary`: Summary, text. One or two sentences. Example: 
- `image`: Cover picture, url. Optional: an https photo. Without it the first day's picture is used. Example: 
- `image_credit`: Photo credit, text. Optional: who took the photo and its licence, shown on it, e.g. Photo: Jane Doe, CC BY-SA 4.0. Needed for most free-licence photos. Example: 
- `price_from`: From price, number. Optional: the published starting price, number only. Example: 
- `price_per`: Price per, text. person or group. Example: person
- `includes`: Included, text. Optional, separated by semicolons. Example: 
- `excludes`: Not included, text. Optional, separated by semicolons. Example: 
- `contact_name`: Trip contact, text. Optional: the travel designer for this proposal. Example: 
- `contact_role`: Contact's role, text. Optional. Example: 
- `contact_phone`: Contact phone, text. Optional: a work number, with country code. Example: 
- `contact_email`: Contact email, email. Optional: a work address. Example: 
- `contact_whatsapp`: Contact WhatsApp, text. Optional: a work WhatsApp number with country code. Example: 
- `status`: Status, text. Optional, on a trip with a code: Confirmed, Deposit paid, Proposal... Example: 
- `valid_until`: Price valid until, date. Optional, for a proposal: YYYY-MM-DD. Example: 
- `book_url`: Booking page, url. Optional: your own page to book this trip (https). Example: 
- `notes`: Notes, text. Optional: anything the traveller should know. Example: 

How to collect it:
1. Copy each itinerary from your own brochure or website, in your own words.
2. A trip with a code holds one traveller's or group's details: give the code to them yourself, and never reuse a code. Use at least 8 letters or digits that cannot be guessed from the name or dates.
3. Never put passport numbers, dates of birth, card numbers or health details in any file.

### trip_days.csv (optional, up to 2000 rows)
Each day of a trip as a card with its own picture: the title, the place, what happens, meals and where the night is.

Columns (first row of the file, exactly these names):
- `trip` (required): Trip id, text. The id from trips.csv. Example: blue-danube-5
- `day` (required): Day, number. 1 for the first day. Example: 1
- `date`: Date, date. YYYY-MM-DD; worked out from the trip's first day when empty. Example: 
- `title` (required): Title, text.  Example: Embark in Passau
- `place`: Place, text. Where the day is; the card offers directions to it. Example: Passau, Germany
- `summary`: What happens, text. A short paragraph. Example: 
- `image`: Picture, url. An https photo of the day. Example: 
- `image_credit`: Photo credit, text. Optional: who took the photo and its licence, shown on it. Example: 
- `highlights`: Highlights, text. Optional, separated by semicolons. Example: 
- `meals`: Meals, text. Optional: Breakfast, lunch, dinner. Example: 
- `overnight`: Overnight, text. Optional: the hotel or ship. Example: 
- `maps_url`: Map link, url. Optional: a Google Maps or Apple Maps link for the day (https). Example: 

How to collect it:
1. One row per day. A picture per day makes the card: use your own photos, or ones you have the right to use.

### trip_items.csv (optional, up to 5000 rows)
What happens on a day, by the hour: flights, hotels, the ship, transfers, trains, activities and meals, each with its own buttons for the website and directions.

Columns (first row of the file, exactly these names):
- `trip` (required): Trip id, text. The id from trips.csv. Example: blue-danube-5
- `day` (required): Day, number.  Example: 1
- `time`: Time, text. HH:MM, or Morning, Afternoon, Evening. Example: 15:00
- `kind`: Kind, text. One of: flight, hotel, cruise, transfer, train, activity, meal, guide, note. Example: cruise
- `title` (required): Title, text.  Example: Board the ship
- `details`: Details, text. What to know, in a sentence or two. Example: 
- `place`: Place, text.  Example: 
- `address`: Address, text. For directions. Example: 
- `maps_url`: Directions link, url. Optional (https). Example: 
- `url`: Website, url. Optional: the hotel, airline, museum or activity's own page (https). Example: 
- `url_label`: Website button, text. Optional: the button's words, such as Hotel website or Tickets. Example: 
- `phone`: Phone, text. Optional: the place's public number. Example: 
- `image`: Picture, url. Optional (https). Example: 
- `image_credit`: Photo credit, text. Optional: who took the photo and its licence, shown on it. Example: 
- `reference`: Booking reference, text. Only on a trip with a code: the hotel or flight confirmation the traveller may need. Example: 
- `carrier`: Airline or operator, text. Flights and trains. Example: 
- `number`: Flight or train number, text.  Example: 
- `from`: From, text. Flights, trains and transfers. Example: 
- `to`: To, text.  Example: 
- `depart`: Departs, text. HH:MM. Example: 
- `arrive`: Arrives, text. HH:MM. Example: 
- `check_in`: Check-in, text. Hotels and ships: HH:MM or a date. Example: 
- `check_out`: Check-out, text.  Example: 
- `room`: Room or cabin, text. Optional. Example: 

How to collect it:
1. Booking references only on trips with a code, and only what the traveller needs at check-in. Never passport numbers or card details.

### trip_prices.csv (optional, up to 2000 rows)
A package's or proposal's price, line by line: the card groups the lines by category with subtotals, the total and the price per person.

Columns (first row of the file, exactly these names):
- `trip` (required): Trip id, text. The id from trips.csv. Example: peru-10-days
- `item` (required): Item, text.  Example: Hotel Monasterio, Cusco: deluxe room
- `category`: Category, text. Accommodation, Flights, Transfers, Guides, Activities, Meals, Fees... Example: Accommodation
- `quantity`: Quantity, number.  Example: 3
- `unit`: Unit, text.  Example: nights
- `unit_price`: Unit price, number. Number only. Example: 620
- `total` (required): Line total, number. Number only, in your currency. Example: 1860
- `note`: Note, text. Optional. Example: 

How to collect it:
1. Only prices you are ready to quote. Put the date the proposal's price holds until in trips.csv (valid_until).

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
2. Open the Destination Management Companies plug-in under My plug-ins (add it from the marketplace first).
3. Upload each file under its matching dataset. Fix every error the portal lists and upload again.
4. When the required files show as accepted, press Request test deploy. BizPlug deploys to the test server and confirms by email.
5. After checking the test plug-in in ChatGPT, press Request production. BizPlug confirms plan details with the business before any payment.

## Or submit by API
If the owner gives you a BizPlug API key (they create it at https://www.bizplug.ai/portal/api; never ask for their password), submit each file directly instead of uploading it. Keep the key out of chats, logs and URLs.
1. List the plug-ins and their ids: `GET https://www.bizplug.ai/api/portal/v1/plugins` with the header `Authorization: Bearer <key>`.
2. Submit each file: `PUT https://www.bizplug.ai/api/portal/v1/plugins/<plugin-id>/datasets/<file name>` with `Content-Type: text/csv` and the file as the body, or `Content-Type: application/json` and `{"rows": [{...}]}` keyed by the column names above.
3. The response says whether the file was accepted and lists every error. Fix them and submit again.
4. Tell the owner when the required files are accepted: they press Request test deploy in the portal themselves.

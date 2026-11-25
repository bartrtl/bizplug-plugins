# Collect the data for the Tour Operators plug-in

You are helping a business prepare the data BizPlug needs to deploy its Tour Operators ChatGPT plug-in ("Tour departures, price per traveller and trips day by day"). Work only from the business's own sources (its website, its systems' exports, and what the owner tells you). Never invent prices, hours, services or answers; leave a cell empty when you cannot confirm it and list it for the owner.

## Never include
- Passwords, API keys or other secrets.
- Card numbers, bank details or government ID numbers.
- Customers' personal data (names, phone numbers, addresses, health or financial details).
- Passport numbers, dates of birth, visa details, card numbers or health details of travellers, in any file. A trip with a code holds only what the traveller needs: dates, flights, hotels and booking references.
- The plug-in's own rule: Share only the itinerary, departures and prices the operator published; never invent a flight, hotel, time or booking reference, and never say a place on a tour is confirmed, since the operator confirms every booking.

## Files to prepare

### business.csv (required, one row)
What the plug-in says about the business and where customers can reach it.

Columns (first row of the file, exactly these names):
- `name` (required): Business name, text. As customers know it. Example: Riverbend Journeys
- `summary` (required): Summary, text. One or two sentences, in the business's own words. Example: Riverbend Journeys serves customers in and around Charlotte, NC.
- `email` (required): Public email, email. The address customers may write to. Example: hello@example.com
- `phone`: Public phone, text. With country code. Example: +1 704 555 0100
- `website`: Website, url. Full URL. Example: https://example.com
- `tagline`: What you are, text. A few words shown after your name in ChatGPT, e.g. "Harbor Street Studio – Yoga in Charlotte". Without it, the plug-in's industry is shown. Example: Tour Operators in Charlotte
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

### inventory.csv (required, up to 500 rows)
The options and published rates the plug-in prices from.

Columns (first row of the file, exactly these names):
- `id` (required): Id, text. Short, unique, lowercase with hyphens. Example: blue-danube-5-classic
- `name` (required): Name, text.  Example: Blue Danube in 5 days, classic cabin
- `rate` (required): Published rate, number. Per night, day or booking, as the business publishes it. Example: 1890
- `capacity`: Capacity, number. Most guests or people. Example: 40
- `description`: Description, text.  Example: Passau to Budapest by river ship, all meals and guided visits, per traveller
- `day_rates`: Weekday rates, text. Optional: a different rate on some weekdays, as day:rate separated by semicolons (sun, mon, tue, wed, thu, fri, sat). Shown on the booking calendar from plug-in version 0.29.0. Example: fri:1890;sat:1890
- `per`: Booked once, text. Optional, from plug-in version 0.41.0, and only where bookings are by the night: leave empty for a room priced per night. Write person or booking for something booked once for the stay, such as an activity or a transfer: the rate is then per person or per booking. Example: 
- `start`: Event: first day, date. Optional, from plug-in version 0.42.0, and only where bookings are for one date: the first day of an event with fixed dates, as YYYY-MM-DD. A list with events is shown as an events calendar, month by month. Example: 
- `end`: Event: last day, date. Optional: the event's last day, as YYYY-MM-DD. Leave empty for a one-day event. Example: 
- `category`: Event: category, text. Optional: the tab the event is filed under, in your own words, such as Football or Workshops. Example: 
- `place`: Event: place, text. Optional: where the event is held. Example: 
- `featured`: Event: featured, boolean. Optional, from plug-in version 0.44.0: true puts the event in the Featured row above your events calendar. Feature a few, not all. Example: 
- `free`: Event: free entry, boolean. Optional: true when entry is free. Example: 
- `url`: Event: its own page, url. Optional: the event's own page for tickets or details (https). With one, the plug-in sends people there and takes no request. Example: 
- `url_label`: Event: what the page is, text. Optional: Tickets or Website. Example: 
- `maps_url`: Event: directions, url. Optional: a directions link (https). Example: 
- `amenities`: Features, text. Optional, from plug-in version 0.48.0 (vacation rentals): what the home has, separated by semicolons, such as Pet friendly;Pool table;Bunk room. Which home fits matches a group's wishes against them; write No pets for a home that takes no dogs. Example: 

How to collect it:
1. Copy each bookable option and its standard published rate from the website or booking engine.
2. Use the rate customers see before discounts. Note in faqs.csv whether taxes and fees are included.

### blocked-dates.csv (optional, up to 2000 rows)
Dates the plug-in should not offer for an option.

Columns (first row of the file, exactly these names):
- `id` (required): Option id, text. An id from inventory.csv. Example: blue-danube-5-classic
- `start` (required): From, date. YYYY-MM-DD. Example: 2026-12-24
- `end` (required): To, date. YYYY-MM-DD, the day after the last blocked night or day. Example: 2026-12-27

How to collect it:
1. Add closures and sold-out periods the owner knows about. This is not a live calendar; BizPlug confirms each request with the business.

### rates.csv (optional, up to 2000 rows)
Seasons and holidays with their own rate (from plug-in version 0.29.0). A date range here wins over the weekday rates and the standard rate.

Columns (first row of the file, exactly these names):
- `id` (required): Option id, text. An id from inventory.csv. Example: blue-danube-5-classic
- `start` (required): From, date. YYYY-MM-DD, the first day at this rate. Example: 2026-12-20
- `end` (required): To, date. YYYY-MM-DD, the last day at this rate. Example: 2027-01-03
- `rate` (required): Rate, number. Per night, day or person, as in inventory.csv. Example: 1890

How to collect it:
1. Copy the business's own published seasonal or holiday rates. Only rates customers can see; BizPlug confirms each request with the business.

### services.csv (optional, up to 100 rows)
A short list of what the business offers, used in answers.

Columns (first row of the file, exactly these names):
- `service` (required): Service, text. One per row. Example: Airport transfers

How to collect it:
1. List the services from the website's services or about page, one per row, short names only.

### faqs.csv (optional, up to 100 rows)
The plug-in answers customer questions only from these, so it never guesses.

Columns (first row of the file, exactly these names):
- `question` (required): Question, text. How a customer would ask it. Example: Are excursions included?
- `answer` (required): Answer, text. The business's answer, in full sentences. Example: Yes: the guided visits in each port are included; optional extras are marked in the itinerary.

How to collect it:
1. Take the FAQ page of the website first, then policies (cancellation, delivery, payment, parking, accessibility).
2. Keep each answer factual and current. Leave out anything the owner has not confirmed.

### trips.csv (optional, up to 200 rows)
One row per trip. Without a code it is an itinerary anyone may browse; with a code it is one traveller's (or group's) own trip, opened only with that code.

Columns (first row of the file, exactly these names):
- `id` (required): Trip id, text. Short, unique, lowercase with hyphens. trip_days.csv, trip_items.csv and trip_prices.csv name the trip by it. Example: blue-danube-5
- `name` (required): Name, text. As the traveller knows the trip. Example: Blue Danube in 5 days
- `code`: Trip code, text. Only for one traveller's or group's own trip: at least 8 letters or digits, hard to guess (e.g. DANUBE-7Q4K-2M). Give it to them yourself; it is never shown or listed. Empty for an itinerary anyone may browse. Example: 
- `kind`: Kind, text. One of: tour, cruise, package, proposal. Example: cruise
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
- `contact_name`: Trip contact, text. Optional: the tour leader or cruise director. Example: 
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
2. Open the Tour Operators plug-in under My plug-ins (add it from the marketplace first).
3. Upload each file under its matching dataset. Fix every error the portal lists and upload again.
4. When the required files show as accepted, press Request test deploy. BizPlug deploys to the test server and confirms by email.
5. After checking the test plug-in in ChatGPT, press Request production. BizPlug confirms plan details with the business before any payment.

## Or submit by API
If the owner gives you a BizPlug API key (they create it at https://www.bizplug.ai/portal/api; never ask for their password), submit each file directly instead of uploading it. Keep the key out of chats, logs and URLs.
1. List the plug-ins and their ids: `GET https://www.bizplug.ai/api/portal/v1/plugins` with the header `Authorization: Bearer <key>`.
2. Submit each file: `PUT https://www.bizplug.ai/api/portal/v1/plugins/<plugin-id>/datasets/<file name>` with `Content-Type: text/csv` and the file as the body, or `Content-Type: application/json` and `{"rows": [{...}]}` keyed by the column names above.
3. The response says whether the file was accepted and lists every error. Fix them and submit again.
4. Tell the owner when the required files are accepted: they press Request test deploy in the portal themselves.

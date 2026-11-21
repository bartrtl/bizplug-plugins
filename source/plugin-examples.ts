// Example values for the CSV templates, per industry, so an events venue sees venue spaces and a dentist sees
// dental visits instead of one generic example per engine. Every business here is made up; numbers are
// illustrative only. plugin-data.ts reads these; `pnpm plugins:check` fails if an industry has none.
import type { Engine } from "@/lib/industry-functions";

type OrderItem = { id: string; name: string; price: string; category: string; description: string };
type StayItem = { id: string; name: string; rate: string; capacity: string; description: string };
type ApptItem = { id: string; name: string; duration_min: string; price: string; description: string };
type QuoteItem = { id: string; name: string; base: string; per_unit: string; unit: string; minimum: string; note: string };
type TrackItem = { ref: string; status: string; note: string };

type Common = { business: string; service: string; faq: [string, string] };
export type IndustryExample =
  | (Common & { engine: "order"; item: OrderItem })
  | (Common & { engine: "stay"; item: StayItem })
  | (Common & { engine: "appt"; item: ApptItem })
  | (Common & { engine: "quote"; item: QuoteItem })
  | (Common & { engine: "track"; item: TrackItem });

const order = (business: string, item: OrderItem, service: string, faq: [string, string]): IndustryExample => ({ engine: "order", business, item, service, faq });
const stay = (business: string, item: StayItem, service: string, faq: [string, string]): IndustryExample => ({ engine: "stay", business, item, service, faq });
const appt = (business: string, item: ApptItem, service: string, faq: [string, string]): IndustryExample => ({ engine: "appt", business, item, service, faq });
const quote = (business: string, item: QuoteItem, service: string, faq: [string, string]): IndustryExample => ({ engine: "quote", business, item, service, faq });
const track = (business: string, item: TrackItem, service: string, faq: [string, string]): IndustryExample => ({ engine: "track", business, item, service, faq });

export const INDUSTRY_EXAMPLES: Record<string, IndustryExample> = {
  // order
  restaurants: order("Magnolia Kitchen", { id: "chicken-sandwich", name: "Crispy chicken sandwich", price: "13.50", category: "Mains", description: "Pickles, slaw, brioche bun" }, "Curbside pickup", ["Do you have vegetarian dishes?", "Yes, vegetarian dishes are marked (V) on the menu."]),
  "coffee-shops": order("Harbor Street Coffee", { id: "latte-12oz", name: "Latte 12 oz", price: "4.75", category: "Coffee", description: "Oat or dairy milk" }, "Mobile order-ahead", ["Do you have oat milk?", "Yes, oat and almond milk at no extra charge."]),
  florists: order("Petal & Stem", { id: "white-roses-12", name: "Dozen white roses", price: "65.00", category: "Bouquets", description: "Hand-tied, with eucalyptus" }, "Local delivery and pickup", ["Do you deliver on Sundays?", "No, Monday to Saturday only. Order by 1pm for same-day delivery."]),
  "food-delivery": order("Queen City Eats", { id: "chicken-pad-thai", name: "Chicken pad thai", price: "15.95", category: "Noodles", description: "Rice noodles, peanuts, lime" }, "Delivery within 5 miles", ["Where do you deliver?", "Within 5 miles of uptown Charlotte."]),
  "ghost-kitchens": order("Southend Kitchen Collective", { id: "double-smash-burger", name: "Double smash burger", price: "12.00", category: "Burgers", description: "Two patties, American cheese" }, "Several brands in one order", ["Can I order from two brands at once?", "Yes, every brand cooks in the same kitchen, so it arrives together."]),
  "meal-kits": order("Fresh Plate Kits", { id: "family-3x4", name: "Family plan: 3 meals for 4", price: "89.99", category: "Plans", description: "12 servings a week" }, "Weekly delivery", ["Can I skip a week?", "Yes, skip any week before Thursday midnight."]),
  grocery: order("Eastway Market", { id: "bananas-lb", name: "Bananas (per lb)", price: "0.69", category: "Produce", description: "Sold by the pound" }, "Curbside pickup", ["Is there a minimum for pickup orders?", "Yes, pickup orders start at 35 dollars."]),
  "convenience-stores": order("Corner Stop", { id: "spring-water-24pk", name: "Spring water, 24-pack", price: "5.99", category: "Drinks", description: "16.9 oz bottles" }, "Counter pickup", ["How long do you hold a pickup order?", "We hold orders for 2 hours."]),
  retail: order("Plaza Home & Gift", { id: "cedar-sage-candle", name: "Cedar & sage candle, 8 oz", price: "24.00", category: "Home", description: "Soy wax, 45-hour burn" }, "Gift wrapping", ["Can I return an item?", "Yes, within 30 days with a receipt."]),
  fashion: order("NoDa Threads", { id: "linen-shirt-white-m", name: "Linen shirt, white, size M", price: "58.00", category: "Shirts", description: "100% linen" }, "Free trouser hemming", ["How long do you hold items for try-on?", "We hold reserved items for 48 hours."]),
  electronics: order("Circuit Corner", { id: "usb-c-charger-65w", name: "65W USB-C charger", price: "39.99", category: "Chargers", description: "For most laptops and phones" }, "Device setup", ["Do you price match?", "Yes, we match local stores' advertised prices."]),
  furniture: order("Oak & Iron Furniture", { id: "oak-dining-table-6", name: "Oak dining table, seats 6", price: "1290", category: "Dining", description: "Solid white oak, 72 in" }, "White-glove delivery", ["How long does delivery take?", "In-stock pieces are delivered within 2 weeks."]),
  "beauty-ecommerce": order("Glow Lab Skincare", { id: "vitamin-c-serum-30ml", name: "Vitamin C serum, 30 ml", price: "32.00", category: "Serums", description: "15% vitamin C" }, "Free samples with every order", ["Are your products cruelty-free?", "Yes, none of our products are tested on animals."]),
  subscriptions: order("Roast Club", { id: "coffee-box-monthly", name: "Monthly coffee box, 2 bags", price: "34.00", category: "Coffee", description: "Two 12 oz bags, roasted to order" }, "Pause or skip anytime", ["Can I pause my subscription?", "Yes, pause or skip from your account at any time."]),

  // stay
  hospitality: stay("Harbor Street Hotel", { id: "deluxe-king", name: "Deluxe King Room", rate: "189", capacity: "2", description: "King bed, city view" }, "Airport shuttle", ["What time is check-in?", "Check-in is from 3pm and check-out is by 11am."]),
  casinos: stay("Riverbend Resort & Casino", { id: "resort-double-queen", name: "Resort room, two queens", rate: "159", capacity: "4", description: "Two queen beds, pool view" }, "Live shows", ["Is there a minimum age?", "Guests must be 21 or older on the casino floor."]),
  events: stay("The Foundry Event Hall", { id: "main-hall", name: "Main Hall", rate: "2500", capacity: "250", description: "250 standing or 180 seated, per day" }, "In-house AV and lighting", ["Can we bring our own caterer?", "Yes, from our approved caterer list."]),
  "wedding-services": stay("Willow Creek Weddings", { id: "full-day-package", name: "Full-day wedding package", rate: "6800", capacity: "150", description: "Ceremony, reception and coordinator" }, "Day-of coordination", ["How far ahead should we book?", "Most couples book 9 to 12 months ahead."]),
  "bars-nightlife": stay("Velvet Room", { id: "vip-booth", name: "VIP booth", rate: "300", capacity: "8", description: "Bottle service, minimum spend" }, "Guest list", ["Is there a dress code?", "Smart casual: no athletic wear or flip-flops."]),
  travel: stay("Blue Ridge Day Tours", { id: "asheville-day-trip", name: "Asheville day trip", rate: "129", capacity: "14", description: "Small-group van tour, lunch included, per traveller" }, "Hotel pickup", ["What is your cancellation policy?", "Free cancellation up to 48 hours before departure."]),
  "cruise-lines": stay("Coastal Star Cruises", { id: "balcony-7n-caribbean", name: "Balcony cabin, 7-night Caribbean", rate: "1299", capacity: "2", description: "Per person, double occupancy" }, "Shore excursions", ["Are port fees included?", "No, port fees and taxes are added at booking."]),
  "theme-parks": stay("Thunder Falls Park", { id: "day-pass-adult", name: "1-day pass, adult", rate: "69", capacity: "1", description: "All rides and shows" }, "Fast-lane passes", ["Can I bring food into the park?", "Sealed snacks and water bottles are allowed."]),
  museums: stay("Carolina Science Museum", { id: "general-admission", name: "General admission, timed entry", rate: "18", capacity: "1", description: "Ages 13 and up" }, "Guided group tours", ["Is the museum wheelchair accessible?", "Yes, every gallery is step-free."]),
  "sports-teams": stay("Charlotte Riverhawks", { id: "lower-bowl-sideline", name: "Lower bowl, sideline", rate: "85", capacity: "1", description: "Sections 101 to 110, per seat" }, "Season tickets", ["Can I bring a bag?", "Only clear bags up to 12 x 6 x 12 inches."]),
  "car-rental": stay("Crown Car Rental", { id: "midsize-suv", name: "Midsize SUV", rate: "64", capacity: "5", description: "Toyota RAV4 or similar, per day" }, "Airport pickup", ["What do I need to rent a car?", "A valid driver's license and a credit card in your name."]),
  coworking: stay("Hub 704 Coworking", { id: "dedicated-desk", name: "Dedicated desk", rate: "35", capacity: "1", description: "Your own desk, per day" }, "Meeting rooms", ["Is there parking?", "Yes, free parking in the garage behind the building."]),

  // appt
  healthcare: appt("SouthPark Family Medicine", { id: "new-patient-visit", name: "New patient visit", duration_min: "45", price: "", description: "First visit with a doctor" }, "Annual physicals", ["Do you take my insurance?", "We take most major plans; call us to check yours."]),
  dental: appt("Bright Smile Dental", { id: "cleaning-exam", name: "Cleaning and exam", duration_min: "60", price: "150", description: "X-rays included if due" }, "Teeth whitening", ["Do you see children?", "Yes, from age 3."]),
  optometry: appt("ClearView Eye Care", { id: "eye-exam", name: "Comprehensive eye exam", duration_min: "30", price: "95", description: "Vision test and eye health check" }, "Contact lens fitting", ["Do you take vision insurance?", "Yes, most major vision plans."]),
  dermatology: appt("Skin Health Dermatology", { id: "skin-check", name: "Full-body skin check", duration_min: "30", price: "", description: "With a board-certified dermatologist" }, "Mole checks", ["How should I prepare for a skin check?", "Please come without makeup or nail polish."]),
  chiropractic: appt("Align Chiropractic", { id: "first-visit", name: "First visit and adjustment", duration_min: "45", price: "85", description: "Consultation and first adjustment" }, "Massage therapy", ["Do I need a referral?", "No referral is needed."]),
  "mental-health": appt("Lakeside Counseling", { id: "intake-session", name: "Intake session", duration_min: "50", price: "", description: "First session with a counselor" }, "Video sessions", ["Do you offer online sessions?", "Yes, sessions can be in person or by video."]),
  veterinary: appt("Paws & Claws Animal Hospital", { id: "wellness-exam", name: "Wellness exam", duration_min: "30", price: "65", description: "Yearly check-up and vaccine review" }, "Pet dental cleaning", ["Which animals do you see?", "Dogs, cats and rabbits."]),
  "med-spa": appt("Lumière Med Spa", { id: "injectables-consult", name: "Injectables consultation", duration_min: "30", price: "0", description: "Free consultation with a nurse injector" }, "Laser hair removal", ["Is the consultation free?", "Yes, all consultations are free."]),
  beauty: appt("Studio Blu Salon", { id: "cut-blow-dry", name: "Cut and blow-dry", duration_min: "60", price: "75", description: "With a senior stylist" }, "Balayage", ["What is your late policy?", "If you are more than 15 minutes late we may need to reschedule."]),
  fitness: appt("Ironworks Fitness", { id: "trial-class", name: "Free trial class", duration_min: "45", price: "0", description: "Any group class, first visit" }, "Personal training", ["What should I bring?", "Water, a towel and training shoes."]),
  automotive: appt("Queen City Auto Care", { id: "synthetic-oil-change", name: "Synthetic oil change", duration_min: "45", price: "79", description: "Up to 5 quarts, filter included" }, "Test drives", ["Do you offer loaner cars?", "Yes, for services longer than 3 hours."]),
  "home-health": appt("CarePoint Home Health", { id: "in-home-assessment", name: "In-home care assessment", duration_min: "60", price: "0", description: "A nurse visits to plan care" }, "Personal care", ["Which areas do you serve?", "Mecklenburg and Union counties."]),
  "senior-care": appt("Maple Grove Senior Living", { id: "community-tour", name: "Community tour", duration_min: "45", price: "0", description: "Tour with lunch in our dining room" }, "Assisted living", ["Can family members join the tour?", "Yes, family members are welcome."]),
  "real-estate": appt("Keystone Realty", { id: "showing-123-elm", name: "Showing: 123 Elm St", duration_min: "30", price: "0", description: "3 bed, 2 bath, listed at 425,000" }, "Buyer representation", ["Do I need a pre-approval to see a home?", "No, but we recommend getting one first."]),
  legal: appt("Hartwell Law", { id: "initial-consultation", name: "Initial consultation", duration_min: "30", price: "150", description: "Meet an attorney about your matter" }, "Estate planning", ["Is the first consultation free?", "No, initial consultations are 150 dollars for 30 minutes."]),
  accounting: appt("Ledger & Co. CPAs", { id: "tax-prep-consult", name: "Tax preparation consult", duration_min: "30", price: "0", description: "Review what you need to file" }, "Bookkeeping", ["What should I bring?", "Last year's return and this year's tax forms."]),
  "financial-services": appt("First Avenue Bank", { id: "account-opening", name: "Account opening meeting", duration_min: "30", price: "0", description: "Meet a banker in branch or by video" }, "Business banking", ["Can I meet by video?", "Yes, meetings can be in branch or by video."]),
  wealth: appt("Summit Wealth Partners", { id: "intro-meeting", name: "Intro meeting with an advisor", duration_min: "45", price: "0", description: "Get to know how we work" }, "Retirement planning", ["Is there a minimum to work with you?", "Our published minimum is 250,000 dollars in investable assets."]),
  lending: appt("Homeward Mortgage", { id: "mortgage-consult", name: "Mortgage consultation", duration_min: "30", price: "0", description: "Talk through loan options" }, "First-time buyer loans", ["How long does pre-approval take?", "Usually 1 to 2 business days."]),
  tutoring: appt("Bright Minds Tutoring", { id: "sat-prep-trial", name: "SAT prep trial session", duration_min: "60", price: "0", description: "One-on-one, first session free" }, "Math tutoring", ["Do you tutor online?", "Yes, in person or online."]),
  childcare: appt("Little Acorns Learning Center", { id: "center-tour", name: "Center tour", duration_min: "30", price: "0", description: "Meet the director and see the classrooms" }, "Infant care", ["What ages do you take?", "From 6 weeks to 5 years."]),
  photography: appt("Golden Hour Photography", { id: "family-session", name: "Family portrait session", duration_min: "60", price: "350", description: "Outdoors, 20 edited photos" }, "Headshots", ["When do we get the photos?", "Within 2 weeks of the session."]),
  education: appt("Carolina Prep Academy", { id: "admissions-info-session", name: "Admissions info session", duration_min: "60", price: "0", description: "Tour and Q&A for families" }, "After-school programs", ["When are applications due?", "Applications for next fall close on February 1."]),
  universities: appt("Piedmont State University", { id: "campus-tour", name: "Campus tour", duration_min: "90", price: "0", description: "Student-led walking tour" }, "Academic advising", ["Is there visitor parking?", "Yes, free visitor parking in Deck 2."]),
  consulting: appt("Northline Consulting", { id: "discovery-call-30", name: "30-minute discovery call", duration_min: "30", price: "0", description: "See whether we fit your project" }, "Operations reviews", ["Do you work with small businesses?", "Yes, most of our clients have 10 to 200 staff."]),
  agencies: appt("Brightwave Agency", { id: "strategy-call", name: "Strategy call", duration_min: "45", price: "0", description: "Talk through goals and budget" }, "Paid social campaigns", ["What is your minimum budget?", "Our projects start at 5,000 dollars."]),
  saas: appt("Taskline", { id: "product-demo", name: "Product demo", duration_min: "30", price: "0", description: "Live walkthrough for your team" }, "Onboarding", ["Is there a free trial?", "Yes, 14 days with no card needed."]),
  "dev-tools": appt("Stackforge", { id: "technical-demo", name: "Technical demo", duration_min: "45", price: "0", description: "With a solutions engineer" }, "Onboarding workshops", ["Do you have an API?", "Yes, a REST API with full documentation."]),
  cybersecurity: appt("Sentinel Security Partners", { id: "assessment-call", name: "Security assessment call", duration_min: "30", price: "0", description: "Scope a penetration test" }, "Penetration testing", ["Do you work with small companies?", "Yes, we work with teams of any size."]),
  recruiting: appt("TalentBridge Recruiting", { id: "employer-intro-call", name: "Employer intro call", duration_min: "30", price: "0", description: "Talk about a role you are hiring for" }, "Executive search", ["Do candidates pay a fee?", "No, candidates never pay us."]),
  "hr-comms": appt("Pulse HR", { id: "platform-demo", name: "Platform demo", duration_min: "30", price: "0", description: "See the employee app" }, "Employee surveys", ["Does it work on phones?", "Yes, employees use it on any phone."]),
  "religious-orgs": appt("Grace Community Church", { id: "sunday-service", name: "Sunday service", duration_min: "75", price: "0", description: "10:30am, everyone welcome" }, "Youth group", ["Is there childcare during the service?", "Yes, for ages 0 to 5."]),

  // quote
  hvac: quote("Comfort Air HVAC", { id: "ac-tune-up", name: "AC tune-up", base: "129", per_unit: "45", unit: "extra unit", minimum: "129", note: "Parts extra" }, "Furnace repair", ["Do you offer emergency service?", "Yes, 24/7, with an after-hours call-out fee."]),
  plumbing: quote("Flowright Plumbing", { id: "drain-clearing", name: "Drain clearing", base: "149", per_unit: "50", unit: "extra drain", minimum: "149", note: "Camera inspection extra" }, "Water heater installation", ["Are you licensed?", "Yes, licensed and insured in North Carolina."]),
  electricians: quote("Bright Spark Electric", { id: "outlet-install", name: "Outlet installation", base: "95", per_unit: "65", unit: "extra outlet", minimum: "95", note: "Permit fees extra" }, "Panel upgrades", ["Do you pull permits?", "Yes, for all work that needs one."]),
  "home-services": quote("Handy Helpers", { id: "handyman-hourly", name: "Handyman, hourly", base: "85", per_unit: "75", unit: "extra hour", minimum: "85", note: "Materials extra" }, "Furniture assembly", ["Is there a minimum charge?", "Yes, one hour."]),
  cleaning: quote("Sparkle Home Cleaning", { id: "standard-clean", name: "Standard clean", base: "120", per_unit: "25", unit: "bedroom", minimum: "120", note: "Deep cleans cost more" }, "Move-out cleans", ["Do I need to provide supplies?", "No, we bring everything."]),
  landscaping: quote("Greenleaf Landscaping", { id: "lawn-mowing", name: "Lawn mowing", base: "45", per_unit: "10", unit: "1,000 sq ft", minimum: "45", note: "Edging and blowing included" }, "Mulching", ["How often do you mow?", "Weekly or every two weeks, as you prefer."]),
  "pest-control": quote("Shield Pest Control", { id: "general-pest", name: "General pest treatment", base: "129", per_unit: "0.05", unit: "sq ft", minimum: "129", note: "Inside and outside" }, "Termite inspections", ["Are treatments safe for pets?", "Yes, once dry, usually after an hour."]),
  solar: quote("SunPath Solar", { id: "residential-system", name: "Residential solar system", base: "0", per_unit: "2.90", unit: "watt", minimum: "12000", note: "Rough range; the site survey sets the price" }, "Battery storage", ["Do you handle permits?", "Yes, we file the permits and utility paperwork."]),
  "moving-storage": quote("Easy Move Charlotte", { id: "local-move-2br", name: "Local move, 2-bedroom", base: "600", per_unit: "150", unit: "extra hour", minimum: "600", note: "3 movers and a truck" }, "Storage units", ["Do you supply boxes?", "Yes, boxes and tape can be added to any move."]),
  catering: quote("Savor Catering", { id: "buffet-package", name: "Buffet package", base: "200", per_unit: "28", unit: "guest", minimum: "500", note: "Delivery and setup included" }, "Staffed events", ["What is the minimum headcount?", "Our minimum is 20 guests."]),
  logistics: quote("Carolina Freight Co.", { id: "ltl-pallet", name: "LTL pallet shipment", base: "175", per_unit: "0.12", unit: "lb", minimum: "175", note: "Fuel surcharge extra" }, "Warehousing", ["Do you pick up from residential addresses?", "Yes, with a liftgate fee."]),
  insurance: quote("Piedmont Insurance Agency", { id: "auto-insurance", name: "Auto insurance", base: "0", per_unit: "", unit: "", minimum: "", note: "A licensed agent quotes the premium" }, "Home insurance", ["Which carriers do you work with?", "We compare quotes from several carriers."]),
  telecom: quote("Metro Fiber", { id: "fiber-500", name: "Fiber 500 Mbps", base: "55", per_unit: "", unit: "", minimum: "55", note: "Per month, installation included" }, "Business internet", ["Is there a contract?", "No, plans are month to month."]),
  crypto: quote("BlockBridge", { id: "business-onboarding", name: "Business account onboarding", base: "0", per_unit: "0.5", unit: "% of trade value", minimum: "", note: "From the published fee schedule" }, "Business accounts", ["How long does onboarding take?", "Usually 2 to 3 business days once documents are checked."]),

  // track
  government: track("City of Riverton 311", { ref: "REQ-1042", status: "In progress", note: "Pothole crew scheduled this week" }, "Bulk trash pickup", ["How do I report a pothole?", "Submit a service request with the street and nearest cross street."]),
  utilities: track("Riverton Utilities", { ref: "OUT-2207", status: "Crew on site", note: "Power expected back by 18:00" }, "Outage reporting", ["How do I report an outage?", "Report it here or call our 24/7 line."]),
  "property-management": track("Parkside Property Management", { ref: "MR-3318", status: "Scheduled", note: "Plumber booked for Tuesday morning" }, "Online rent payments", ["What counts as an emergency repair?", "No heat, no water, a gas smell or flooding."]),
  nonprofits: track("Second Harvest Helpers", { ref: "VOL-0815", status: "Confirmed", note: "Saturday 9am food sorting shift" }, "Volunteer shifts", ["Can groups volunteer together?", "Yes, groups of up to 20."]),
  chambers: track("Lakeview Business Chamber", { ref: "ENQ-2207", status: "Membership call scheduled", note: "The membership team replies by email" }, "Monthly networking breakfast", ["Who can join the chamber?", "Any business or organisation based in the region, from sole traders to large employers."]),
  associations: track("Carolina Builders Association", { ref: "MEM-4410", status: "Approved", note: "Welcome pack sent by email" }, "Member events", ["When do memberships renew?", "Every January 1."]),
  "political-campaigns": track("Riverton Civic Campaign", { ref: "VOL-1201", status: "Signed up", note: "Canvass training on Saturday" }, "Phone banking", ["How can I volunteer?", "Sign up for a shift and we confirm by email."]),
  airlines: track("Skyline Regional Airlines", { ref: "SR4521", status: "On time", note: "Departs gate B12 at 14:35" }, "Baggage support", ["How much is a checked bag?", "The first checked bag is 35 dollars."]),
  "public-transit": track("Riverton Area Transit", { ref: "ALERT-77", status: "Detour", note: "Route 7 detours around Main St until Friday" }, "Paratransit", ["How much is a fare?", "2.20 dollars a ride, with free transfers for 90 minutes."]),
  pharmacy: track("Corner Pharmacy", { ref: "CB-5512", status: "Callback scheduled", note: "A pharmacist will call this afternoon" }, "Flu shots", ["Do you offer flu shots?", "Yes, walk-ins are welcome during pharmacy hours."]),
};

export function exampleFor(industry: string, engine: Engine): IndustryExample | undefined {
  const ex = INDUSTRY_EXAMPLES[industry];
  return ex && ex.engine === engine ? ex : undefined;
}

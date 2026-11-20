// The industry plug-in card for ChatGPT (Apps SDK UI component), linked from show_menu (plugin-mcp.ts).
// The menu is a grid of buttons; each opens a small form (dates and party size, an item, a reference, a
// question, or the details of a request).
//   Up to plug-in version 0.2.0 (plugin.inCard false): submitting a form sends the customer's words to the chat
//   with window.openai.sendFollowUpMessage, and the assistant calls the tool and answers there.
//   From 0.3.0 (plugin.inCard true), like the guide card: the card runs the tool with window.openai.callTool
//   and draws the result (a price list with quantities, availability, open times, an estimate, a status), and
//   a request is sent from the result. Questions always go to the chat. For the industry-wide plug-in the
//   card works in the chat until a result names the business.
//   From 0.4.0 (plugin.nav) the card is also browsed by tapping: quick options on the forms (the business's
//   own categories and services from plugin.quick, and calendar shortcuts), search and category filters on a
//   price list, an item or option on its own screen, Back through the screens visited, the business's
//   published questions and answers (info), and, on the industry-wide plug-in, choosing the business.
//   From 0.12.0, on a coworking plug-in whose business published its member businesses, the menu has a Members
//   option (kind "members"): search and filters on the list, a member on its own screen with its published
//   website, email and phone, and "Find a collaborator". The customer contacts a member themselves.
//   From 0.15.0, on a software plug-in: Features (search, the plan and guide of each), Pricing (the plans, or only
//   the pricing page), Help & guides (search and topics, each article opens on the product's site) and Support (a
//   support request with a reference). Options marked hidden are kept for the card's flows but get no button.
//   From 0.18.0, on an events plug-in whose show or conference published its programme (the event guide): Agenda
//   (day filters, search), Speakers (search, a speaker on their own screen with the sessions they speak in),
//   Exhibitors & sponsors (search, category filters, a company on its own screen with its website and email) and
//   Send an enquiry (exhibiting, sponsoring, visiting or speaking, with a reference).
//   From 0.19.0, on a business's plug-in whose own server declares an account menu (plugin.account, app-tools.ts):
//   a button per entry (kind "account"). A form asks for its fields and runs the business's tool; a list shows
//   the records a tool returns, each opening on its own screen with its actions; a longer job (a report) is
//   waited for and then shown; a chat entry (dictating a note) hands over to the chat. A record to work in (a
//   session) is chosen from chips, the first one preselected. What the screens show is described by the menu,
//   as paths into the tool's result; every value is drawn as plain text.
//   From 0.20.0 a record's screen can carry Send by email and Send on WhatsApp (open.send): they open the
//   customer's own mail app (through the email page) or WhatsApp with a text from the record filled in. The
//   customer sends it; the card sends nothing.
//   From 0.22.0, on a coworking plug-in whose business published its locations (plugin.visits): Book a tour and
//   Day pass (kinds "tour" and "daypass"), each a form with the locations that offer it as chips, a day (with the
//   day shortcuts), and for a tour a time and how many people. Where the business takes these on WhatsApp the
//   result (view "visit") is a summary, the message to send as text and Continue on WhatsApp, and no name or
//   email is asked; otherwise the form asks for them and the result is the usual sent request. A look-up of the
//   locations from the chat (view "visits") lists them with a button into each form.
// Every value shown comes from a tool's structuredContent, never from its text, which is written for the assistant. Served as
// text/html+skybridge like the guide card (guide-widget.ts); the URI is content-addressed.
//   From 0.23.0 the same card also runs in an MCP Apps host (Claude), served there as text/html;profile=mcp-app
//   under its own URI: with no window.openai it does the ui/initialize handshake and makes the same calls as
//   JSON-RPC messages to the host (tools/call, ui/message, ui/open-link, ui/notifications/size-changed).
import { createHash } from "node:crypto";
import { brand } from "@/lib/brand";
import { siteConfig, siteOrigins } from "@/lib/seo";
import { CARD_IMAGE_ORIGINS } from "@/lib/profile-store";

export const PLUGIN_WIDGET_MIME = "text/html+skybridge";
/** The same card for an MCP Apps host (Claude), from plug-in version 0.23.0. */
export const PLUGIN_APP_MIME = "text/html;profile=mcp-app";

const ICONS: Record<string, string> = {
  account: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  note: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v4"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
  check: '<path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>',
  report: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h6"/>',
  lookup: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  request: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
  question: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.4"/><path d="M12 16.5h.01"/>',
  status: '<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="m9 14 2 2 4-4"/>',
  contact: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  features: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  pricing: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  guides: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  support: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="m5.6 5.6 3.9 3.9M14.5 14.5l3.9 3.9M18.4 5.6l-3.9 3.9M9.5 14.5l-3.9 3.9"/>',
  members: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
  store: '<path d="M3 9 4.5 4h15L21 9"/><path d="M3 9v11h18V9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M9 20v-6h6v6"/>',
  agenda: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M7 13h4M7 17h7"/>',
  speakers: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/>',
  exhibitors: '<path d="M3 21V8l9-5 9 5v13"/><path d="M8 21v-7h8v7M3 21h18"/>',
  enquiry: '<path d="M4 4h16v12H7l-3 3z"/><path d="M8 9h8M8 12h5"/>',
  tour: '<path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  committees: '<circle cx="12" cy="6" r="2.5"/><circle cx="5" cy="17" r="2.5"/><circle cx="19" cy="17" r="2.5"/><path d="M12 8.5v3M12 11.5l-5 3.5M12 11.5l5 3.5"/>',
  news: '<path d="M4 5h13v14H6a2 2 0 0 1-2-2z"/><path d="M17 9h3v8a2 2 0 0 1-2 2"/><path d="M8 9h5M8 13h5M8 16h3"/>',
  daypass: '<path d="M3 9V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3a3 3 0 0 0 0 6v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a3 3 0 0 0 0-6z"/><path d="M14 9v6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  whatsapp: '<path d="M21 12a9 9 0 0 1-13.4 7.9L3 21l1.2-4.4A9 9 0 1 1 21 12z"/><path d="M9 9.5c.3 2.4 2.1 4.2 4.5 4.5l1-1 2 1-.4 1.6c-3.6.3-7.8-3.9-7.5-7.5L10.2 8l1 2z"/>',
};

const MARK = `<svg viewBox="${brand.markViewBox}" aria-hidden="true"><defs><linearGradient id="bp-g" x1="14" y1="9" x2="50" y2="55" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${brand.lime}"/><stop offset="1" stop-color="${brand.mint}"/></linearGradient></defs><path fill="url(#bp-g)" fill-rule="evenodd" d="${brand.markPath}"/></svg>`;

const CSS = String.raw`
:root{--ink:#0f1320;--fg:#f3f5fb;--muted:#a3aabd;--card:rgba(255,255,255,.05);--line:rgba(255,255,255,.1);--a1:#e8ebf3;--a2:#b9c2d8;--glow:rgba(185,194,216,.12);--bg:#0f1320}
:root[data-theme=light]{--fg:#0f1320;--muted:#5b6275;--card:#f5f7fb;--line:rgba(15,19,32,.1);--bg:#ffffff}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--bg);color:var(--fg);font:15px/1.4 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Inter,sans-serif}
#app{padding:18px;position:relative;overflow:hidden}
.glow{position:absolute;inset:-40% -20% auto auto;width:360px;height:360px;background:radial-gradient(closest-side,var(--glow),transparent);pointer-events:none}
.head{display:flex;align-items:center;gap:12px;margin-bottom:14px;position:relative}.banner{display:block;width:calc(100% + 36px);margin:-18px -18px 14px;aspect-ratio:1.91/1;object-fit:cover;background:rgba(255,255,255,.04);border-bottom:2px solid var(--a2,rgba(255,255,255,.1));position:relative}
.head>svg{width:26px;height:36px;flex:none}
.head .t{font-weight:700;font-size:17px;letter-spacing:-.01em}
.head .s{color:var(--muted);font-size:13px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;position:relative}
@media (max-width:520px){.grid{grid-template-columns:1fr}}
.tile{all:unset;box-sizing:border-box;cursor:pointer;display:flex;gap:12px;align-items:flex-start;padding:14px;border-radius:16px;background:var(--card);border:1px solid var(--line);transition:transform .15s ease,border-color .15s ease}
.tile:hover,.tile:focus-visible{transform:translateY(-2px);border-color:var(--a2)}
.ic{flex:none;width:36px;height:36px;border-radius:11px;display:grid;place-items:center;background:linear-gradient(135deg,var(--a1),var(--a2))}
.ic svg{width:19px;height:19px;fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.tile .tt{font-weight:650;font-size:15px}
.tile .dd{color:var(--muted);font-size:13px;margin-top:2px}
.tile.hero{grid-column:1/-1;padding:18px;border:1px solid transparent;background:linear-gradient(var(--bg),var(--bg)) padding-box,linear-gradient(110deg,var(--a1),var(--a2)) border-box}
.tile.hero .ic{width:44px;height:44px;border-radius:13px}
.tile.hero .tt{font-size:18px}
.tile.wide{grid-column:1/-1}
.badge{display:inline-block;margin-left:8px;font-size:11px;font-weight:700;color:var(--ink);background:linear-gradient(110deg,var(--a1),var(--a2));border-radius:999px;padding:2px 8px;vertical-align:2px}
.contact{margin-top:12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 14px;border-radius:16px;border:1px dashed var(--line)}
.contact .ct{flex:1;min-width:180px}
.contact .ct b{display:block;font-size:14px}
.contact .ct span{color:var(--muted);font-size:12.5px}
.btn{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:7px;font-weight:650;font-size:13px;padding:8px 13px;border-radius:999px;border:1px solid var(--line);background:var(--card)}
.btn svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.btn.wa{background:#25d366;color:#0b141a;border-color:transparent}
.acts{margin-top:12px;gap:8px}
.acts .btn{font-size:12.5px;padding:7px 12px}
.btn:hover,.btn:focus-visible{filter:brightness(1.08)}
.empty{color:var(--muted);padding:8px 0}
.bar-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
.bar-top h3{font-size:17px}
.link{all:unset;cursor:pointer;font-size:13px;font-weight:600;color:var(--a2)}
:root[data-theme=light] .link{color:var(--fg);text-decoration:underline}
.form{display:grid;gap:12px;padding:16px;border-radius:16px;background:var(--card);border:1px solid var(--line);position:relative}
.form .hint{color:var(--muted);font-size:13px}
.form label{display:grid;gap:6px;font-size:13px;font-weight:600;align-content:start}
.form label span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.form label small{font-weight:400;color:var(--muted)}
.form input,.form textarea{font:inherit;color:var(--fg);background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:10px 12px;outline:none;width:100%;color-scheme:dark}
:root[data-theme=light] .form input,:root[data-theme=light] .form textarea{color-scheme:light}
.form textarea{min-height:76px;resize:vertical}
.form input:focus,.form textarea:focus{border-color:var(--a2)}
.row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.row.three{grid-template-columns:1fr 1fr 96px}
@media (max-width:520px){.row,.row.three{grid-template-columns:1fr}}
.actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.primary{all:unset;cursor:pointer;font-weight:700;font-size:14px;padding:11px 18px;border-radius:999px;color:var(--ink);background:linear-gradient(110deg,var(--a1),var(--a2))}
.err{color:#ff8a8a;font-size:13px}
.qlabel{font-size:12px;color:var(--muted)}
.q{all:unset;cursor:pointer;font-size:12.5px;padding:6px 12px;border-radius:999px;border:1px solid var(--line);background:var(--bg)}
.q:hover,.q:focus-visible{border-color:var(--a2)}
.sent{padding:14px;border-radius:16px;background:var(--card);border:1px solid var(--line)}
.sent b{display:block;margin-bottom:4px}
.sent p{color:var(--muted);font-size:13px}
.note{color:var(--muted);font-size:12px;margin-top:10px}
.list{display:grid;gap:10px}
.cat{font-size:11.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;margin-top:4px}
.it{padding:13px 14px;border-radius:16px;background:var(--card);border:1px solid var(--line)}
.it .nm{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
.it .nm b{font-size:15px}
.it .pr{font-weight:700;white-space:nowrap}
.it .bl{font-size:13px;color:var(--muted);margin-top:3px}
.it.ph{display:grid;grid-template-columns:64px 1fr;gap:12px;align-items:start}
.thumb{width:64px;height:64px;border-radius:12px;object-fit:cover;background:var(--line);display:block}
.photo{width:100%;max-width:420px;aspect-ratio:4/3;border-radius:16px;object-fit:cover;background:var(--line);display:block;margin:4px 0 12px}
.it .acts{display:flex;gap:8px;margin-top:10px}
.qty{display:flex;align-items:center;gap:10px;margin-top:10px;font-weight:650}
.step{all:unset;cursor:pointer;width:30px;height:30px;border-radius:999px;display:grid;place-items:center;border:1px solid var(--line);background:var(--bg);font-size:17px}
.step[disabled]{opacity:.35;cursor:default}
.btn.go{color:var(--ink);background:linear-gradient(110deg,var(--a1),var(--a2));border-color:transparent}
.primary[disabled]{opacity:.55;cursor:default}
.qs{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.q.on{color:var(--ink);background:linear-gradient(110deg,var(--a1),var(--a2));border-color:transparent;font-weight:650}
.sum{display:flex;gap:16px;flex-wrap:wrap;padding:12px 14px;border-radius:14px;background:var(--card);border:1px solid var(--line);margin:10px 0 12px}
.sum b{font-size:18px;display:block}
.sum span{color:var(--muted);font-size:13px}
.tbl{width:100%;border-collapse:collapse;font-size:13.5px;margin-top:10px}
.tbl td{padding:8px 0;border-top:1px solid var(--line);vertical-align:top}
.tbl td:first-child{color:var(--muted);width:90px}
.sent ol{padding-left:18px;display:grid;gap:4px;font-size:13px;margin-top:6px}
.sent strong{color:var(--fg)}
.pay{margin-top:12px;padding:14px;border-radius:16px;border:1px solid var(--line);background:linear-gradient(135deg,var(--glow),transparent)}
.pay .amt{display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap}
.pay .amt b{font-size:22px}
.pay .amt span{color:var(--muted);font-size:12.5px}
.pay .tag{display:inline-block;margin-left:6px;padding:1px 7px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.04em;background:#f5b94233;color:#f5b942}
.pay .actions{margin-top:10px}
.pay p{color:var(--muted);font-size:12.5px;margin-top:8px}
.paid{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;font-weight:700;font-size:13px;background:#2fbf7133;color:#2fbf71}
.wait{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;font-weight:700;font-size:13px;background:var(--card);color:var(--muted);border:1px solid var(--line)}
.actions.sticky{margin-top:12px}
.navs{display:flex;gap:14px;align-items:center;flex:none}
.rowb{all:unset;display:block;width:100%;cursor:pointer;box-sizing:border-box}
.rowb:hover b,.rowb:focus-visible b{text-decoration:underline}
.clamp{display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.find{display:flex;gap:8px;margin:10px 0 2px}
.find input{flex:1;min-width:0;font:inherit;color:var(--fg);background:var(--card);border:1px solid var(--line);border-radius:999px;padding:8px 14px;outline:none}
.find input:focus{border-color:var(--a2)}
.q small{opacity:.7;margin-left:3px}
.tag{font-size:12.5px;padding:5px 11px;border-radius:999px;border:1px solid var(--line);color:var(--muted)}
.soc .follow{display:flex;gap:6px;overflow-x:auto;padding:2px 0 8px;scrollbar-width:none}
.soc .follow::-webkit-scrollbar,.soc .rail::-webkit-scrollbar{display:none}
.soc .fl{all:unset;cursor:pointer;flex:none;display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:650;padding:6px 12px 6px 6px;border-radius:999px;border:1px solid var(--line);background:var(--card)}
.soc .fl:hover,.soc .fl:focus-visible{border-color:var(--a2)}
.nb{flex:none;display:inline-grid;place-items:center;width:22px;height:22px;border-radius:999px;color:#fff;font-size:10.5px;font-weight:800;letter-spacing:-.02em;background:var(--nc,#666)}
.soc .feat{all:unset;box-sizing:border-box;cursor:pointer;display:block;width:100%;border-radius:18px;overflow:hidden;border:1px solid var(--line);background:var(--card);margin:6px 0 12px}
.soc .feat .pic{aspect-ratio:16/9}
.soc .pic{position:relative;width:100%;background:linear-gradient(135deg,var(--nc,#555),transparent 120%),var(--card);display:grid;place-items:center;overflow:hidden}
.soc .pic img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.soc .pic .big{font-size:30px;font-weight:800;color:#fff;opacity:.85}
.soc .pic .nb{position:absolute;left:10px;top:10px;width:26px;height:26px;box-shadow:0 2px 8px rgba(0,0,0,.35)}
.soc .pin{position:absolute;right:10px;top:10px;font-size:10.5px;font-weight:700;padding:2px 8px;border-radius:999px;background:rgba(0,0,0,.55);color:#fff}
.soc .bd{padding:12px 14px 14px}
.soc .bd .kd{font-size:11.5px;color:var(--muted)}
.soc .bd b{display:block;margin-top:3px;font-size:15px;line-height:1.3}
.soc .bd p{color:var(--muted);font-size:13px;margin-top:4px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.soc .rail{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:6px;margin:0 -2px}
.soc .sc{all:unset;box-sizing:border-box;cursor:pointer;flex:none;width:210px;scroll-snap-align:start;border-radius:16px;overflow:hidden;border:1px solid var(--line);background:var(--card)}
.soc .sc:hover,.soc .sc:focus-visible,.soc .feat:hover,.soc .feat:focus-visible{border-color:var(--a2)}
.soc .sc .pic{aspect-ratio:4/3}
.soc .sc .bd{padding:10px 12px 12px}
.soc .sc .bd b{font-size:13.5px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.soc .sc .bd p{-webkit-line-clamp:2;font-size:12.5px}
.stay h4{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin:16px 0 8px;font-weight:650}
.calhd{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.calhd b{font-size:15px}
.calnav{all:unset;cursor:pointer;width:30px;height:30px;border-radius:999px;display:grid;place-items:center;border:1px solid var(--line);background:var(--bg);font-size:16px}
.calnav[disabled]{opacity:.3;cursor:default}
.cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.cal .dw{font-size:11px;color:var(--muted);text-align:center;padding:2px 0}
.cd{all:unset;box-sizing:border-box;cursor:pointer;border-radius:10px;padding:6px 2px;text-align:center;border:1px solid var(--line);background:var(--card);min-height:46px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.cd b{font-size:13.5px;font-weight:650}
.cd small{font-size:9.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.cd.past,.cd.closed{opacity:.3;cursor:default}
.cd.soldout{opacity:.45;cursor:default;text-decoration:line-through}
.cd.in{background:var(--glow);border-color:var(--a2)}
.cd.start,.cd.end{color:var(--ink);background:linear-gradient(110deg,var(--a1),var(--a2));border-color:transparent}
.cd.start small,.cd.end small{color:var(--ink);opacity:.8}
.cd.blank{visibility:hidden}
.guest{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-top:1px solid var(--line)}
.guest:first-of-type{border-top:0}
.guest .qty{margin:0}
.room .chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}
.room .chip{font-size:11.5px;padding:3px 9px;border-radius:999px;border:1px solid var(--line);color:var(--muted)}
.room .chip.left{color:#f5b942;border-color:#f5b94266}
.room .per{font-size:12.5px;color:var(--muted)}
.room details{margin-top:8px;font-size:12.5px;color:var(--muted)}
.room details summary{cursor:pointer}
.room details div{display:flex;justify-content:space-between;padding:2px 0}
.pol{font-size:12.5px;color:var(--muted);margin-top:4px}
.testtag{display:inline-block;margin-left:6px;padding:1px 7px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.04em;background:#f5b94233;color:#f5b942;vertical-align:middle}
.about{color:var(--muted);font-size:13.5px;margin-top:8px}
.more{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid var(--line)}
.more span{font-size:12px;color:var(--muted);margin-right:4px}
.pick{margin-bottom:12px}
.faq .bl{margin-top:8px;white-space:pre-line}
.sum.biz{align-items:center;justify-content:space-between;margin:0 0 12px}
.sum.biz b{font-size:15px}
.sum.sm b{font-size:14px}
.head .ic.logo{width:54px;height:54px;border-radius:15px;background:#fff;padding:6px;box-shadow:0 0 0 1px var(--line),0 6px 18px rgba(0,0,0,.25)}
.head .wm{flex:none;box-sizing:border-box;height:58px;max-width:200px;padding:7px 12px;border-radius:15px;background:#fff;display:grid;place-items:center;overflow:hidden;box-shadow:0 0 0 1px var(--line),0 6px 18px rgba(0,0,0,.25)}
.head .wm img{height:44px;width:auto;max-width:100%;object-fit:contain;display:block}
@media (max-width:420px){.head .wm{height:48px;max-width:150px}.head .wm img{height:34px}}
.fly{position:fixed;inset:0;z-index:30;display:flex;justify-content:flex-end;background:rgba(5,6,12,.55);animation:flyin .15s ease-out}
.sheet{width:min(440px,94%);height:100%;overflow:auto;background:var(--bg);border-left:1px solid var(--line);padding:18px;box-shadow:-16px 0 40px rgba(0,0,0,.4);animation:slidein .22s ease-out}
@keyframes flyin{from{opacity:0}to{opacity:1}}
@keyframes slidein{from{transform:translateX(40px);opacity:.4}to{transform:none;opacity:1}}
.hl{margin:6px 0 0 18px;font-size:13.5px;display:grid;gap:4px}
.morebtn{margin-top:14px;width:100%}
.lvl{display:inline-block;font-size:10.5px;font-weight:700;letter-spacing:.03em;padding:2px 8px;border-radius:999px;color:var(--ink);background:linear-gradient(110deg,var(--a1),var(--a2));margin-left:6px;vertical-align:1px;white-space:nowrap}
.ic.logo img,.lg img{width:100%;height:100%;object-fit:contain;display:block}
.lg{flex:none;width:46px;height:46px;border-radius:12px;background:#fff;display:grid;place-items:center;overflow:hidden;padding:5px;box-shadow:0 0 0 1px var(--line)}
.lg.mono,.ic.mono{background:linear-gradient(135deg,var(--a1),var(--a2));color:var(--ink);font-weight:800;font-size:15px;letter-spacing:.02em;padding:0}
.lg.big{width:84px;height:84px;border-radius:20px;padding:9px}
.lg.big.mono{font-size:28px}
.it.mb{display:grid;grid-template-columns:46px 1fr;gap:12px;align-items:center}
.it.mb .rowb{display:contents}
.stats{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 2px}
.stat{flex:1;min-width:90px;padding:10px 12px;border-radius:14px;background:linear-gradient(135deg,color-mix(in srgb,var(--a1) 16%,transparent),color-mix(in srgb,var(--a2) 10%,transparent));border:1px solid var(--line)}
.stat b{display:block;font-size:20px;letter-spacing:-.02em}
.stat span{font-size:12px;color:var(--muted)}
.logos{display:flex;gap:8px;overflow:hidden;margin:12px 0 2px;mask-image:linear-gradient(90deg,#000 85%,transparent)}
.logos .lg{width:40px;height:40px;border-radius:11px}
.mhero{display:flex;gap:14px;align-items:center;margin:4px 0 10px}
.mhero b{font-size:18px;display:block}
.mhero span{color:var(--muted);font-size:13px}
.mhero .lvl{color:var(--ink);font-size:10.5px}
.cm{padding:14px;border-radius:16px;background:var(--card);border:1px solid var(--line);position:relative;overflow:hidden}
.cm:before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,var(--a1),var(--a2))}
.cm b{font-size:15px;display:block}
.cm .ch{font-size:12px;color:var(--a2);font-weight:650;margin-top:2px}
:root[data-theme=light] .cm .ch{color:var(--fg)}
.cm p{font-size:13px;color:var(--muted);margin-top:6px}
.nl{padding:16px;border-radius:18px;border:1px solid transparent;background:linear-gradient(var(--bg),var(--bg)) padding-box,linear-gradient(110deg,var(--a1),var(--a2)) border-box;margin:10px 0 14px}
.nl b{font-size:16px;display:block}
.nl p{font-size:13px;color:var(--muted);margin:4px 0 10px}
.nw{display:grid;grid-template-columns:58px 1fr;gap:12px;align-items:start}
.dt{border-radius:12px;text-align:center;padding:6px 0;background:var(--card);border:1px solid var(--line)}
.dt b{display:block;font-size:19px;line-height:1.1}
.dt span{font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.dt.up{background:linear-gradient(135deg,var(--a1),var(--a2));border-color:transparent;color:var(--ink)}
.dt.up span{color:var(--ink);opacity:.75}
.kd{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.pre{white-space:pre-line}
.btn[disabled]{opacity:.55;cursor:default}
.sent p.msg{color:var(--fg);font-size:14px;margin-top:6px;padding:10px 12px;border-radius:12px;border:1px dashed var(--line);user-select:all;-webkit-user-select:all;overflow-wrap:anywhere}
`;

const SCRIPT_SRC = String.raw`
const ICONS = __ICONS__;
const MARK = __MARK__;
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const icon = (k) => '<svg viewBox="0 0 24 24">' + (ICONS[k] || ICONS.lookup) + "</svg>";
// The host the card talks to. In ChatGPT that is window.openai. In an MCP Apps host (Claude, from plug-in version
// 0.21.0) there is none, and "mcp" below stands in for it with the same calls, sent to the host as JSON-RPC
// messages (ui/initialize first; see the end of this script).
let mcp = null;
const oa = () => window.openai || mcp;
const waiting = {};
let lastId = 0;
const post = (m) => { try { window.parent.postMessage(Object.assign({ jsonrpc: "2.0" }, m), "*"); } catch (e) {} };
const request = (method, params) => new Promise((resolve, reject) => { const id = ++lastId; waiting[id] = { resolve, reject }; post({ id, method, params }); });
const quiet = (pr) => { pr.catch(() => {}); };
let sentHeight = 0;
function tellHeight() {
  const h = Math.ceil(document.documentElement.getBoundingClientRect().height);
  if (h > 0 && h !== sentHeight) { sentHeight = h; post({ method: "ui/notifications/size-changed", params: { height: h } }); }
}
function mcpHost(init) {
  const caps = (init && init.hostCapabilities) || {}, ctx = (init && init.hostContext) || {};
  const host = {
    theme: ctx.theme === "light" ? "light" : "dark",
    sendFollowUpMessage: (o) => quiet(request("ui/message", { role: "user", content: [{ type: "text", text: String((o && o.prompt) || "").slice(0, 8000) }] })),
    notifyIntrinsicHeight: tellHeight,
  };
  // Without these the card falls back to the chat (tools) and to a plain new tab (links).
  if (caps.serverTools) host.callTool = (name, args) => request("tools/call", { name, arguments: args || {} });
  if (caps.openLinks) host.openExternal = (o) => quiet(request("ui/open-link", { url: o.href }));
  return host;
}
// Views: menu, form (one option's inputs), asked (what went to the chat), and from 0.3.0 the results:
// catalog, availability, slots, estimate, status, contact, request (details before sending), sent, whatsapp.
const state = { plugin: null, options: [], view: "loading", open: null, data: {}, f: {}, cart: {}, pick: null, business: "", busy: false, error: "", asked: "",
  // 0.4.0: the screens to go back through, the item or option that is open, every item seen (for the order summary), the chosen business.
  hist: [], shown: null, going: false, sel: null, items: {}, bizName: "", businesses: [], faq: -1,
  // 0.12.0: every member business seen, by id, for a member's own screen.
  mem: {},
  // 0.18.0, event guide: every speaker and exhibitor seen, by id, and the session that is open.
  spk: {}, exh: {}, ses: "" };
const p = () => state.plugin || {};
function save() { try { oa() && oa().setWidgetState && oa().setWidgetState({ f: state.f, business: state.business, bizName: state.bizName }); } catch (e) {} }
function load() { const ws = oa() && oa().widgetState; if (ws && ws.f) state.f = Object.assign(state.f, ws.f); if (ws && ws.business) state.business = ws.business; if (ws && ws.bizName) state.bizName = ws.bizName; }
const opt = (kind) => state.options.find((o) => o.kind === kind) || null;
// The card runs tools itself from version 0.3.0, once it knows which business it is working for.
const inCard = () => Boolean(p().inCard && oa() && oa().callTool && (p().bound || state.business));
const biz = () => (p().bound || !state.business ? {} : { business: state.business });
// From 0.4.0 the card is browsed by tapping (see the top of this file).
const nav = () => Boolean(p().nav);
const quick = () => (nav() && p().quick) || {};

function receive(sc) {
  if (!sc || typeof sc !== "object") return;
  if (sc.plugin) { state.plugin = sc.plugin; state.options = sc.options || state.options; }
  if (sc.businesses) state.businesses = sc.businesses;
  if (sc.business) {
    if (sc.business !== state.business) { state.cart = {}; state.items = {}; state.mem = {}; }
    state.business = sc.business;
    if (sc.plugin && sc.plugin.businessName) state.bizName = sc.plugin.businessName;
  }
  if (!state.plugin) return;
  if (sc.view === "menu" || !sc.view) { if (state.view === "loading") state.view = "menu"; }
  else {
    state.data[sc.view] = sc[sc.view];
    if (sc.view === "availability" && sc.availability) { state.f.start = sc.availability.start || state.f.start; state.f.end = sc.availability.end || ""; state.f.guests = String(sc.availability.guests || ""); }
    if (sc.view === "slots" && sc.slots) { state.f.date = sc.slots.date; if (sc.slots.service) state.f.what = sc.slots.service.id; }
    // Up to 0.3.0 a new list starts a new order; from 0.4.0 the order is kept while browsing categories.
    if (sc.view === "catalog") { if (!nav()) state.cart = {}; ((sc.catalog || {}).items || []).forEach((x) => { state.items[x.id] = x; }); }
    if (nav() && (sc.view === "sent" || sc.view === "whatsapp")) state.cart = {};
    if (sc.view === "info") state.faq = -1;
    if (sc.view === "speakers" && sc.speakers) { (sc.speakers.items || []).forEach((x) => { state.spk[x.id] = x; }); state.f.pq = sc.speakers.query || ""; }
    if (sc.view === "exhibitors" && sc.exhibitors) { (sc.exhibitors.items || []).forEach((x) => { state.exh[x.id] = x; }); state.f.xq = sc.exhibitors.query || ""; }
    if (sc.view === "agenda" && sc.agenda) { state.ses = ""; state.f.aq = sc.agenda.query || ""; }
    if (sc.view === "members" && sc.members) { (sc.members.items || []).forEach((x) => { state.mem[x.id] = x; }); state.f.mq = sc.members.query || ""; }
    state.view = sc.view;
  }
  state.busy = false; state.error = "";
  render();
}
function pickStructured(res) {
  if (!res) return null;
  if (res.isError) throw new Error(firstSentence((res.content || []).map((c) => c.text).filter(Boolean).join(" ")) || "That did not work.");
  if (res.structuredContent) return res.structuredContent;
  const r = res.result;
  return r && typeof r === "object" && r.structuredContent ? r.structuredContent : null;
}
// Tool errors are written for the assistant; the first sentence is the part meant for the customer.
const firstSentence = (t) => { const m = String(t || "").match(/^[\s\S]*?[.!?](\s|$)/); return (m ? m[0] : String(t || "")).trim().slice(0, 220); };
function ask(prompt) {
  if (!prompt) return;
  state.fly = "";
  save();
  if (oa() && oa().sendFollowUpMessage) oa().sendFollowUpMessage({ prompt });
  else window.parent.postMessage({ jsonrpc: "2.0", id: Date.now(), method: "ui/message", params: { role: "user", content: [{ type: "text", text: prompt }] } }, "*");
  state.asked = prompt; state.view = "asked"; state.error = ""; render();
}
// ChatGPT opens web links from a card, not mailto: links, so an email goes through a page that starts it in the
// customer's mail app. The address travels in the fragment and is not sent to the server.
const MAIL_PAGE = __MAIL__;
function openLink(href) {
  if (!href) return;
  if (/^mailto:/i.test(href)) {
    const m = href.slice(7).split("?");
    let to = m[0]; try { to = decodeURIComponent(m[0]); } catch (e) {}
    const subject = new URLSearchParams(m[1] || "").get("subject") || "";
    href = MAIL_PAGE + "#to=" + encodeURIComponent(to) + (subject ? "&subject=" + encodeURIComponent(subject) : "");
  }
  if (oa() && oa().openExternal) oa().openExternal({ href, redirectUrl: false });
  else window.open(href, "_blank", "noopener");
}
async function run(tool, args, fallbackPrompt, onNone) {
  save();
  if (!inCard() || !tool) { ask(fallbackPrompt); return; }
  state.busy = true; state.error = ""; render();
  try {
    const sc = pickStructured(await oa().callTool(tool, Object.assign({}, biz(), args)));
    state.busy = false;
    if (sc) receive(sc); else if (onNone) onNone(); else ask(fallbackPrompt);
  } catch (e) {
    state.busy = false;
    // 0.24.0: a restricted part needs the customer signed in, which the chat asks for; the card cannot.
    const locked = (p().restricted || []).indexOf(tool) >= 0 && fallbackPrompt;
    state.error = locked ? "This part needs you to sign in first." : (e && e.message) || "That did not run.";
    state.retry = locked ? { error: state.error, prompt: fallbackPrompt } : null;
    render();
  }
}

const v = (k) => String(state.f[k] == null ? "" : state.f[k]).trim();
const field = (k, label, opts) => {
  const o = opts || {};
  const attrs = ' data-f="' + k + '" value="' + esc(state.f[k] || "") + '"' + (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : "") + (o.min ? ' min="' + o.min + '"' : "");
  const hint = o.optional ? " <small>(optional)</small>" : "";
  if (o.type === "textarea") return "<label><span>" + esc(label) + hint + '</span><textarea data-f="' + k + '"' + (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : "") + ">" + esc(state.f[k] || "") + "</textarea></label>";
  return "<label><span>" + esc(label) + hint + '</span><input type="' + (o.type || "text") + '"' + attrs + "></label>";
};
const noun = () => p().noun || "item";
const span = () => p().span || "single";
const need = (cond, msg) => { if (!cond) throw new Error(msg); };
const num = (k) => { const n = parseFloat(v(k)); return Number.isFinite(n) && n > 0 ? n : undefined; };
const clean = (o) => { const out = {}; Object.keys(o).forEach((k) => { if (o[k] !== undefined && o[k] !== "") out[k] = o[k]; }); return out; };
const whoFields = () => (p().needsContact ? '<div class="row">' + field("name", "Your name") + field("email", "Your email", { type: "email" }) + "</div>" : "");
const who = () => {
  if (!p().needsContact) return {};
  need(v("name"), "Add your name so the business can reply.");
  need(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email")), "Add a valid email so the business can reply.");
  return { name: v("name"), email: v("email") };
};

// What each menu option asks for. Returns { html, prompt, args }: prompt() is the sentence sent to the chat,
// args() the tool arguments when the card runs the tool itself. Both throw a message for the customer.
function formFor(o) {
  if (o.kind === "lookup") {
    switch (p().engine) {
      case "order":
        return { html: field("q", "What are you looking for?", { optional: true, placeholder: "A " + noun() + " or a category" }),
          prompt: () => (v("q") ? "Do you have " + v("q") + ", and how much is it?" : "Show me what you offer, with prices."),
          args: () => clean({ query: v("q") }) };
      case "stay": {
        const nights = span() === "nights", single = span() === "single";
        const html = '<div class="row' + (single ? "" : " three") + '">' + field("start", nights ? "Check-in" : single ? "Date" : "First day", { type: "date" }) +
          (single ? "" : field("end", nights ? "Check-out" : "Last day", { type: "date", optional: !nights })) + field("guests", "People", { type: "number", min: 1, placeholder: "2" }) + "</div>";
        const check = () => {
          need(v("start"), "Choose a date.");
          if (nights) need(v("end"), "Choose a check-out date.");
          if (v("end")) need(v("end") > v("start") || (!nights && v("end") === v("start")), "The end date must be after the start date.");
        };
        return { html,
          prompt: () => { check(); const when = v("end") && v("end") !== v("start") ? "from " + v("start") + " to " + v("end") : "on " + v("start");
            return "What is available " + when + (v("guests") ? " for " + v("guests") + (v("guests") === "1" ? " person" : " people") : "") + ", and what does it cost?"; },
          args: () => { check(); return clean({ start: v("start"), end: single ? "" : v("end"), guests: num("guests") }); } };
      }
      case "appt":
        return { html: '<div class="row">' + field("what", "What for?", { optional: true, placeholder: "A " + noun() }) + field("date", "Day", { type: "date", optional: true }) + "</div>",
          prompt: () => "What times are open" + (v("date") ? " on " + v("date") : " in the next few days") + (v("what") ? " for " + v("what") : "") + "?",
          args: () => clean({ service: v("what"), date: v("date") }) };
      case "quote":
        return { html: '<div class="row">' + field("what", "What do you need?", { optional: Boolean(p().inCard), placeholder: "A " + noun() }) + field("size", "How much or how big?", { optional: true, placeholder: p().inCard ? "A number, e.g. 3" : "e.g. 3 rooms, 1,200 sq ft, 40 guests" }) + "</div>",
          prompt: () => { need(v("what"), "Say what you need an estimate for."); return "Can I get a price estimate for " + v("what") + (v("size") ? " (" + v("size") + ")" : "") + "?"; },
          args: () => clean({ service: v("what"), size: num("size") }) };
      default:
        return { html: field("ref", "Your reference", { placeholder: "The number or code you were given" }),
          prompt: () => { need(v("ref"), "Add your reference."); return "What is the status of " + v("ref") + "?"; },
          args: () => { need(v("ref"), "Add your reference."); return { reference: v("ref") }; } };
    }
  }
  if (o.kind === "request") {
    return { html: field("details", "What would you like?", { type: "textarea", placeholder: "Say what, when and for how many, in your own words" }) + whoFields(),
      prompt: () => { need(v("details"), "Say what you would like."); const w = who(); return o.title + ": " + v("details") + (w.name ? ". My name is " + w.name + " and my email is " + w.email + "." : ""); },
      args: null };
  }
  // 0.22.0: outside the card's own run (no business chosen yet) a tour or a day pass is asked for in the chat.
  if (o.kind === "tour" || o.kind === "daypass") {
    return { html: field("details", "Where and when?", { type: "textarea", placeholder: "The location, the day" + (o.kind === "tour" ? ", a time" : "") + " and how many people" }),
      prompt: () => { need(v("details"), "Say which location and which day."); return o.title + ": " + v("details"); },
      args: null };
  }
  if (o.kind === "status") {
    return { html: field("ref", "Your reference", { placeholder: "e.g. BP-7K2Q9D" }),
      prompt: () => { need(v("ref"), "Add the reference you were given."); return "What is the status of my request " + v("ref") + "?"; },
      args: () => { need(v("ref"), "Add the reference you were given."); return { reference: v("ref") }; } };
  }
  return { html: field("question", "Your question", { type: "textarea", placeholder: o.example || "" }),
    prompt: () => { need(v("question"), "Type your question."); return v("question"); }, args: null };
}

const back = (label) => '<button class="link" data-view="menu">← ' + (label || "Menu") + "</button>";
const top = (title) => '<div class="bar-top"><h3>' + esc(title) + "</h3>" +
  (nav() && state.hist.length ? '<span class="navs"><button class="link" data-act="back">← Back</button><button class="link" data-view="menu">Menu</button></span>' : back()) + "</div>";
const errLine = () => (state.error ? '<div class="err">' + esc(state.error) + "</div>" + (state.retry && state.retry.error === state.error ? '<div class="actions" style="margin-top:8px"><button class="btn" data-ask="' + esc(state.retry.prompt) + '">Continue in the chat</button></div><div class="note">The chat opens the sign-in page. Use the email and password the business gave you.</div>' : "") : "");
const primary = (label, act, extra) => '<button class="primary" data-act="' + act + '"' + (extra || "") + (state.busy ? " disabled" : "") + ">" + (state.busy ? "Working…" : esc(label)) + "</button>";

// ---- Browsing (version 0.4.0) ----
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const isoDay = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const inDays = (n) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return d; };
const dayChoices = (n) => Array.from({ length: n }, (x, i) => { const d = inDays(i); return { label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : WD[d.getDay()] + " " + d.getDate(), start: isoDay(d), end: "" }; });
// Date shortcuts for a stay: by the night, the coming weekends; by the day, the next days.
function stayChoices() {
  if (span() !== "nights") return dayChoices(6);
  const dow = new Date().getDay();
  const fri = dow === 6 ? 0 : (5 - dow + 7) % 7, len = dow === 6 ? 1 : 2, next = dow === 6 ? 6 : fri + 7;
  const range = (label, from, nights) => ({ label, start: isoDay(inDays(from)), end: isoDay(inDays(from + nights)) });
  return [range("Tonight", 0, 1), range("This weekend", fri, len), range("Next weekend", next, 2), range("7 nights from today", 0, 7)];
}
const chip = (label, attr, value, on) => '<button class="q' + (on ? " on" : "") + '" ' + attr + '="' + esc(value) + '">' + label + "</button>";
const whenChips = () => stayChoices().map((c) => chip(esc(c.label), "data-when", c.start + "|" + c.end, v("start") === c.start && v("end") === c.end)).join("");
const dayChips = (on) => dayChoices(6).map((c) => chip(esc(c.label), "data-day", c.start, on === c.start)).join("");
// Tap-to-choose options under a look-up form: the business's own categories and services (plugin.quick) and
// calendar shortcuts. Each runs the look-up.
function quickFor(o) {
  if (!nav() || o.kind !== "lookup") return "";
  const k = quick();
  switch (p().engine) {
    case "order": {
      const cats = k.categories || [];
      return cats.length ? '<div class="qlabel">Or browse</div><div class="qs">' + chip("Everything", "data-cat", "") + cats.map((c) => chip(esc(c.name) + " <small>" + c.count + "</small>", "data-cat", c.name)).join("") + "</div>" : "";
    }
    case "stay": {
      // Party-size buttons only where the business's largest option is small enough to list (rooms, tables).
      const max = k.maxGuests && k.maxGuests <= 12 ? Math.min(k.maxGuests, 8) : 0;
      const people = Array.from({ length: max }, (x, i) => chip(String(i + 1), "data-guests", String(i + 1), v("guests") === String(i + 1))).join("");
      return (max ? '<div class="qlabel">People</div><div class="qs">' + people + "</div>" : "") + '<div class="qlabel">Or pick the dates</div><div class="qs">' + whenChips() + "</div>";
    }
    case "appt": {
      const list = k.services || [];
      return (list.length ? '<div class="qlabel">Or choose</div><div class="qs">' + list.map((x) => chip(esc(x.name), "data-service", x.id)).join("") + "</div>" : "") +
        '<div class="qlabel">Or pick the day</div><div class="qs">' + dayChips(v("date")) + "</div>";
    }
    case "quote": {
      const list = k.services || [];
      return list.length ? '<div class="qlabel">Or choose</div><div class="qs">' + list.map((x) => chip(esc(x.name), "data-rule", x.id)).join("") + "</div>" : "";
    }
    default:
      return "";
  }
}
// Other places to go from a result: the look-up, the business's questions and answers, its contact details.
// 0.7.0: the business's own buttons (WhatsApp, booking, directions, reviews, social media), where they help.
function actionBar(keep, title) {
  const list = (p().actions || []).filter((a) => a && /^https:\/\//.test(a.href) && keep(a)).slice(0, 12);
  if (!list.length) return "";
  return '<div class="more acts">' + (title ? "<span>" + esc(title) + "</span>" : "") + list.map((a) => '<button class="btn' + (a.key === "whatsapp" ? " wa" : "") + '" data-href="' + esc(a.href) + '">' + (a.key === "whatsapp" ? icon("whatsapp") : "") + esc(a.label) + "</button>").join("") + "</div>";
}
function links(except) {
  // Next to availability and open times: the business's own booking page, for a customer who wants a confirmed slot.
  const book = except === "lookup" ? actionBar((a) => a.group === "calendars", "Or book directly") : "";
  if (!nav()) return book;
  const out = state.options.map((o, i) => (o.kind === except || o.hidden || o.kind === "request" || o.kind === "status" ? "" : '<button class="q" data-open="' + i + '">' + esc(o.title) + "</button>")).join("");
  return book + (out ? '<div class="more"><span>More</span>' + out + "</div>" : "");
}
// Back: every screen left on the way is remembered, except the menu and the screens that only confirm.
function track() {
  const cur = { v: state.view, open: state.open, sel: state.sel };
  const was = state.shown;
  const same = was && was.v === cur.v && (cur.v !== "form" || was.open === cur.open) && (["item", "option", "member", "mwrite", "speaker", "exhibitor"].indexOf(cur.v) < 0 || was.sel === cur.sel);
  if (same) return;
  if (["menu", "sent", "whatsapp", "visit", "loading"].indexOf(cur.v) >= 0) state.hist = [];
  else if (!state.going && was && ["menu", "loading", "asked", "sent", "whatsapp", "visit"].indexOf(was.v) < 0) state.hist = state.hist.concat([was]).slice(-12);
  state.going = false; state.shown = cur;
}
function goBack() {
  const h = state.hist.pop();
  state.going = true;
  if (h) { state.view = h.v; state.open = h.open; state.sel = h.sel; } else state.view = "menu";
  state.error = ""; render();
}
// The industry-wide plug-in serves every business of its industry: here the customer chooses one, and the
// card then works for it (results, requests) instead of handing each step to the chat.
function picker() {
  if (p().bound || !nav() || !(p().inCard && oa() && oa().callTool)) return "";
  if (state.business) return '<div class="sum biz"><div><b>' + esc(state.bizName || state.business) + "</b><span>" + (p().sample ? "Sample data, not a real business. " : "") + 'Results and requests here are for this business.</span></div><button class="btn" data-act="unbiz">Change</button></div>';
  const list = state.businesses || [];
  return '<div class="form pick"><div class="qlabel">Which business?</div>' +
    (list.length ? '<div class="qs">' + list.map((b) => chip(esc(b.name) + (b.where ? " · " + esc(b.where) : "") + (b.sample && !/sample/i.test(b.name) ? " <small>sample</small>" : ""), "data-biz", b.slug)).join("") + "</div>" : "") +
    '<div class="find"><input type="text" data-f="biz" data-enter="biz" value="' + esc(state.f.biz || "") + '" placeholder="Type the name of the business"><button class="btn" data-act="biz">' + (state.busy ? "Looking…" : "Use") + "</button></div>" + errLine() +
    '<div class="note" style="margin-top:0">Choose a business to see its prices, availability and requests here. Without one, the options below continue in the chat.</div></div>';
}
async function chooseBiz(name) {
  // The name goes as typed: the server finds the business by its name or its address name.
  const slug = String(name || "").trim().slice(0, 80);
  const contact = opt("contact");
  if (!slug || !contact) { state.error = "Type the name of the business."; render(); return; }
  state.busy = true; state.error = ""; render();
  try {
    const sc = pickStructured(await oa().callTool(contact.tool, { business: slug }));
    if (!sc || !sc.business) throw new Error("none");
    if (sc.plugin) { state.plugin = sc.plugin; state.options = sc.options || state.options; }
    state.business = sc.business; state.bizName = (sc.plugin && sc.plugin.businessName) || (sc.contact && sc.contact.name) || slug;
    state.data = {}; state.cart = {}; state.items = {}; state.mem = {}; state.hist = []; state.f.biz = ""; state.busy = false; state.view = "menu";
    save(); render();
  } catch (e) { state.busy = false; state.error = "No business with that name was found here. Check the spelling, or ask in the chat."; render(); }
}

function header() {
  const d = p();
  // A business's card shows no BizPlug mark (BizPlug stays in the contact bar); the industry-wide one does.
  // 0.25.0: the business's own logo in place of the store icon; the store icon comes back if the logo fails to load (render).
  const mark = !d.bound ? MARK : d.logo && d.logoWide ? '<span class="wm"><img src="' + esc(d.logo) + '" alt="' + esc(d.title || "") + '" data-fallback="store"></span>' : d.logo ? '<span class="ic logo"><img src="' + esc(d.logo) + '" alt="' + esc(d.title || "") + '" data-fallback="store"></span>' : '<span class="ic">' + icon("store") + "</span>";
  // 0.21.0: the business's own picture above the menu, from BizPlug's site (card-banner.ts); removed if it fails to load (render).
  const banner = d.banner && state.view === "menu" ? '<img class="banner" src="' + esc(d.banner) + '" alt="' + esc(d.title || "") + '">' : "";
  return banner + '<div class="glow"></div><div class="head">' + mark + '<div><div class="t">' + esc(d.title || "Plug-in") + '</div><div class="s">' + esc(d.subtitle) + "</div></div></div>";
}
function contactBar() {
  const c = p().contact || {};
  if (!c.whatsapp && !c.email) return "";
  return '<div class="contact"><div class="ct"><b>' + esc(c.title) + "</b><span>" + esc(c.description) + "</span></div>" +
    (c.whatsapp ? '<button class="btn wa" data-href="' + esc(c.whatsapp) + '">' + icon("whatsapp") + "WhatsApp</button>" : "") +
    (c.email ? '<button class="btn" data-href="' + esc(c.email) + '">' + icon("mail") + "Email</button>" : "") + "</div>";
}
function menuView() {
  const opts = state.options.filter((o) => !o.hidden);
  const pick = picker();
  return pick + '<div class="grid">' + opts.map((o, i) =>
    '<button class="tile' + (i === 0 ? " hero" : "") + (i > 0 && opts.length % 2 === 0 && i === opts.length - 1 ? " wide" : "") + '" data-open="' + state.options.indexOf(o) + '"><span class="ic">' + icon(o.icon || o.kind) + "</span><span>" +
    '<div class="tt">' + esc(o.title) + (i === 0 ? '<span class="badge">Start here</span>' : "") + '</div><div class="dd">' + esc(o.description) + "</div></span></button>").join("") + "</div>" +
    (p().bound || pick ? "" : '<div class="note">This plug-in serves every business in its industry: the assistant will ask which business you mean.</div>') +
    actionBar((a) => a.where === "contact", p().businessName || p().title ? "Reach " + (p().businessName || p().title) : "");
}
function formView() {
  const o = state.options[state.open];
  if (!o) return menuView();
  const f = formFor(o);
  const here = inCard() && f.args;
  return '<div class="form">' + top(o.title) + '<div class="hint">' + esc(state.hint || o.description) + "</div>" + f.html + errLine() +
    '<div class="actions">' + primary(here ? "Show" : o.kind === "request" ? "Continue in chat" : "Ask", "send") + "</div>" +
    (here ? quickFor(o) : "") +
    (o.example && !here ? '<div class="qlabel">Or try</div><div><button class="q" data-ask="' + esc(o.example) + '">' + esc(o.example) + "</button></div>" : "") +
    (o.kind === "request" ? '<div class="note">The assistant confirms the details with you before anything is sent. The business confirms every request itself.</div>' : "") + "</div>";
}
function askedView() {
  return '<div class="sent"><b>Sent to the chat</b><p>' + esc(state.asked) + '</p></div><div class="actions" style="margin-top:12px"><button class="btn" data-view="menu">← Menu</button></div>';
}

// ---- Results (version 0.3.0) ----
const cartCount = () => Object.keys(state.cart).reduce((n, k) => n + state.cart[k], 0);
const thumb = (x) => x.image ? '<img class="thumb" src="' + esc(x.image) + '" alt="" loading="lazy">' : "";
const stepper = (id, n) => '<div class="qty"><button class="step" data-less="' + esc(id) + '"' + (n ? "" : " disabled") + '>−</button><span>' + n + '</span><button class="step" data-more="' + esc(id) + '">+</button></div>';
// 0.4.0: the list with a search box and the business's categories as filters; an item opens on its own screen.
function catalogNav() {
  const c = state.data.catalog || { items: [] };
  const lookup = opt("lookup"), request = opt("request");
  const cats = c.categories || [];
  const head = top(lookup ? lookup.title : "Prices") +
    '<div class="find"><input type="search" data-f="q" data-enter="find" value="' + esc(state.f.q || "") + '" placeholder="Search the list"><button class="btn" data-act="find">Search</button></div>' +
    (cats.length > 1 ? '<div class="qs" style="margin-bottom:12px">' + chip("All", "data-cat", "", !c.category && !c.query) + cats.map((x) => chip(esc(x.name) + " <small>" + x.count + "</small>", "data-cat", x.name, x.name === c.category)).join("") + "</div>" : '<div style="height:10px"></div>');
  const n = cartCount();
  const order = request ? '<div class="actions sticky">' + primary(n ? request.title + " (" + n + ")" : "Choose items to order", "order", n ? "" : " disabled") + "</div>" : "";
  if (!c.items.length) return head + '<div class="empty">Nothing matches' + (c.query ? ' "' + esc(c.query) + '"' : "") + ". Try another word or a category.</div>" + (n ? order : "") + links("lookup");
  let cat = "";
  const rows = c.items.map((x) => {
    const sub = !c.category && x.category && x.category !== cat ? '<div class="cat">' + esc(x.category) + "</div>" : "";
    cat = x.category || cat;
    return sub + '<div class="it' + (x.image ? " ph" : "") + '">' + thumb(x) + '<div><button class="rowb" data-item="' + esc(x.id) + '"><div class="nm"><b>' + esc(x.name) + '</b><span class="pr">' + esc(x.price) + "</span></div>" +
      (x.description ? '<div class="bl clamp">' + esc(x.description) + "</div>" : "") + "</button>" + stepper(x.id, state.cart[x.id] || 0) + "</div></div>";
  }).join("");
  return head + '<div class="list">' + rows + "</div>" + (c.more ? '<div class="note">' + c.more + " more: search or choose a category to narrow the list.</div>" : "") + errLine() + order + links("lookup");
}
function itemView() {
  const x = state.items[state.sel];
  if (!x) return catalogView();
  const request = opt("request");
  const all = cartCount();
  return top(x.name) + (x.image ? '<img class="photo" src="' + esc(x.image) + '" alt="' + esc(x.name) + '">' : "") + '<div class="sum"><div><b>' + esc(x.price) + "</b><span>" + esc(x.category || "") + "</span></div></div>" +
    (x.description ? '<p class="about" style="margin:0 0 4px">' + esc(x.description) + "</p>" : "") + stepper(x.id, state.cart[x.id] || 0) + errLine() +
    '<div class="actions" style="margin-top:14px">' + (request ? primary(all ? request.title + " (" + all + ")" : "Choose a quantity to order", "order", all ? "" : " disabled") : "") +
    (x.category ? '<button class="btn" data-cat="' + esc(x.category) + '">More in ' + esc(x.category) + "</button>" : "") + "</div>";
}
function catalogView() {
  if (nav()) return catalogNav();
  const c = state.data.catalog || { items: [] };
  const lookup = opt("lookup"), request = opt("request");
  if (!c.items.length) return '<div class="form">' + top(lookup ? lookup.title : "Prices") + '<div class="empty">Nothing matches' + (c.query ? ' "' + esc(c.query) + '"' : "") + '.</div><div class="actions"><button class="btn" data-act="again">Search again</button></div></div>';
  let cat = "";
  const rows = c.items.map((x) => {
    const head = x.category && x.category !== cat ? '<div class="cat">' + esc(x.category) + "</div>" : "";
    cat = x.category || cat;
    const n = state.cart[x.id] || 0;
    return head + '<div class="it' + (x.image ? " ph" : "") + '">' + thumb(x) + '<div><div class="nm"><b>' + esc(x.name) + '</b><span class="pr">' + esc(x.price) + "</span></div>" + (x.description ? '<div class="bl">' + esc(x.description) + "</div>" : "") +
      '<div class="qty"><button class="step" data-less="' + esc(x.id) + '"' + (n ? "" : " disabled") + '>−</button><span>' + n + '</span><button class="step" data-more="' + esc(x.id) + '">+</button></div></div></div>';
  }).join("");
  const n = cartCount();
  return top(lookup ? lookup.title : "Prices") + '<div class="list">' + rows + "</div>" + (c.more ? '<div class="note">' + c.more + " more: search to narrow the list.</div>" : "") + errLine() +
    '<div class="actions sticky">' + (request ? primary(n ? request.title + " (" + n + ")" : "Choose items to order", "order", n ? "" : " disabled") : "") + '<button class="btn" data-act="again">Search</button></div>';
}
// ---- 0.27.0: the hotel booking screen (stay-booking.ts), after msg2ai's Visit Pass card ----
const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthName = (m) => { const x = String(m || "").split("-"); return x.length === 2 ? MONTHS[Number(x[1]) - 1] + " " + x[0] : m; };
const shortDay = (d) => { const x = String(d || "").split("-"); return x.length === 3 ? Number(x[2]) + " " + MONTHS[Number(x[1]) - 1].slice(0, 3) : d; };
// The stay being chosen on the card: dates are tapped here first and asked for once both are set.
function stayQ() {
  const a = (state.data.availability || {}).stay || {};
  const q = a.query || {};
  if (!state.sq || state.sq.v !== a) state.sq = { v: a, start: q.start || "", end: q.end || "", adults: q.adults || 2, children: q.children || 0, rooms: q.rooms || 1, month: q.month || (a.calendar || {}).month || "" };
  return state.sq;
}
function stayArgsOf(q, over) {
  const o = Object.assign({ adults: q.adults, children: q.children, rooms: q.rooms }, over || {});
  if (q.start && q.end && !("month" in (over || {}))) { o.start = q.start; o.end = q.end; }
  else if (o.month === undefined) o.month = q.month;
  return clean(o);
}
// 0.29.0: the screen's mode, from the result: by the night (a hotel), by the day, or one date.
const staySpan = () => (((state.data.availability || {}).stay || {}).span) || "nights";
function stayAsk(over) {
  const lookup = opt("lookup"), q = stayQ(), a = stayArgsOf(q, over), sp = staySpan();
  if (sp === "single" && a.start) delete a.end;
  if (sp !== "nights") delete a.rooms;
  const party = sp === "days" ? q.adults + (q.adults === 1 ? " person" : " people") : q.adults + " adults" + (q.children ? ", " + q.children + " children" : "") + (q.rooms > 1 && sp === "nights" ? ", " + q.rooms + " rooms" : "");
  const ask = !a.start ? "Show me which " + (sp === "nights" ? "nights" : "days") + " are free in " + monthName(a.month) + "."
    : sp === "single" ? "What is available on " + a.start + " for " + party + "?"
    : sp === "days" ? "What is available from " + a.start + " to " + a.end + " for " + party + "?"
    : "What rooms are free from " + a.start + " to " + a.end + " for " + party + "?";
  run(lookup && lookup.tool, a, ask);
}
let stayTimer = null;
function stayAskSoon() { if (stayTimer) clearTimeout(stayTimer); stayTimer = setTimeout(() => { stayTimer = null; if (stayQ().start && stayQ().end) stayAsk(); else render(); }, 400); }
// What the screen calls things, by mode.
function stayWords(sp) {
  // "vehicle class" -> "Vehicle classes", "ticket" -> "Tickets"; a noun with a choice in it ("desk, room or office") -> "Options".
  const raw = p().noun || "option", noun = /,| or /.test(raw) ? "Option" : raw.replace(/^\w/, (c) => c.toUpperCase());
  const plural = (x) => (/(s|x|ch|sh)$/.test(x) ? x + "es" : x + "s");
  if (sp === "days") return { title: "Choose your dates", pick: ["Tap the first day.", "Now tap the last day."], unit: "day", units: "days", per: "avg per day", list: plural(noun), breakdown: "Day by day", none: "Nothing is free on every day you chose. Try other dates." };
  if (sp === "single") return { title: "Choose your date", pick: ["Tap the date.", ""], unit: "", units: "", per: "per person", list: plural(noun), breakdown: "", none: "Nothing is available on that date. Try another day." };
  return { title: "Book your stay", pick: ["Tap your check-in day.", "Now tap your check-out day."], unit: "night", units: "nights", per: "avg per night", list: "Rooms", breakdown: "Night by night", none: "No room is free on every night for your party. Try other dates." };
}
function stayScreen() {
  const s = state.data.availability.stay, q = stayQ(), pol = s.policies || {}, cal = s.calendar || { days: [] };
  const lookup = opt("lookup"), request = opt("request");
  const sp = s.span || "nights", w = stayWords(sp);
  const homes = false;
  const intro = '<div class="sum"><div><b>' + esc(w.title) + "</b><span>" + (pol.ratePlan ? esc(pol.ratePlan) + " · " : "") + esc(pol.tax || "") +
    (s.checkout && s.checkout.testMode ? '<span class="testtag">' + esc(s.checkout.label) + " TEST</span>" : "") + "</span></div></div>";
  // Calendar: the first tap is check-in, the next one after it check-out.
  const first = cal.days.length ? new Date(cal.days[0].date + "T00:00:00Z").getUTCDay() : 0;
  const cells = DOW.map((d) => '<span class="dw">' + d + "</span>").join("") + Array.from({ length: first }, () => '<span class="cd blank"></span>').join("") +
    cal.days.map((d) => {
      const out = sp !== "single" && q.start && !q.end && (sp === "days" ? d.date >= q.start : d.date > q.start) && d.state !== "past";
      const can = d.state === "open" || out;
      const cls = ["cd", d.state, d.date === q.start ? "start" : "", d.date === q.end ? "end" : "", q.start && q.end && d.date > q.start && d.date < q.end ? "in" : ""].join(" ");
      return '<button class="' + cls + '" data-sday="' + esc(d.date) + '"' + (can ? "" : " disabled") + "><b>" + Number(d.date.slice(8)) + "</b>" + (d.state === "open" && d.from ? "<small>" + esc(String(d.from).replace(/\.00$/, "")) + "</small>" : d.state === "soldout" ? "<small>Full</small>" : "") + "</button>";
    }).join("");
  const n = s.query && s.query.nights;
  const pickNote = !q.start ? w.pick[0] : sp === "single" ? shortDay(q.start) : !q.end ? (sp === "nights" ? "Check-in " : "From ") + shortDay(q.start) + ". " + w.pick[1] : shortDay(q.start) + " to " + shortDay(q.end) + (n ? " · " + n + " " + (n === 1 ? w.unit : w.units) : "");
  const calendar = "<h4>Dates</h4>" + '<div class="calhd"><button class="calnav" data-smonth="' + esc(cal.prev || "") + '"' + (cal.prev ? "" : " disabled") + ' aria-label="Previous month">‹</button><b>' + esc(monthName(cal.month)) +
    '</b><button class="calnav" data-smonth="' + esc(cal.next || "") + '"' + (cal.next ? "" : " disabled") + ' aria-label="Next month">›</button></div><div class="cal">' + cells + '</div><div class="note">' + esc(pickNote) + "</div>";
  const stepper = (key, label, n, min, max) => '<div class="guest"><span>' + label + '</span><div class="qty"><button class="step" data-g="' + key + '" data-by="-1"' + (n <= min ? " disabled" : "") + ' aria-label="Fewer ' + label.toLowerCase() + '">−</button><span>' + n + '</span><button class="step" data-g="' + key + '" data-by="1"' + (n >= max ? " disabled" : "") + ' aria-label="More ' + label.toLowerCase() + '">+</button></div></div>';
  const guests = sp === "days" ? "<h4>People</h4>" + stepper("adults", "People", q.adults, 1, pol.maxAdults || 12)
    : (sp === "single" ? "<h4>Who&rsquo;s coming</h4>" : "<h4>Guests</h4>") + stepper("adults", "Adults", q.adults, 1, pol.maxAdults || 12) + stepper("children", "Children", q.children, 0, pol.maxChildren || 9) + (homes || sp !== "nights" ? "" : stepper("rooms", "Rooms", q.rooms, 1, pol.maxRooms || 3));
  // Rooms: only once both dates are chosen.
  let rooms = "";
  if (q.start && q.end && s.query && s.query.start === q.start && s.query.end === q.end) {
    if (s.problem) rooms = '<div class="empty">' + esc(s.problem) + "</div>";
    else if (!s.rooms.length) rooms = '<div class="empty">' + esc(w.none) + "</div>";
    else rooms = '<div class="list">' + s.rooms.map((r) => {
      const label = s.book === "pay" ? "Book & pay " + r.total : s.book === "whatsapp" ? "Book on WhatsApp" : (request ? request.title : "Request the booking");
      const btn = s.book === "request" ? '<button class="btn go" data-pick-stay="' + esc(r.id) + '" data-name="' + esc(r.name) + '" data-total="' + esc(r.total) + '">' + esc(label) + "</button>"
        : '<button class="' + (s.book === "whatsapp" ? "btn wa" : "btn go") + '" data-book-room="' + esc(r.id) + '" data-name="' + esc(r.name) + '"' + (state.busy ? " disabled" : "") + ">" + (s.book === "whatsapp" ? icon("whatsapp") : "") + esc(label) + "</button>";
      const chips = [r.view ? r.view + " view" : "", r.bed, r.max ? "Up to " + r.max + " people" : ""].filter(Boolean).map((c) => '<span class="chip">' + esc(c) + "</span>").join("") +
        (r.left != null && r.left <= 3 ? '<span class="chip left">Only ' + r.left + " left</span>" : "") + (r.amenities || []).map((c) => '<span class="chip">' + esc(c) + "</span>").join("");
      const nights = w.breakdown && r.nightly && r.nightly.length > 1 ? "<details><summary>" + esc(w.breakdown) + "</summary>" + r.nightly.map((n) => "<div><span>" + esc(shortDay(n.date)) + "</span><span>" + esc(n.rate) + "</span></div>").join("") + "</details>" : "";
      return '<div class="it room"><div class="nm"><b>' + esc(r.name) + '</b><span class="pr">' + esc(r.total) + '</span></div><div class="per">' + esc(r.avgNightly) + " " + (sp === "single" && s.unit !== "person" ? "per booking" : w.per) + (q.rooms > 1 && sp === "nights" ? " · " + q.rooms + " rooms" : "") + "</div>" +
        (r.blurb ? '<div class="bl">' + esc(r.blurb) + "</div>" : "") + (chips ? '<div class="chips">' + chips + "</div>" : "") + nights + '<div class="acts">' + btn + "</div></div>";
    }).join("") + "</div>";
    const out = [s.soldOut && s.soldOut.length ? "Full on these dates: " + s.soldOut.join(", ") + "." : "", s.tooSmall && s.tooSmall.length ? "Too small for your party: " + s.tooSmall.join(", ") + "." : "", s.tooShort && s.tooShort.length ? "Needs a longer stay: " + s.tooShort.join(", ") + "." : ""].filter(Boolean).join(" ");
    rooms = "<h4>" + esc(w.list) + "</h4>" + rooms + (out ? '<div class="note">' + esc(out) + "</div>" : "");
  }
  const how = s.book === "pay" ? "Book & pay opens " + (s.checkout ? s.checkout.label : "the hotel") + "'s secure page; the room is held for 30 minutes while you pay. Card details are never entered here."
    : s.book === "whatsapp" ? "Book on WhatsApp opens the hotel's concierge with your visit code; nothing is booked until you pay there."
    : (sp === "nights" ? "The hotel" : (p().businessName || "The business")) + " confirms your request by email; nothing is held or charged here." + (sp !== "nights" ? " Prices can differ by day." : "");
  const policies = '<div class="pol">' + (pol.checkIn ? "Check-in from " + esc(pol.checkIn) + " · check-out by " + esc(pol.checkOut) + ". " : "") + (pol.cancellation ? esc(pol.cancellation) + " " : "") + esc(how) + "</div>";
  const concierge = s.concierge ? '<div class="actions" style="margin-top:12px"><button class="btn wa" data-href="' + esc(s.concierge) + '">' + icon("whatsapp") + "Questions? Chat with the concierge</button></div>" : "";
  return top(lookup ? lookup.title : w.title) + '<div class="stay">' + intro + calendar + guests + (state.busy ? '<div class="note">Checking ' + (sp === "nights" ? "rooms" : "availability") + " and prices…</div>" : "") + errLine() + rooms + policies + concierge + "</div>";
}
function availabilityView() {
  const a = state.data.availability || { options: [] };
  if (a.stay && a.stay.calendar) return stayScreen();
  const lookup = opt("lookup"), request = opt("request");
  const head = top(lookup ? lookup.title : "Availability") + '<div class="sum"><div><b>' + esc(a.when) + "</b><span>" + esc(a.tax) + "</span></div></div>";
  // 0.4.0: other dates with one tap, and each option opens on its own screen.
  const other = nav() ? '<div class="qlabel" style="margin-top:12px">Other dates</div><div class="qs">' + whenChips() + "</div>" : "";
  if (!a.options.length) return head + '<div class="empty">Nothing is available for these dates.</div>' + other + '<div class="actions"' + (nav() ? ' style="margin-top:12px"' : "") + '><button class="btn" data-act="again">Change dates</button></div>' + links("lookup");
  const line = (x) => '<div class="nm"><b>' + esc(x.name) + '</b><span class="pr">' + esc(x.total) + "</span></div>" +
    '<div class="bl' + (nav() ? " clamp" : "") + '">' + esc(x.rate) + " per " + esc(a.unit) + (x.capacity ? " · up to " + x.capacity + " people" : "") + (x.description ? " · " + esc(x.description) : "") + "</div>";
  return head + '<div class="list">' + a.options.map((x) =>
    '<div class="it">' + (nav() ? '<button class="rowb" data-option="' + esc(x.id) + '">' + line(x) + "</button>" : line(x)) +
    (request ? '<div class="acts"><button class="btn go" data-pick-stay="' + esc(x.id) + '" data-name="' + esc(x.name) + '" data-total="' + esc(x.total) + '">' + esc(request.title) + "</button></div>" : "") + "</div>").join("") + "</div>" + errLine() + other +
    '<div class="actions"' + (nav() ? ' style="margin-top:12px"' : "") + '><button class="btn" data-act="again">Change dates</button></div>' + links("lookup");
}
function optionView() {
  const a = state.data.availability || { options: [] };
  const x = a.options.filter((o) => o.id === state.sel)[0];
  if (!x) return availabilityView();
  const request = opt("request");
  const row = (label, value) => (value ? "<tr><td>" + label + "</td><td>" + esc(value) + "</td></tr>" : "");
  return top(x.name) + '<div class="sum"><div><b>' + esc(x.total) + "</b><span>" + esc(a.when) + "</span></div></div>" +
    (x.description ? '<p class="about" style="margin:0 0 4px">' + esc(x.description) + "</p>" : "") +
    '<table class="tbl">' + row("Rate", x.rate + " per " + a.unit) + row("Fits", x.capacity ? "Up to " + x.capacity + " people" : "") + row("Taxes", a.tax) + "</table>" + errLine() +
    '<div class="actions" style="margin-top:14px">' + (request ? '<button class="primary" data-pick-stay="' + esc(x.id) + '" data-name="' + esc(x.name) + '" data-total="' + esc(x.total) + '">' + esc(request.title) + "</button>" : "") +
    '<button class="btn" data-act="again">Change dates</button></div>';
}
function slotsView() {
  const s = state.data.slots || { times: [], services: [] };
  const lookup = opt("lookup");
  const on = s.service ? s.service.id : "";
  return top(lookup ? lookup.title : "Open times") +
    '<div class="qlabel">What for?</div><div class="qs">' + s.services.map((x) => '<button class="q' + (x.id === on ? " on" : "") + '" data-service="' + esc(x.id) + '">' + esc(x.name) + (x.duration ? " · " + x.duration + " min" : "") + (x.price ? " · " + esc(x.price) : "") + "</button>").join("") + "</div>" +
    '<div class="qlabel" style="margin-top:12px">Open times on ' + esc(s.date) + "</div>" +
    (s.times.length ? '<div class="qs">' + s.times.map((t) => '<button class="q" data-time="' + esc(t) + '">' + esc(t) + "</button>").join("") + "</div>" : '<div class="empty">No open times that day.</div>') + errLine() +
    (nav() ? '<div class="qlabel" style="margin-top:12px">Day</div><div class="qs">' + dayChips(s.date) + "</div>" : "") +
    (nav() ? '<div class="form" style="margin-top:12px">' : "") +
    '<div class="row"' + (nav() ? "" : ' style="margin-top:12px"') + ">" + field("date", "Another day", { type: "date" }) + '<div class="actions" style="align-items:end">' + primary("Show times", "slots") + "</div></div>" + (nav() ? "</div>" : "") + links("lookup");
}
const estimateView = () => estimateBody() + links("lookup");
function estimateBody() {
  const e = state.data.estimate || {};
  const lookup = opt("lookup"), request = opt("request");
  const title = lookup ? lookup.title : "Estimate";
  if (e.rules) return top(title) + '<div class="list">' + e.rules.map((x) =>
    '<div class="it"><div class="nm"><b>' + esc(x.name) + '</b><span class="pr">from ' + esc(x.from) + "</span></div>" + (x.perUnit || x.note ? '<div class="bl">' + esc([x.perUnit, x.note].filter(Boolean).join(" · ")) + "</div>" : "") +
    '<div class="acts"><button class="btn go" data-rule="' + esc(x.id) + '" data-unit="' + esc(x.unit) + '">Estimate</button></div></div>').join("") + "</div>" + errLine();
  const r = e.rule || {};
  if (e.needSize) return '<div class="form">' + top(r.name || title) + '<div class="hint">' + esc(r.perUnit) + "</div>" + field("size", "How many " + (r.unit || "units") + "?", { type: "number", min: 1 }) + errLine() + '<div class="actions">' + primary("Work out the estimate", "estimate") + "</div></div>";
  return top(title) + '<div class="sum"><div><b>' + esc(e.amount) + "</b><span>" + esc(r.name) + (e.size ? ", " + e.size + " " + esc(r.unit || "units") : "") + '</span></div></div><div class="note">An estimate from published prices. The business confirms the final price.' + (r.note ? " " + esc(r.note) : "") + "</div>" + errLine() +
    '<div class="actions" style="margin-top:12px">' + (request ? '<button class="primary" data-pick-quote="' + esc(r.id) + '" data-name="' + esc(r.name) + '">' + esc(request.title) + "</button>" : "") + '<button class="btn" data-act="rules">Other services</button></div>';
}
function statusView() {
  const s = state.data.status || {};
  const body = s.missing ? '<div class="sum"><div><b>' + esc(s.ref || "No reference") + "</b><span>No status is published for this reference. The business replies to requests by email.</span></div></div>"
    : '<div class="sum"><div><b>' + esc(s.status) + "</b><span>" + esc(s.ref) + (s.updated ? " · updated " + esc(s.updated) : "") + "</span></div></div>" + (s.note ? '<div class="note">' + esc(s.note) + "</div>" : "");
  // 0.13.0: a payment's state, from the provider via the status tool.
  const pay = s.pay ? '<div style="margin:4px 0 6px">' + (s.pay.paid ? '<span class="paid">\u2713 Paid ' + esc(s.pay.total) + "</span>" : s.pay.waiting ? '<span class="wait">Waiting for payment</span>' : '<span class="wait">Not paid</span>') + "</div>" : "";
  if (s.pay && s.pay.waiting) state.payRef = s.ref;
  const again = s.pay && s.pay.waiting ? '<button class="btn" data-act="paid">Check again</button>' : "";
  return top("Status") + pay + body + '<div class="actions" style="margin-top:12px">' + again + '<button class="btn" data-act="status">Check another</button></div>' + links("status");
}
function linkButtons(list) {
  return (list || []).filter((l) => l && /^https:\/\//.test(l.href)).slice(0, 12).map((l) => '<button class="btn" data-href="' + esc(l.href) + '">' + esc(l.label) + "</button>").join("");
}
function contactView() {
  const c = state.data.contact || {};
  const row = (label, value, href) => (value ? "<tr><td>" + label + "</td><td>" + (href ? '<button class="link" data-href="' + esc(href) + '">' + esc(value) + "</button>" : esc(value)) + "</td></tr>" : "");
  const rows = row("Phone", c.phone, c.phone ? "tel:" + c.phone.replace(/[^+\d]/g, "") : "") + row("Email", c.email, c.email ? "mailto:" + c.email : "") + row("Website", c.website, c.website) + row("Address", c.address) + row("Hours", c.hours);
  // 0.5.0: the business's own WhatsApp number, when it saved one.
  // 0.6.0: buttons to the business's own pages (booking, directions, reviews), when it saved them.
  const more = linkButtons(c.links);
  const wa = c.whatsapp || more ? '<div class="actions" style="margin-top:12px">' + (c.whatsapp ? '<button class="btn wa" data-href="' + esc(c.whatsapp) + '">' + icon("whatsapp") + "Message on WhatsApp</button>" : "") + more + "</div>" : "";
  return top(c.name || "Contact") + (rows || wa ? (rows ? '<table class="tbl">' + rows + "</table>" : "") + wa : '<div class="empty">This business has not published contact details.</div>') + links("contact");
}
// 0.4.0: what the business has published about itself, with its questions and answers one tap away. Anything
// else is asked in the chat, where the assistant answers from the same published information.
function infoView() {
  const d = state.data.info || {};
  const faqs = d.faqs || [], services = d.services || [];
  const row = (label, value) => (value ? "<tr><td>" + label + "</td><td>" + esc(value) + "</td></tr>" : "");
  const facts = row("Hours", d.hours) + row("Address", d.address);
  const q = opt("question");
  const about = (d.sample ? '<div class="note" style="margin-top:6px">Sample data, not a real business.</div>' : "") + (d.summary ? '<p class="about">' + esc(d.summary) + "</p>" : "") +
    (facts ? '<table class="tbl">' + facts + "</table>" : "") +
    (services.length ? '<div class="qlabel" style="margin-top:12px">Services</div><div class="qs">' + services.map((x) => '<span class="tag">' + esc(x) + "</span>").join("") + "</div>" : "");
  const list = !faqs.length ? "" : '<div class="qlabel" style="margin-top:14px">Questions and answers</div>' +
    (faqs.length > 4 ? '<div class="find"><input type="search" data-f="filter" data-filter data-enter="none" value="' + esc(state.f.filter || "") + '" placeholder="Filter the questions"></div>' : "") +
    '<div class="list" style="margin-top:8px">' + faqs.map((f, i) =>
      '<div class="it faq" data-text="' + esc((f.q + " " + f.a).toLowerCase()) + '"><button class="rowb" data-faq="' + i + '"><div class="nm"><b>' + esc(f.q) + '</b><span class="pr">' + (state.faq === i ? "−" : "+") + "</span></div></button>" +
      (state.faq === i ? '<div class="bl">' + esc(f.a) + "</div>" : "") + "</div>").join("") + "</div>";
  return top(d.name ? "About " + d.name : q ? q.title : "Questions") + about + list +
    '<div class="form" style="margin-top:14px">' + field("question", faqs.length ? "Something else?" : "Your question", { type: "textarea", placeholder: (q && q.example) || "" }) + errLine() +
    '<div class="actions">' + primary("Ask in the chat", "askq") + '</div><div class="note" style="margin-top:0">What you see here is the information the business has published. Other questions are answered in the chat from the same information.</div></div>' + links("question");
}
// ---- Members (version 0.12.0, coworking) ----
// The business's published member businesses: a search box, its own industries and sites as filters, a member
// on its own screen, and "Find a collaborator". The card only shows what the business lists for each member; the customer
// writes or calls the member themselves.
const memberArgs = (over) => { const d = state.data.members || {}; return clean(Object.assign({ query: v("mq"), industry: d.industry, location: d.location }, over || {})); };
const membersAsk = (a) => (a.query ? "Which member businesses match " + a.query + "?" : "Which businesses are members here" + (a.industry ? " in " + a.industry : "") + (a.location ? " at " + a.location : "") + "?");
const findMembers = (over) => { const o = opt("members"), a = memberArgs(over); run(o && o.tool, a, membersAsk(a)); };
// 0.25.0: a member's logo, from BizPlug's site (card-logos.ts), or its initials when it has none or it fails to load.
const LEAVE = /^(of|the|and|for|in|at|llp|llc|inc|ltd|wll|qfc|co|plc|sa|ag|gmbh)$/i;
const initials = (n) => String(n || "").replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w && !LEAVE.test(w)).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";
const mlogo = (m, big) => (m.logo && /^https:\/\//.test(m.logo) ? '<span class="lg' + (big ? " big" : "") + '"><img src="' + esc(m.logo) + '" alt="" loading="lazy" data-fallback="' + esc(initials(m.name)) + '"></span>' : '<span class="lg mono' + (big ? " big" : "") + '">' + esc(initials(m.name)) + "</span>");
function membersView() {
  const d = state.data.members || { items: [] };
  const o = opt("members");
  const inds = d.industries || [], locs = d.locations || [];
  const chips = (list, attr, all, on) => '<div class="qs">' + chip(all, attr, "", !on) + list.map((x) => chip(esc(x.name) + " <small>" + x.count + "</small>", attr, x.name, x.name === on)).join("") + "</div>";
  const head = top(o ? o.title : "Members") +
    '<div class="find"><input type="search" data-f="mq" data-enter="mfind" value="' + esc(state.f.mq || "") + '" placeholder="A name, a kind of business, or what you need"><button class="btn" data-act="mfind">Search</button></div>' +
    (inds.length ? chips(inds, "data-mind", "All", d.industry) : "") +
    (locs.length > 1 ? '<div class="qlabel" style="margin-top:8px">Where</div>' + chips(locs, "data-mloc", "Anywhere", d.location) : "") +
    '<div class="actions" style="margin:12px 0"><button class="btn go" data-act="collab">Find a collaborator</button></div>';
  const items = d.items || [];
  if (!items.length) return head + '<div class="empty">No member matches' + (d.query ? ' "' + esc(d.query) + '"' : "") + ". Try other words or another filter.</div>" + errLine() + links("members");
  // 0.25.0: each member with its logo, and the list's size at the top when nothing narrows it.
  const logos = items.some((x) => "logo" in x);
  const text = (x) => '<div class="nm"><b>' + esc(x.name) + (x.level ? '<span class="lvl">' + esc(x.level) + "</span>" : "") + '</b><span class="qlabel">' + esc(x.industry) + "</span></div>" +
    (x.description ? '<div class="bl clamp">' + esc(x.description) + "</div>" : "") + (x.why ? '<div class="bl clamp">' + esc(x.why) + "</div>" : "");
  const rows = items.map((x) => logos
    ? '<div class="it mb"><button class="rowb" data-member="' + esc(x.id) + '">' + mlogo(x) + "<div>" + text(x) + "</div></button></div>"
    : '<div class="it"><button class="rowb" data-member="' + esc(x.id) + '">' + text(x) + "</button></div>").join("");
  const stats = logos && !d.query && !d.industry && !d.location && d.total
    ? '<div class="stats"><div class="stat"><b>' + d.total + "</b><span>members</span></div>" + (inds.length ? '<div class="stat"><b>' + inds.length + "</b><span>industries</span></div>" : "") + (locs.length > 1 ? '<div class="stat"><b>' + locs.length + "</b><span>areas</span></div>" : "") + "</div>"
    : "";
  return head.replace('<div class="find">', stats + '<div class="find">') + '<div class="list">' + rows + "</div>" + (d.more ? '<div class="note">' + d.more + " more: search or choose a filter to narrow the list.</div>" : "") + errLine() +
    '<div class="note">These are the details ' + esc(d.business || "the business") + " lists for its members. You contact a member directly; nobody introduces you or passes a message on.</div>" + links("members");
}
function memberView() {
  const m = state.mem[state.sel];
  if (!m) return membersView();
  const row = (label, value) => (value ? "<tr><td>" + label + "</td><td>" + esc(value) + "</td></tr>" : "");
  const web = /^https:\/\//.test(m.website), mail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email);
  const facts = row("Looking for", m.lookingFor) + row("Offers", m.offers) + row("Phone", m.phone) + (web ? "" : row("Website", m.website)) + (mail ? row("Email", m.email) : "") + row("Address", m.address);
  // 0.26.0: the member's LinkedIn page, and More about: a panel with its longer profile and Ask ChatGPT for more.
  const li = /^https:\/\//.test(m.linkedin || "");
  const more = "about" in m;
  const hero = "logo" in m
    ? '<div class="mhero">' + mlogo(m, true) + "<div><b>" + esc(m.name) + "</b><span>" + esc([m.industry, m.location].filter(Boolean).join(" · ")) + "</span>" + (m.level ? '<div style="margin-top:6px"><span class="lvl" style="margin:0">' + esc(m.level) + "</span></div>" : "") + "</div></div>"
    : m.industry || m.location ? '<div class="sum"><div><b>' + esc(m.industry || m.location) + "</b><span>" + esc(m.industry ? m.location : "") + "</span></div></div>" : "";
  return top(m.name) + hero +
    (m.description ? '<p class="about" style="margin:0 0 4px">' + esc(m.description) + "</p>" : "") + (facts ? '<table class="tbl">' + facts + "</table>" : "") +
    (web || mail || p().memberWrite ? '<div class="actions" style="margin-top:14px">' + (p().memberWrite ? '<button class="primary" data-act="mwrite">Write to them</button>' : "") + (web ? '<button class="btn go" data-href="' + esc(m.website) + '">Website</button>' : "") +
      (mail ? '<button class="btn" data-href="mailto:' + esc(m.email) + '">' + icon("mail") + "Email</button>" : "") + (li ? '<button class="btn" data-href="' + esc(m.linkedin) + '">LinkedIn</button>' : "") + "</div>" : "") +
    (more ? '<button class="tile wide morebtn" data-act="mfly"><span class="ic">' + icon("lookup") + '</span><div><div class="tt">More about ' + esc(m.name) + '</div><div class="dd">' + (m.about || (m.highlights || []).length ? "What they do, their main services and where it comes from" : "Ask ChatGPT what it knows or finds about them") + "</div></div></button>" : "") +
    '<div class="note">These are the contact details listed for ' + esc(m.name) + ". You write or call them yourself: " + esc((state.data.members || {}).business || "the business") + " and BizPlug do not introduce you, pass a message on or vouch for a member.</div>" +
    (more && state.fly === state.sel ? memberFly(m) : "");
}
const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } };
// 0.26.0: the More about panel. What the business lists for the member; anything more comes from the chat, and says so.
function memberFly(m) {
  const biz = (state.data.members || {}).business || "the business";
  return companyFly(m, biz, [m.industry, m.location].filter(Boolean).join(" · "), m.level, "member list");
}
// The More about panel for a member (0.26.0), an exhibitor or a sponsor (0.28.0): what the business lists for the
// company; anything more comes from the chat, and says so.
function companyFly(m, biz, sub, badge, listName) {
  const sites = (m.sources || []).map(hostOf).filter((h, i, a) => h && a.indexOf(h) === i);
  const prompt = "Tell me more about " + m.name + (/^https:\/\//.test(m.website || "") ? " (" + m.website + ")" : "") + ": what they do, recent news, and how I could work with them. You may use what you know and search the web; tell me which parts are not from " + biz + "'s " + listName + ".";
  return '<div class="fly" data-act="mflyx"><div class="sheet" role="dialog" aria-label="More about ' + esc(m.name) + '">' +
    '<div class="bar-top"><span class="kd">More about</span><button class="link" data-act="mflyx">Close ✕</button></div>' +
    '<div class="mhero" style="margin-top:8px">' + mlogo(m, true) + "<div><b>" + esc(m.name) + "</b><span>" + esc(sub || "") + "</span>" + (badge ? '<div style="margin-top:6px"><span class="lvl" style="margin:0">' + esc(badge) + "</span></div>" : "") + "</div></div>" +
    (m.about ? '<p class="about">' + esc(m.about) + "</p>" : m.description ? '<p class="about">' + esc(m.description) + "</p>" : "") +
    ((m.highlights || []).length ? '<div class="qlabel" style="margin-top:12px">Highlights</div><ul class="hl">' + m.highlights.map((h) => "<li>" + esc(h) + "</li>").join("") + "</ul>" : "") +
    (m.address ? '<div class="qlabel" style="margin-top:12px">Address</div><div class="bl" style="margin-top:3px">' + esc(m.address) + "</div>" : "") +
    (sites.length ? '<div class="note">From ' + sites.map(esc).join(", ") + ", listed by " + esc(biz) + ".</div>" : "") +
    '<div class="actions" style="margin-top:14px"><button class="primary" data-ask="' + esc(prompt) + '">Ask ChatGPT for more</button>' + (/^https:\/\//.test(m.website || "") ? '<button class="btn go" data-href="' + esc(m.website) + '">Website</button>' : "") + (/^https:\/\//.test(m.linkedin || "") ? '<button class="btn" data-href="' + esc(m.linkedin) + '">LinkedIn</button>' : "") + "</div>" +
    '<div class="note">Ask ChatGPT for more continues in the chat, where ChatGPT may add what it knows or finds on the web. That part does not come from ' + esc(biz) + "&rsquo;s list; check anything important with the company.</div></div></div>";
}
// ---- Committees, and news, events and newsletter (version 0.25.0, showcase) ----
// What the business published, with links to its own pages. Nothing is sent from these screens.
function committeesView() {
  const d = state.data.committees || { items: [] };
  const o = opt("committees");
  const items = d.items || [];
  const list = items.map((c) =>
    '<div class="cm"><b>' + esc(c.name) + "</b>" + (c.chair ? '<div class="ch">Chair: ' + esc(c.chair) + "</div>" : "") + (c.description ? "<p>" + esc(c.description) + "</p>" : "") +
    (/^https:\/\//.test(c.url) ? '<div class="actions" style="margin-top:10px"><button class="btn go" data-href="' + esc(c.url) + '">More about it</button></div>' : "") + "</div>").join("");
  const join = opt("request");
  return top(o ? o.title : "Committees") +
    '<div class="list" style="margin-top:10px">' + list + "</div>" +
    (join ? '<div class="actions" style="margin-top:14px"><button class="primary" data-ask="' + esc("I'd like to join a committee of " + (d.business || "the chamber") + ".") + '">Ask about joining a committee</button></div>' : "") +
    '<div class="note">These are the committees ' + esc(d.business || "the business") + " publishes. Who may join each one is up to " + esc(d.business || "the business") + ".</div>" + links("committees");
}
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function newsView() {
  const d = state.data.news || { items: [] };
  const o = opt("news");
  const n = d.newsletter;
  const today = d.today || isoDay(new Date());
  const items = d.items || [];
  const box = (x) => {
    // A date with only a month (YYYY-MM) shows the month large and the year under it.
    const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(x.date || "");
    const up = x.kind === "event" && x.date >= today;
    return m ? '<div class="dt' + (up ? " up" : "") + '"><b>' + (m[3] ? Number(m[3]) : MON[Number(m[2]) - 1]) + "</b><span>" + (m[3] ? MON[Number(m[2]) - 1] + " " + m[1].slice(2) : m[1]) + "</span></div>" : '<div class="dt"><b>·</b><span>' + (x.kind === "event" ? "Event" : "News") + "</span></div>";
  };
  const row = (x) => '<div class="it nw">' + box(x) + "<div>" +
    '<div class="kd">' + (x.kind === "event" ? (x.date >= today ? "Upcoming event" : "Past event") : "News") + (x.location ? " · " + esc(x.location) : "") + "</div>" +
    "<b>" + esc(x.title) + "</b>" + (x.summary ? '<div class="bl">' + esc(x.summary) + "</div>" : "") +
    (/^https:\/\//.test(x.url) ? '<div class="acts"><button class="btn" data-href="' + esc(x.url) + '">' + (x.kind === "event" ? "Event page" : "Read more") + "</button></div>" : "") + "</div></div>";
  const upcoming = items.filter((x) => x.kind === "event" && x.date >= today).sort((a, b) => (a.date < b.date ? -1 : 1));
  const rest = items.filter((x) => upcoming.indexOf(x) < 0);
  const issues = n && n.issues && n.issues.length ? '<div class="qlabel" style="margin-top:10px">Latest issues</div><div class="list" style="margin-top:6px">' + n.issues.slice(0, 4).map((i) => '<div class="it"><button class="rowb"' + (/^https:\/\//.test(i.url) ? ' data-href="' + esc(i.url) + '"' : "") + '><div class="nm"><b>' + esc(i.title) + '</b><span class="qlabel">' + esc(i.date || "") + "</span></div></button></div>").join("") + "</div>" : "";
  const letter = n ? '<div class="nl"><span class="kd">Newsletter' + (n.frequency ? " · " + esc(n.frequency) : "") + "</span><b>" + esc(n.name) + "</b>" + (n.description ? "<p>" + esc(n.description) + "</p>" : "") +
    '<div class="actions">' + (/^https:\/\//.test(n.signupUrl) ? '<button class="primary" data-href="' + esc(n.signupUrl) + '">Subscribe</button>' : "") + (/^https:\/\//.test(n.archiveUrl) ? '<button class="btn" data-href="' + esc(n.archiveUrl) + '">Past issues</button>' : "") + "</div>" + issues + "</div>" : "";
  return top(o ? o.title : "News & events") +
    (upcoming.length ? '<div class="qlabel" style="margin-top:6px">Coming up</div><div class="list" style="margin-top:6px">' + upcoming.map(row).join("") + "</div>" : "") +
    letter +
    (rest.length ? '<div class="qlabel">Latest</div><div class="list" style="margin-top:6px">' + rest.map(row).join("") + "</div>" : "") +
    '<div class="note">Published by ' + esc(d.business || "the business") + ". Links open its own pages.</div>" + links("news");
}
// ---- 0.30.0: Social media (social-feed.ts) ----
const NET = { instagram: ["IG", "#e1306c"], linkedin: ["in", "#0a66c2"], facebook: ["f", "#1877f2"], x: ["X", "#2b2b2b"], tiktok: ["TT", "#fe2c55"], youtube: ["▶", "#ff0033"], threads: ["@", "#2b2b2b"], bluesky: ["B", "#1185fe"], mastodon: ["M", "#6364ff"], podcast: ["P", "#8940fa"], blog: ["B", "#4b5563"], substack: ["S", "#ff6719"], medium: ["M", "#2b2b2b"], whatsapp: ["W", "#25d366"], pinterest: ["P", "#e60023"] };
const netBadge = (n) => { const x = NET[n] || ["•", "#666"]; return '<span class="nb" style="--nc:' + x[1] + '">' + esc(x[0]) + "</span>"; };
const netColor = (n) => (NET[n] || ["", "#666"])[1];
function socialView() {
  const d = state.data.social || { follow: [], posts: [], networks: [] };
  const o = opt("social");
  const on = state.socNet || "";
  const posts = (d.posts || []).filter((x) => !on || x.network === on);
  const date = (x) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(x.date || ""); return m ? Number(m[3]) + " " + MON[Number(m[2]) - 1] + " " + m[1] : ""; };
  const pic = (x, big) => '<div class="pic" style="--nc:' + netColor(x.network) + '">' + (x.image ? '<img src="' + esc(x.image) + '" alt="" loading="lazy" data-soc-img>' : '<span class="big">' + esc((NET[x.network] || ["•"])[0]) + "</span>") + netBadge(x.network) + (x.pinned ? '<span class="pin">Pinned</span>' : "") + "</div>";
  const body = (x) => '<div class="bd"><div class="kd">' + esc(x.name) + (date(x) ? " · " + esc(date(x)) : "") + "</div>" + (x.title ? "<b>" + esc(x.title) + "</b>" : "") + (x.text && x.text !== x.title ? "<p>" + esc(x.text) + "</p>" : "") + "</div>";
  const follow = (d.follow || []).length ? '<div class="qlabel">Follow ' + esc(d.business || "") + '</div><div class="follow">' + d.follow.map((f) => '<button class="fl" data-href="' + esc(f.url) + '">' + netBadge(f.network) + esc(f.name) + "</button>").join("") + "</div>" : "";
  const filters = (d.networks || []).length > 1 ? '<div class="qs" style="margin:2px 0 6px">' + chip("All", "data-soc", "", !on) + d.networks.map((n) => chip(esc(n.name) + " <small>" + n.count + "</small>", "data-soc", n.network, on === n.network)).join("") + "</div>" : "";
  const first = posts[0];
  const feat = first ? '<button class="feat" data-href="' + esc(first.url) + '">' + pic(first, true) + body(first) + "</button>" : '<div class="empty">No recent posts to show right now.</div>';
  const rail = posts.length > 1 ? '<div class="qlabel">More posts</div><div class="rail" style="margin-top:6px">' + posts.slice(1).map((x) => '<button class="sc" data-href="' + esc(x.url) + '">' + pic(x) + body(x) + "</button>").join("") + "</div>" : "";
  return top(o ? o.title : "Social media") + '<div class="soc">' + follow + filters + feat + rail + "</div>" +
    '<div class="note">From ' + esc(d.business || "the business") + "&rsquo;s own accounts. Each post opens on its network.</div>" + links("social");
}
function collabView() {
  return '<div class="form">' + top("Find a collaborator") + '<div class="hint">Say what you need, what you can offer, or both, to see the members whose entries match.</div>' +
    field("mneed", "What do you need?", { optional: true, placeholder: "e.g. help with a website" }) + field("moffer", "What can you offer?", { optional: true, placeholder: "e.g. bookkeeping for small teams" }) + errLine() +
    '<div class="actions">' + primary("Show matching members", "match") + "</div>" +
    '<div class="note" style="margin-top:0">Your words are matched against each member&rsquo;s entry, above all what it offers and what it is looking for. You contact a member directly.</div></div>';
}
// 0.21.0: a first message to one member, drafted by write_to_member for the person to send themselves.
function mwriteView() {
  const m = state.mem[state.sel];
  if (!m) return membersView();
  return '<div class="form">' + top("Write to " + m.name) + '<div class="hint">Say who you are and what you would like to discuss. The card drafts a first message; you read it and send it yourself.</div>' +
    field("wname", "Your name", { placeholder: "First and last name" }) + field("wcompany", "Your company", { optional: true }) + field("wemail", "Your email", { optional: true, type: "email", placeholder: "To sign the message" }) +
    field("wmsg", "What would you like to discuss?", { type: "textarea", placeholder: "e.g. We are looking for a logistics partner for our new plant." }) + errLine() +
    '<div class="actions">' + primary("Draft my message", "mdraft") + "</div>" +
    '<div class="note" style="margin-top:0">Nothing is sent from here. ' + esc((state.data.members || {}).business || "The business") + " and BizPlug do not introduce you, pass a message on or vouch for a member.</div></div>";
}
function memberMessageView() {
  const d = state.data.memberMessage || {};
  const routes = d.routes || [];
  const label = { email: "Open in email", whatsapp: "Open in WhatsApp", website: "Website" };
  const btn = (r, i) => '<button class="btn' + (r.kind === "whatsapp" ? " wa" : i === 0 ? " go" : "") + '" data-href="' + esc(r.url) + '">' + (r.kind === "whatsapp" ? icon("whatsapp") : r.kind === "email" ? icon("mail") : "") + esc(label[r.kind] || r.label) + "</button>";
  return top("Your message to " + ((d.member || {}).name || "the member")) +
    '<div class="sum"><div><b>' + esc(d.subject || "") + '</b><span>Subject</span></div></div>' +
    '<div class="draft" style="white-space:pre-wrap;border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:10px 0;font-size:14px;line-height:1.5">' + esc(d.body || "") + "</div>" +
    (routes.length ? '<div class="actions">' + routes.map(btn).join("") + "</div>" : '<div class="empty">This member published no email, WhatsApp number or website here. Copy the message and use another way you know.</div>') +
    '<div class="note">You send it yourself from your own email or WhatsApp. Nothing was sent by this card, ' + esc(d.business || "the business") + " or BizPlug. Check that a number uses WhatsApp before relying on it.</div>";
}

// ---- Tours and day passes (version 0.22.0, coworking) ----
// The business's published locations (plugin.visits.locations): a tour where it gives tours, a day pass where it
// sells one. The rate and the tour hours are shown as the business published them; the total comes with the result.
const vlocs = (kind) => ((p().visits || {}).locations || []).filter((l) => (kind === "tour" ? l.tours : l.dayPass));
const vloc = (kind) => { const list = vlocs(kind); return list.find((l) => l.name === v("vloc")) || (list.length === 1 ? list[0] : null); };
const vcontact = () => !p().visits || p().visits.contact !== false;
function openVisit(kind, location) {
  state.vkind = kind; state.error = "";
  if (location) state.f.vloc = location;
  state.view = "visitform"; render();
}
function visitFormView() {
  const kind = state.vkind === "daypass" ? "daypass" : "tour", tour = kind === "tour";
  const o = opt(kind), list = vlocs(kind), loc = vloc(kind);
  const where = list.length > 1 ? '<div class="qlabel">Location</div><div class="qs" style="margin-top:0">' + list.map((l) => chip(esc(l.name), "data-vloc", l.name, Boolean(loc && loc.name === l.name))).join("") + "</div>" : "";
  const facts = loc ? [loc.address, tour ? (loc.tourHours ? "Tours: " + loc.tourHours : "") : (loc.rate || "The business confirms the price"), !tour && loc.includes ? "Includes: " + loc.includes : ""].filter(Boolean) : [];
  const info = loc ? '<div class="sum sm" style="margin:0"><div><b>' + esc(loc.name) + "</b>" + facts.map((x) => "<span style=\"display:block\">" + esc(x) + "</span>").join("") + "</div></div>" : "";
  const fields = tour
    ? '<div class="row three">' + field("vdate", "Day", { type: "date" }) + field("vtime", "Time", { optional: true, placeholder: "10:00 or morning" }) + field("vpeople", "People", { type: "number", min: 1, placeholder: "1" }) + "</div>"
    : '<div class="row">' + field("vdate", "Day", { type: "date" }) + field("vpeople", "People", { type: "number", min: 1, placeholder: "1" }) + "</div>";
  const days = '<div><div class="qlabel">Or pick the day</div><div class="qs">' + dayChoices(6).map((c) => chip(esc(c.label), "data-vday", c.start, v("vdate") === c.start)).join("") + "</div></div>";
  const who = vcontact() ? '<div class="row">' + field("name", "Your name") + field("email", "Your email", { type: "email" }) + "</div>" : "";
  return '<div class="form">' + top(o ? o.title : tour ? "Book a tour" : "Day pass") + '<div class="hint">' + esc((o && o.description) || "") + "</div>" +
    where + info + fields + days + who + errLine() +
    '<div class="actions">' + primary(vcontact() ? (tour ? "Send tour request" : "Send day pass request") : "Continue", "visit") + "</div>" +
    '<div class="note" style="margin-top:0">' + (vcontact() ? "The business confirms by email. Nothing is booked or paid here." : "Next you continue with the business on WhatsApp. Nothing is sent from here, and nothing is booked until the business confirms.") + "</div></div>";
}
function visitView() {
  const d = state.data.visit || {};
  const ok = /^https:\/\//.test(d.link || "");
  return '<div class="sent"><b>' + esc(d.title) + "</b>" + (d.lines || []).map((l) => "<p>" + esc(l) + "</p>").join("") + "</div>" +
    '<div class="sent" style="margin-top:10px"><b>' + (d.assistant ? "Message to send on WhatsApp" : "Your WhatsApp message") + '</b><p class="msg">' + esc(d.message) + "</p>" +
    (d.assistant ? "<ol><li>Tap Continue on WhatsApp and send the message it fills in" + (d.join ? " (" + esc(d.join) + ")" : "") + ", as it is.</li><li>Then send the message above.</li></ol>" : "") +
    '<p class="note">' + esc(d.note) + "</p></div>" +
    '<div class="actions" style="margin-top:12px">' + (ok ? '<button class="btn wa" data-href="' + esc(d.link) + '">' + icon("whatsapp") + "Continue on WhatsApp</button>" : "") + '<button class="btn" data-view="menu">← Menu</button>' + contactButton() + "</div>";
}
function visitsView() {
  const d = state.data.visits || { locations: [] };
  const tour = opt("tour"), pass = opt("daypass");
  const rows = (d.locations || []).map((l) =>
    '<div class="it"><div class="nm"><b>' + esc(l.name) + "</b></div>" + (l.address ? '<div class="bl">' + esc(l.address) + "</div>" : "") +
    '<div class="bl">' + (l.tours ? "Tours: " + esc(l.tourHours || "on request") : "No tours at this location") + "</div>" +
    '<div class="bl">' + (l.dayPass ? "Day pass: " + esc(l.rate || "the business confirms the price") + (l.includes ? " · " + esc(l.includes) : "") : "No day pass at this location") + "</div>" +
    ((l.tours && tour) || (l.dayPass && pass) ? '<div class="acts">' + (l.tours && tour ? '<button class="btn go" data-vgo="tour" data-loc="' + esc(l.name) + '">' + esc(tour.title) + "</button>" : "") +
      (l.dayPass && pass ? '<button class="btn" data-vgo="daypass" data-loc="' + esc(l.name) + '">' + esc(pass.title) + "</button>" : "") + "</div>" : "") + "</div>").join("");
  return top("Tours and day passes") + (d.sample ? '<div class="note" style="margin-top:6px">Sample data, not a real business.</div>' : "") +
    '<div class="list" style="margin-top:10px">' + (rows || '<div class="empty">No locations are published.</div>') + "</div>" +
    '<div class="note">As published by ' + esc(d.business || "the business") + ". The business confirms every tour and day pass; nothing is booked or paid here.</div>" + links("");
}

// ---- Software products (version 0.15.0) ----
const findIn = (kind, over) => { const o = opt(kind); const a = clean(Object.assign({ query: v(kind === "features" ? "fq" : "gq") }, over || {})); run(o && o.tool, a, (o && o.example) || ""); };
function featuresView() {
  const d = state.data.features || { items: [] };
  const o = opt("features");
  const head = top(o ? o.title : "Features") + '<div class="find"><input type="search" data-f="fq" data-enter="ffind" value="' + esc(state.f.fq || "") + '" placeholder="A feature, or what you want to do"><button class="btn" data-act="ffind">Search</button></div><div style="height:8px"></div>';
  const items = d.items || [];
  if (!items.length) return head + '<div class="empty">' + (d.query ? 'No feature matches "' + esc(d.query) + '". Try other words.' : "No features are published yet.") + "</div>" + errLine() + links("features");
  return head + '<div class="list">' + items.map((x) => '<div class="it"><div class="nm"><b>' + esc(x.name) + "</b>" + (x.plan ? '<span class="tag">' + esc(x.plan) + "</span>" : "") + "</div>" +
    (x.description ? '<div class="bl">' + esc(x.description) + "</div>" : "") + (x.guide ? '<div class="acts"><button class="btn" data-href="' + esc(x.guide) + '">Guide</button></div>' : "") + "</div>").join("") + "</div>" +
    (d.more ? '<div class="note">' + d.more + " more: search to narrow the list.</div>" : "") + errLine() + links("features");
}
function pricingView() {
  const d = state.data.pricing || { plans: [] };
  const o = opt("pricing");
  const plans = d.plans || [];
  const page = d.url ? '<div class="actions" style="margin-top:12px"><button class="btn go" data-href="' + esc(d.url) + '">' + (plans.length ? "Full pricing" : "See plans and prices") + "</button></div>" : "";
  if (!plans.length) return top(o ? o.title : "Pricing") + '<div class="sum"><div><b>' + (d.url ? "Plans and prices" : "Pricing") + "</b><span>" + (d.url ? "Every plan and its price are on " + esc(d.business || "the") + "’s own pricing page." : "No pricing is published here. Ask the team in the chat or with Contact.") + "</span></div></div>" + page + links("pricing");
  return top(o ? o.title : "Pricing") + '<div class="list">' + plans.map((x) => '<div class="it"><div class="nm"><b>' + esc(x.name) + '</b><span class="pr">' + esc([x.price, x.billing].filter(Boolean).join(" ")) + "</span></div>" + (x.includes ? '<div class="bl">' + esc(x.includes) + "</div>" : "") + "</div>").join("") + "</div>" + page +
    '<div class="note">As published by ' + esc(d.business || "the business") + ". Nothing is bought or started here.</div>" + links("pricing");
}
function guidesView() {
  const d = state.data.guides || { items: [] };
  const o = opt("guides");
  const topics = d.topics || [];
  const head = top(o ? o.title : "Help & guides") + '<div class="find"><input type="search" data-f="gq" data-enter="gfind" value="' + esc(state.f.gq || "") + '" placeholder="What do you need help with?"><button class="btn" data-act="gfind">Search</button></div>' +
    (topics.length > 1 ? '<div class="qs" style="margin:8px 0 12px">' + chip("All", "data-gtopic", "", !d.topic) + topics.map((t) => chip(esc(t.name) + " <small>" + t.count + "</small>", "data-gtopic", t.name, t.name === d.topic)).join("") + "</div>" : '<div style="height:8px"></div>');
  const items = d.items || [];
  const docs = d.docs ? '<div class="actions" style="margin-top:12px"><button class="btn" data-href="' + esc(d.docs) + '">All documentation</button></div>' : "";
  if (!items.length) return head + '<div class="empty">' + (d.query ? 'No article matches "' + esc(d.query) + '".' : "No help articles are published here yet.") + "</div>" + docs + errLine() + links("guides");
  return head + '<div class="list">' + items.map((g) => '<div class="it"><button class="rowb" data-href="' + esc(g.url) + '"><div class="nm"><b>' + esc(g.title) + "</b>" + (g.topic ? '<span class="qlabel">' + esc(g.topic) + "</span>" : "") + "</div>" + (g.summary ? '<div class="bl clamp">' + esc(g.summary) + "</div>" : "") + "</button></div>").join("") + "</div>" +
    (d.more ? '<div class="note">' + d.more + " more: search or choose a topic.</div>" : "") + docs + errLine() + links("guides");
}
function supportView() {
  const o = opt("support");
  return '<div class="form">' + top(o ? o.title : "Support") + '<div class="hint">' + esc((o && o.description) || "") + "</div>" +
    field("stopic", "Subject", { placeholder: "e.g. I can’t sign in" }) + field("smessage", "What happened?", { type: "textarea", placeholder: "What you were doing, what you expected, and what you saw" }) + whoFields() + errLine() +
    '<div class="actions">' + primary("Send to support", "support") + '</div><div class="note" style="margin-top:0">The support team replies by email. You get a reference to check it later.</div></div>' + links("support");
}

// ---- Event guide (version 0.18.0) ----
// What the show or conference published: its agenda by day, its speakers, its exhibitors and sponsors. The customer
// contacts a company directly; an enquiry goes to the organisers.
const pastNote = (d) => (d && d.past && d.when ? '<div class="sum"><div><b>Took place ' + esc(d.when) + "</b><span>This is the programme as it was published.</span></div></div>" : "");
const runShow = (kind, args) => { const o = opt(kind); run(o && o.tool, clean(args), (o && o.example) || ""); };
function agendaView() {
  const d = state.data.agenda || { items: [] };
  const o = opt("agenda");
  const days = d.days || [];
  const head = top(o ? o.title : "Agenda") + pastNote(d) +
    '<div class="find"><input type="search" data-f="aq" data-enter="afind" value="' + esc(state.f.aq || "") + '" placeholder="A topic, a speaker or a format"><button class="btn" data-act="afind">Search</button></div>' +
    (days.length > 1 ? '<div class="qs" style="margin:8px 0 12px">' + chip("All days", "data-aday", "", !d.date) + days.map((x) => chip(esc(x.label) + " <small>" + x.count + "</small>", "data-aday", x.date, x.date === d.date)).join("") + "</div>" : '<div style="height:8px"></div>');
  const items = d.items || [];
  if (!items.length) return head + '<div class="empty">' + (d.query ? 'No session matches "' + esc(d.query) + '".' : "No agenda is published here yet.") + "</div>" + errLine() + links("agenda");
  let day = "";
  const rows = items.map((x) => {
    const sub = !d.date && x.day !== day ? '<div class="cat">' + esc(x.day) + "</div>" : "";
    day = x.day;
    const open = state.ses === x.id;
    return sub + '<div class="it"><button class="rowb" data-ses="' + esc(x.id) + '"><div class="nm"><b>' + esc(x.title) + '</b><span class="qlabel">' + esc([x.start, x.end].filter(Boolean).join("–")) + "</span></div>" +
      '<div class="bl' + (open ? "" : " clamp") + '">' + esc([x.format, x.stage, x.speakers].filter(Boolean).join(" · ")) + "</div>" + (open && x.description ? '<div class="bl">' + esc(x.description) + "</div>" : "") + "</button></div>";
  }).join("");
  return head + '<div class="list">' + rows + "</div>" + (d.more ? '<div class="note">' + d.more + " more: choose a day or search.</div>" : "") + errLine() + links("agenda");
}
function speakersView() {
  const d = state.data.speakers || { items: [] };
  const o = opt("speakers");
  const head = top(o ? o.title : "Speakers") + '<div class="find"><input type="search" data-f="pq" data-enter="pfind" value="' + esc(state.f.pq || "") + '" placeholder="A name, a company or a topic"><button class="btn" data-act="pfind">Search</button></div><div style="height:8px"></div>';
  const items = d.items || [];
  if (!items.length) return head + '<div class="empty">' + (d.query ? 'No speaker matches "' + esc(d.query) + '".' : "No speakers are published here yet.") + "</div>" + errLine() + links("speakers");
  return head + '<div class="list">' + items.map((x) => '<div class="it"><button class="rowb" data-spk="' + esc(x.id) + '"><div class="nm"><b>' + esc(x.name) + "</b></div>" +
    '<div class="bl clamp">' + esc([x.title, x.company].filter(Boolean).join(", ")) + "</div></button></div>").join("") + "</div>" +
    (d.more ? '<div class="note">' + d.more + " more: search to narrow the list.</div>" : "") + errLine() + links("speakers");
}
function speakerView() {
  const x = state.spk[state.sel];
  if (!x) return speakersView();
  const sessions = x.sessions || [];
  return top(x.name) + (x.title || x.company ? '<div class="sum"><div><b>' + esc(x.title || x.company) + "</b><span>" + esc(x.title ? x.company : "") + "</span></div></div>" : "") +
    (x.bio ? '<p class="about" style="margin:0 0 4px">' + esc(x.bio) + "</p>" : "") +
    (sessions.length ? '<div class="qlabel" style="margin-top:12px">Speaks in</div><div class="list" style="margin-top:6px">' + sessions.map((s) => '<div class="it"><div class="nm"><b>' + esc(s.title) + '</b><span class="qlabel">' + esc([s.day, s.start].filter(Boolean).join(" ")) + "</span></div></div>").join("") + "</div>" : "") +
    (x.linkedin ? '<div class="actions" style="margin-top:14px"><button class="btn" data-href="' + esc(x.linkedin) + '">LinkedIn</button></div>' : "");
}
function exhibitorsView() {
  const d = state.data.exhibitors || { items: [] };
  const o = opt("exhibitors");
  const cats = d.categories || [];
  const head = top(o ? o.title : "Exhibitors & sponsors") +
    '<div class="find"><input type="search" data-f="xq" data-enter="xfind" value="' + esc(state.f.xq || "") + '" placeholder="A company, or what you are looking for"><button class="btn" data-act="xfind">Search</button></div>' +
    (cats.length > 1 ? '<div class="qs" style="margin:8px 0 12px">' + chip("All", "data-xcat", "", !d.category) + cats.map((c) => chip(esc(c.name) + " <small>" + c.count + "</small>", "data-xcat", c.name, c.name === d.category)).join("") + "</div>" : '<div style="height:8px"></div>');
  const items = d.items || [];
  if (!items.length) return head + '<div class="empty">' + (d.query ? 'Nothing matches "' + esc(d.query) + '".' : "No exhibitors or sponsors are published here yet.") + "</div>" + errLine() + links("exhibitors");
  // 0.28.0: each company with its logo, or its initials.
  const text = (x) => '<div class="nm"><b>' + esc(x.name) + (x.stand ? '<span class="lvl">Stand ' + esc(x.stand) + "</span>" : "") + '</b><span class="qlabel">' + esc(x.kind === "sponsor" ? x.role || x.category : x.category) + "</span></div>" +
    (x.description ? '<div class="bl clamp">' + esc(x.description) + "</div>" : "");
  return head + '<div class="list">' + items.map((x) => "logo" in x
    ? '<div class="it mb"><button class="rowb" data-exh="' + esc(x.id) + '">' + mlogo(x) + "<div>" + text(x) + "</div></button></div>"
    : '<div class="it"><button class="rowb" data-exh="' + esc(x.id) + '">' + text(x) + "</button></div>").join("") + "</div>" +
    (d.more ? '<div class="note">' + d.more + " more: search or choose a category.</div>" : "") + errLine() +
    '<div class="note">As listed by ' + esc(d.business || "the event") + ". You contact a company directly; nobody introduces you or passes a message on.</div>" + links("exhibitors");
}
function exhibitorView() {
  const x = state.exh[state.sel];
  if (!x) return exhibitorsView();
  const row = (label, value) => (value ? "<tr><td>" + label + "</td><td>" + esc(value) + "</td></tr>" : "");
  const web = /^https:\/\//.test(x.website), mail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x.email);
  const facts = row("Role", x.role) + row("Stand", x.stand) + row("City", x.city) + row("Phone", x.phone) + (mail ? row("Email", x.email) : "");
  const biz = (state.data.exhibitors || {}).business || "the event";
  const label = x.kind === "sponsor" ? "Sponsor" : "Exhibitor";
  // 0.28.0: the company's logo, its LinkedIn, and More about with Ask ChatGPT for more.
  const more = "about" in x, li = /^https:\/\//.test(x.linkedin || "");
  const hero = "logo" in x
    ? '<div class="mhero">' + mlogo(x, true) + "<div><b>" + esc(x.name) + "</b><span>" + esc([label, x.category].filter(Boolean).join(" · ")) + "</span>" + (x.stand ? '<div style="margin-top:6px"><span class="lvl" style="margin:0">Stand ' + esc(x.stand) + "</span></div>" : "") + "</div></div>"
    : '<div class="sum"><div><b>' + esc(label) + "</b><span>" + esc(x.category) + "</span></div></div>";
  return top(x.name) + hero +
    (x.description ? '<p class="about" style="margin:0 0 4px">' + esc(x.description) + "</p>" : "") + (facts ? '<table class="tbl">' + facts + "</table>" : "") +
    (web || mail || li ? '<div class="actions" style="margin-top:14px">' + (web ? '<button class="btn go" data-href="' + esc(x.website) + '">Website</button>' : "") + (mail ? '<button class="btn" data-href="mailto:' + esc(x.email) + '">' + icon("mail") + "Email</button>" : "") + (li ? '<button class="btn" data-href="' + esc(x.linkedin) + '">LinkedIn</button>' : "") + "</div>" : "") +
    (more ? '<button class="tile wide morebtn" data-act="mfly"><span class="ic">' + icon("lookup") + '</span><div><div class="tt">More about ' + esc(x.name) + '</div><div class="dd">' + (x.about || (x.highlights || []).length ? "What they do, their products and where it comes from" : "Ask ChatGPT what it knows or finds about them") + "</div></div></button>" : "") +
    '<div class="note">These are the details ' + esc(biz) + " lists. You contact " + esc(x.name) + " yourself.</div>" +
    (more && state.fly === state.sel ? companyFly(x, biz, [label, x.category].filter(Boolean).join(" · "), x.stand ? "Stand " + x.stand : "", "exhibitor and sponsor list") : "");
}
const TOPICS = ["Exhibiting", "Sponsoring", "Visiting", "Speaking", "Other"];
function enquiryView() {
  const o = opt("enquiry");
  return '<div class="form">' + top(o ? o.title : "Send an enquiry") + '<div class="hint">' + esc((o && o.description) || "") + "</div>" +
    '<div class="qlabel">About</div><div class="qs">' + TOPICS.map((t) => chip(esc(t), "data-etopic", t, v("etopic") === t)).join("") + "</div>" +
    field("emessage", "Your enquiry", { type: "textarea", placeholder: "What you would like to know or arrange" }) + field("ecompany", "Company", { optional: true }) + whoFields() + errLine() +
    '<div class="actions">' + primary("Send enquiry", "enquiry") + '</div><div class="note" style="margin-top:0">The organisers reply by email. You get a reference.</div></div>' + links("enquiry");
}

function requestView() {
  const k = state.pick || {};
  const request = opt("request");
  const title = request ? request.title : "Request";
  let summary = "", extra = "";
  if (k.type === "order") { const items = nav() ? Object.keys(state.cart).filter((id) => state.cart[id]).map((id) => state.items[id] || { id: id, name: id }) : (state.data.catalog || { items: [] }).items.filter((x) => state.cart[x.id]); summary = items.map((x) => state.cart[x.id] + " × " + x.name).join(", "); extra = field("when", "Pickup time", { optional: true, placeholder: "e.g. today 5:30pm" }); }
  else if (k.type === "stay") { const a = state.data.availability || {}; summary = k.name + " · " + (a.when || "") + " · " + k.total; }
  else if (k.type === "appt") summary = k.name + " · " + k.date + " at " + k.time;
  else if (k.type === "quote") { summary = k.name + (k.size ? " · " + k.size : ""); extra = field("location", "Address or ZIP code", { optional: true }); }
  else extra = field("topic", "Subject", { placeholder: "A short title" }) + field("message", "Details", { type: "textarea", placeholder: "What you need, in your own words" });
  return '<div class="form">' + top(title) + (summary ? '<div class="sum"><div><span>' + esc(summary) + "</span></div></div>" : "") + extra + whoFields() +
    (k.type === "track" ? "" : field("notes", "Anything else?", { optional: true })) + errLine() +
    '<div class="actions">' + primary("Send request", "request") + '<button class="btn" data-act="unpick">Back</button></div>' +
    '<div class="note">The business confirms every request itself. Nothing is booked, held or charged here.</div></div>';
}
// 0.13.0: the pay step. The total and the provider come from the server; the card only opens the provider's own page
// (card details are never typed here) and asks the status tool whether it was paid.
function payBox(s) {
  const pay = s.pay;
  if (!pay || !/^https:\/\//.test(pay.url)) return "";
  state.payRef = s.reference;
  return '<div class="pay"><div class="amt"><div><span>To pay' + (pay.testMode ? '<span class="tag">TEST</span>' : "") + "</span><b>" + esc(pay.total) + "</b></div><span>" + esc(pay.provider) + " checkout</span></div>" +
    '<div class="actions"><button class="primary" data-href="' + esc(pay.url) + '">Pay now</button>' + (opt("status") && !pay.door ? '<button class="btn" data-act="paid">I\u2019ve paid</button>' : "") + "</div>" +
    "<p>You pay on " + esc(pay.provider) + "\u2019s page, in the business\u2019s name. Card details are never entered in ChatGPT." + (pay.testMode ? " Test mode: no real money; use the test card 4242 4242 4242 4242." : "") + " The page stays open for 30 minutes.</p></div>";
}
function sentView() {
  const s = state.data.sent || { lines: [] };
  const box = payBox(s);
  // A card that draws the pay step drops the same link from the plain buttons.
  const others = box ? (s.links || []).filter((l) => !s.pay || l.href !== s.pay.url) : s.links;
  return '<div class="sent"><b>' + esc(s.title || "Request sent") + '</b><p>Reference <strong>'  + esc(s.reference) + "</strong></p>" + s.lines.map((l) => "<p>" + esc(l) + "</p>").join("") + '<p class="note">' + esc(s.note) + "</p></div>" + box + '<div class="actions" style="margin-top:12px"><button class="btn" data-view="menu">← Menu</button>' + (s.whatsapp ? '<button class="btn wa" data-href="' + esc(s.whatsapp) + '">' + icon("whatsapp") + "Message on WhatsApp</button>" : "") + linkButtons(others) + contactButton() + "</div>";
}
// 0.4.0: from a sent request, the business's contact details are one tap away.
function contactButton() {
  const i = state.options.findIndex((o) => o.kind === "contact");
  return nav() && i >= 0 ? '<button class="btn" data-open="' + i + '">' + esc(state.options[i].title) + "</button>" : "";
}
function whatsappView() {
  const w = state.data.whatsapp || { steps: [] };
  return '<div class="sent"><b>' + esc(w.title) + "</b><ol>" + w.steps.map((s) => "<li>" + esc(s) + "</li>").join("") + '</ol><p class="note">' + esc(w.note) + '</p></div><div class="actions" style="margin-top:12px"><button class="btn wa" data-href="' + esc(w.link) + '">' + icon("whatsapp") + 'Open WhatsApp</button><button class="btn" data-view="menu">← Menu</button></div>';
}

function requestArgs() {
  const k = state.pick || {};
  const base = Object.assign({}, who(), clean({ notes: v("notes") }));
  if (k.type === "order") { need(cartCount() > 0, "Choose at least one item."); return Object.assign(base, { items: Object.keys(state.cart).filter((id) => state.cart[id]).map((id) => ({ id, quantity: state.cart[id] })), fulfilment: "pickup" }, clean({ when: v("when") })); }
  if (k.type === "stay") return Object.assign(base, clean({ option: k.id, start: v("start"), end: v("end"), guests: num("guests") }));
  if (k.type === "appt") return Object.assign(base, { service: k.id, date: k.date, time: k.time });
  if (k.type === "quote") return Object.assign(base, clean({ service: k.id, size: k.size, location: v("location") }));
  need(v("topic"), "Add a subject."); need(v("message"), "Add the details.");
  delete base.notes;
  return Object.assign(base, { topic: v("topic"), message: v("message") });
}
// ---- Account menu (version 0.19.0) ----
// The business's own server declares these entries (plugin.account); the card only draws them. "form" asks for
// fields and runs a tool, "list" shows a tool's items and opens one, "chat" hands over to the chat.
const acct = { item: null, rows: [], row: null, detail: null, sel: {}, picks: {}, done: "", note: "", from: "" };
const aitems = () => p().account || [];
const aitem = (key) => aitems().find((x) => x.key === key) || null;
const at = (o, path) => String(path || "").split(".").reduce((x, k) => (x == null ? undefined : x[k]), o);
const shown = (x, as) => {
  if (x == null || typeof x === "object") return "";
  if (as === "date") { const d = new Date(x); if (!isNaN(d.getTime())) return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); }
  return String(x);
};
const canCall = () => Boolean(p().inCard && oa() && oa().callTool);
async function acall(tool, args) { return pickStructured(await oa().callTool(tool, clean(args || {}))) || {}; }
const picked = (it) => (it.pick ? acct.sel[it.pick.tool] || null : null);
const withPick = (it, args) => { const s = picked(it); const o = Object.assign({}, it.args || {}, args || {}); if (it.pick && s) o[it.pick.arg] = s.value; return o; };
async function busyDo(fn) {
  state.busy = true; state.error = ""; render();
  try { await fn(); } catch (e) { state.error = (e && e.message) || "That did not work."; if (state.view === "await") state.view = "aform"; }
  state.busy = false; render();
}
async function loadPicks(it) {
  if (!it.pick || acct.picks[it.pick.tool]) return;
  const r = await acall(it.pick.tool, {});
  const rows = (Array.isArray(r.items) ? r.items : []).map((x) => ({ value: shown(at(x, it.pick.value)), label: shown(at(x, it.pick.label)) })).filter((x) => x.value).slice(0, 12);
  acct.picks[it.pick.tool] = rows;
  if (!acct.sel[it.pick.tool] && rows[0]) acct.sel[it.pick.tool] = rows[0];
}
async function loadList(it) { const r = await acall(it.tool, withPick(it)); acct.rows = Array.isArray(r.items) ? r.items.slice(0, 50) : []; }
function openAccount(key, from) {
  const it = aitem(key);
  if (!it) return;
  // Without a card that can run tools, the chat does it: the assistant calls the tool, and asks for sign-in.
  if (!canCall()) { ask(it.example); return; }
  acct.item = it; acct.from = from || ""; acct.rows = []; acct.row = null; acct.detail = null; acct.done = "";
  state.view = it.mode === "list" ? "alist" : "aform";
  busyDo(async () => {
    await loadPicks(it);
    if (it.pick && !picked(it)) throw new Error("There is nothing to choose from yet. Ask in the chat to create one.");
    if (it.mode === "list") await loadList(it);
  });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// A longer job (a report): ask until it is ready, then open it. Leaving the screen stops the asking.
async function awaitDone(it, first) {
  const w = it.wait, id = at(first, w.from);
  if (id == null) throw new Error("That did not start. Try again.");
  acct.note = w.message; state.view = "await"; render();
  for (let i = 0; i < 40; i++) {
    await sleep(6000);
    if (state.view !== "await") return;
    const r = await acall(w.tool, { [w.arg]: id });
    const st = shown(at(r, w.path));
    if ((w.failed || []).indexOf(st) >= 0) throw new Error("That could not be finished. Try again.");
    if ((w.done || []).indexOf(st) >= 0) {
      const target = w.open ? aitem(w.open) : null;
      if (target && target.open) { acct.item = target; acct.from = ""; acct.row = r; acct.detail = r; acct.rows = []; state.view = "adetail"; }
      else { acct.done = it.done || "Done."; state.view = "adone"; }
      return;
    }
  }
  acct.done = "Still working. Open it again in a minute."; state.view = "adone";
}
const atop = (title, back) => '<div class="bar-top"><h3>' + esc(title) + '</h3><span class="navs">' + (back ? '<button class="link" data-aback="' + esc(back) + '">← Back</button>' : "") + '<button class="link" data-view="menu">Menu</button></span></div>';
function apickBar(it) {
  if (!it.pick) return "";
  const rows = acct.picks[it.pick.tool] || [], s = picked(it);
  if (!rows.length) return "";
  return '<div class="qlabel">' + esc(it.pick.title) + '</div><div class="qs">' + rows.map((r) => chip(esc(r.label || r.value), "data-apick", r.value, Boolean(s && s.value === r.value))).join("") + "</div>";
}
// When the card's own call fails (most often: not signed in yet), the chat can do it and ask for sign-in.
const achat = () => (state.error && acct.item ? '<div class="actions" style="margin-top:8px"><button class="btn" data-ask="' + esc(acct.item.example) + '">Continue in the chat</button></div><div class="note">If you have not signed in yet, the chat asks you to.</div>' : "");
const alinks = (it) => (it.links || []).map((l) => '<button class="btn" data-aopen="' + esc(l.key) + '" data-afrom="' + esc(it.key) + '">' + esc(l.label) + "</button>").join("");
function aformView() {
  const it = acct.item;
  if (!it) return menuView();
  const fields = (it.fields || []).map((f) => f.type === "select"
    ? '<div class="qlabel">' + esc(f.label) + '</div><div class="qs">' + (f.options || []).map((o) => chip(esc(o), 'data-asel="' + esc(f.arg) + '" data-val', o, v("a_" + f.arg) === o)).join("") + "</div>"
    : field("a_" + f.arg, f.label, { type: f.type === "textarea" ? "textarea" : "text", placeholder: f.placeholder, optional: !f.required })).join("");
  return '<div class="form">' + atop(it.title, acct.from) + '<div class="hint">' + esc(it.description) + "</div>" + apickBar(it) + fields + errLine() +
    '<div class="actions" style="margin-top:12px">' + primary(it.submit || (it.mode === "chat" ? "Start" : "Save"), "asend") + "</div>" + achat() + "</div>";
}
function awaitView() {
  return '<div class="sent"><b>Working…</b><p>' + esc(acct.note) + '</p></div><div class="actions" style="margin-top:12px"><button class="btn" data-view="menu">← Menu</button></div>';
}
function adoneView() {
  const it = acct.item || {}, from = acct.from ? aitem(acct.from) : null;
  return '<div class="sent"><b>' + esc(acct.done) + '</b></div><div class="actions" style="margin-top:12px">' +
    (from ? '<button class="btn go" data-aopen="' + esc(from.key) + '">' + esc(from.title) + "</button>" : "") +
    (it.mode === "form" && (it.fields || []).length ? '<button class="btn" data-aopen="' + esc(it.key) + '" data-afrom="' + esc(acct.from) + '">Add another</button>' : "") +
    alinks(it) + '<button class="btn" data-view="menu">← Menu</button></div>';
}
function alistView() {
  const it = acct.item;
  if (!it) return menuView();
  const d = it.item || { title: "name", meta: [] };
  const rows = acct.rows.map((x, i) => {
    const meta = (d.meta || []).map((m) => { const val = shown(at(x, m.path), m.as); return val ? (m.label ? esc(m.label) + " " : "") + esc(val) : ""; }).filter(Boolean).join(" · ");
    const badge = d.badge ? shown(at(x, d.badge)) : "";
    const title = (shown(at(x, d.title)) || "(no title)").slice(0, 140);
    const inner = '<div class="nm"><b class="clamp">' + esc(title) + "</b>" + (badge ? '<span class="tag">' + esc(badge) + "</span>" : "") + "</div>" + (meta ? '<div class="bl">' + meta + "</div>" : "");
    return '<div class="it">' + (it.open ? '<button class="rowb" data-arow="' + i + '">' + inner + "</button>" : inner) + "</div>";
  }).join("");
  const more = alinks(it);
  return atop(it.title, acct.from) + apickBar(it) + errLine() +
    (state.busy ? '<div class="empty">Loading…</div>' : rows ? '<div class="list" style="margin-top:10px">' + rows + "</div>" : state.error ? "" : '<div class="empty">' + esc(it.empty || "Nothing here yet.") + "</div>") +
    (more ? '<div class="more">' + more + "</div>" : "") + achat();
}
function adetailView() {
  const it = acct.item, x = acct.detail, o = it && it.open;
  if (!it || !o || !x) return menuView();
  const vw = o.view || { title: "", fields: [], sections: [] };
  const fields = (vw.fields || []).map((f) => { const val = shown(at(x, f.path), f.as); return val ? "<div><b>" + esc(val) + "</b><span>" + esc(f.label) + "</span></div>" : ""; }).join("");
  const block = (t) => '<div class="it"><div class="bl pre">' + esc(t) + "</div></div>";
  const sections = (vw.sections || []).map((sec) => {
    const val = at(x, sec.path);
    let body = "";
    if (Array.isArray(val)) body = val.slice(0, 20).map((e) => {
      if (e && typeof e === "object") { if (!sec.item) return ""; const t = shown(at(e, sec.item.title)), b = sec.item.text ? shown(at(e, sec.item.text)) : ""; return t || b ? '<div class="it">' + (t ? '<div class="nm"><b>' + esc(t) + "</b></div>" : "") + (b ? '<div class="bl pre">' + esc(b) + "</div>" : "") + "</div>" : ""; }
      return shown(e) ? block(shown(e)) : "";
    }).join("");
    else if (shown(val)) body = block(shown(val));
    return body ? '<div class="qlabel" style="margin-top:12px">' + esc(sec.label) + '</div><div class="list">' + body + "</div>" : "";
  }).join("");
  // 0.20.0: Send by email / Send on WhatsApp, only when the record has a text to send.
  const sends = (o.send || []).map((sd, i) => (asendText(sd, x) ? '<button class="btn' + (sd.via === "whatsapp" ? " wa" : "") + '" data-asendto="' + i + '">' + icon(sd.via === "whatsapp" ? "whatsapp" : "mail") + esc(sd.label) + "</button>" : "")).join("");
  const acts = sends + (o.actions || []).map((a, i) => '<button class="btn go" data-aact="' + i + '"' + (state.busy ? " disabled" : "") + ">" + esc(a.label) + "</button>").join("");
  return atop((shown(at(x, vw.title)) || it.title).slice(0, 80), acct.rows.length ? "list" : "") +
    (state.busy ? '<div class="empty">Loading…</div>' : (fields ? '<div class="sum sm">' + fields + "</div>" : "") + sections) + errLine() +
    (acts && !state.busy ? '<div class="actions" style="margin-top:12px">' + acts + "</div>" : "") +
    (sends && !state.busy ? '<div class="note">Send opens your own mail app or WhatsApp with the text filled in. You send it yourself.</div>' : "");
}
// The text a send button carries: the record's own draft, or the fallback the menu names.
const asendText = (sd, x) => shown(at(x, sd.body)) || (sd.orBody ? shown(at(x, sd.orBody)) : "");
// A draft may open with its subject ("Subject: ..." then a blank line): email keeps it apart, WhatsApp drops it.
function asplit(text) {
  const m = String(text).match(/^\s*Subject:[ \t]*([^\n]*)\n+([\s\S]*)$/i);
  return m ? { subject: m[1].trim().slice(0, 200), body: m[2].trim() } : { subject: "", body: String(text).trim() };
}
function asendOpen(sd, x) {
  const d = asplit(asendText(sd, x));
  const to = sd.to ? shown(at(x, sd.to)).trim() : "";
  let href;
  if (sd.via === "whatsapp") {
    const digits = to.replace(/[^0-9]/g, "");
    href = "https://wa.me/" + (digits.length >= 7 && digits.length <= 15 ? digits : "") + "?text=" + encodeURIComponent(d.body.slice(0, 3000));
  } else {
    const ok = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(to);
    href = MAIL_PAGE + "#" + (ok ? "to=" + encodeURIComponent(to) + "&" : "") + (d.subject ? "subject=" + encodeURIComponent(d.subject) + "&" : "") + "body=" + encodeURIComponent(d.body.slice(0, 6000));
  }
  if (oa() && oa().openExternal) oa().openExternal({ href, redirectUrl: false }); else window.open(href, "_blank", "noopener");
}

function openOption(i) {
  const o = state.options[i];
  if (!o) return;
  state.error = ""; state.hint = "";
  if (o.kind === "account") { openAccount(o.key, ""); return; }
  if (o.kind === "contact") { run(o.tool, {}, o.example); return; }
  // 0.27.0: a hotel's Availability and price opens the booking screen on this month's calendar.
  if (o.kind === "lookup" && p().stayCal && inCard()) { const q = state.sq || {}; run(o.tool, clean({ adults: q.adults || 2, children: q.children || 0, rooms: q.rooms || 1, start: q.start && q.end ? q.start : "", end: q.start && q.end ? q.end : "" }), o.example); return; }
  // 0.15.0: software products. Features, Pricing and Help open with their results; Support opens its form.
  if (o.kind === "features" || o.kind === "guides") { state.f[o.kind === "features" ? "fq" : "gq"] = ""; run(o.tool, {}, o.example); return; }
  if (o.kind === "pricing") { run(o.tool, {}, o.example); return; }
  if (o.kind === "support") { if (!inCard()) { state.open = i; state.view = "form"; render(); return; } state.view = "support"; render(); return; }
  // 0.18.0, event guide: Agenda, Speakers and Exhibitors open with their lists; an enquiry opens its form.
  if (o.kind === "agenda" || o.kind === "speakers" || o.kind === "exhibitors") { state.f.aq = ""; state.f.pq = ""; state.f.xq = ""; run(o.tool, {}, o.example); return; }
  if (o.kind === "enquiry") { if (!inCard()) { state.open = i; state.view = "form"; render(); return; } if (!v("etopic")) state.f.etopic = "Exhibiting"; state.view = "enquiry"; render(); return; }
  // 0.22.0: a tour or a day pass opens its form, with the business's own locations to choose from.
  if ((o.kind === "tour" || o.kind === "daypass") && inCard() && vlocs(o.kind).length) { openVisit(o.kind, ""); return; }
  // 0.12.0: the member list opens unfiltered, by industry.
  if (o.kind === "members") { state.f.mq = ""; run(o.tool, {}, o.example); return; }
  // 0.25.0: committees, and news, events and newsletter, each on its own screen.
  if (o.kind === "committees" || o.kind === "news" || o.kind === "social") { state.socNet = ""; run(o.tool, { section: o.kind }, o.example); return; }
  // 0.4.0: the business's published information and its questions and answers show in the card first.
  if (o.kind === "question" && nav() && inCard()) { state.open = i; run(o.tool, {}, "", () => { state.view = "form"; render(); }); return; }
  if (o.kind === "request" && inCard()) {
    // In the card a request starts from a result, so the customer picks a real option first.
    if (p().engine === "track") { state.pick = { type: "track" }; state.view = "request"; render(); return; }
    const first = state.options.findIndex((x) => x.kind === "lookup");
    state.open = first; state.hint = "Choose what you would like first, then send the request from the result."; state.view = "form"; render(); return;
  }
  state.open = i; state.view = "form"; render();
}

function applyTheme(mode) {
  const t = p().theme, root = document.documentElement.style;
  if (!t) return;
  root.setProperty("--a1", t.a1); root.setProperty("--a2", t.a2); root.setProperty("--ink", t.ink); root.setProperty("--glow", t.glow);
  if (mode !== "light") root.setProperty("--bg", t.bg); else root.removeProperty("--bg");
}
function render() {
  const theme = (oa() && oa().theme) || "dark";
  document.documentElement.dataset.theme = theme === "light" ? "light" : "dark";
  applyTheme(theme);
  if (nav()) track();
  const app = document.getElementById("app");
  const views = { mwrite: mwriteView, memberMessage: memberMessageView, aform: aformView, alist: alistView, adetail: adetailView, adone: adoneView, await: awaitView, item: itemView, option: optionView, info: infoView, menu: menuView, form: formView, asked: askedView, catalog: catalogView, availability: availabilityView, slots: slotsView, estimate: estimateView, status: statusView, contact: contactView, request: requestView, sent: sentView, whatsapp: whatsappView, members: membersView, member: memberView, committees: committeesView, news: newsView, social: socialView, collab: collabView, visitform: visitFormView, visit: visitView, visits: visitsView, features: featuresView, pricing: pricingView, guides: guidesView, support: supportView, agenda: agendaView, speakers: speakersView, speaker: speakerView, exhibitors: exhibitorsView, exhibitor: exhibitorView, enquiry: enquiryView };
  const body = state.view === "loading" || !state.plugin ? '<div class="empty">Loading…</div>' : (views[state.view] || menuView)();
  app.innerHTML = header() + body + (state.view === "menu" ? (nav() && state.busy ? '<div class="note">Working…</div>' : "") + contactBar() : "");
  const pic = app.querySelector(".banner");
  if (pic) pic.addEventListener("error", () => pic.remove(), { once: true });
  // 0.25.0: a logo that does not load gives way to the store icon (the header) or the initials (a member).
  app.querySelectorAll("img[data-fallback]").forEach((img) => img.addEventListener("error", () => {
    const box = img.parentElement, f = img.dataset.fallback;
    if (!box) return;
    if (f === "store") { box.className = "ic"; box.innerHTML = icon("store"); return; }
    box.classList.add("mono"); box.innerHTML = esc(f);
  }, { once: true }));
  const on = (sel, fn) => app.querySelectorAll(sel).forEach((el) => el.addEventListener("click", () => fn(el)));
  const lookup = opt("lookup"), request = opt("request"), status = opt("status");
  const guard = (fn) => { try { fn(); } catch (e) { state.error = (e && e.message) || "Check the form."; render(); } };
  on("[data-open]", (b) => openOption(Number(b.dataset.open)));
  on("[data-view]", (b) => { state.view = b.dataset.view; state.error = ""; render(); });
  on("[data-ask]", (b) => ask(b.dataset.ask));
  on("[data-href]", (b) => openLink(b.dataset.href));
  on('[data-act="send"]', () => guard(() => {
    const o = state.options[state.open], f = formFor(o);
    if (!(inCard() && f.args)) { ask(f.prompt()); return; }
    // The chat sentence is only a fallback here, so a field it needs may be empty.
    let fallback = o.example; try { fallback = f.prompt(); } catch (e) {}
    run(o.tool, f.args(), fallback);
  }));
  on('[data-act="again"]', () => { state.open = state.options.findIndex((x) => x.kind === "lookup"); state.hint = ""; state.view = "form"; state.error = ""; render(); });
  on('[data-act="paid"]', () => { const st = opt("status"); if (state.payRef && st) run(st.tool, { reference: state.payRef }, "I have paid. What is the status of " + state.payRef + "?"); });
  on('[data-act="status"]', () => { state.open = state.options.findIndex((x) => x.kind === "status"); state.hint = ""; state.view = "form"; state.error = ""; render(); });
  on("[data-more]", (b) => { state.cart[b.dataset.more] = Math.min((state.cart[b.dataset.more] || 0) + 1, 99); render(); });
  on("[data-less]", (b) => { state.cart[b.dataset.less] = Math.max((state.cart[b.dataset.less] || 0) - 1, 0); render(); });
  on('[data-act="order"]', () => { state.pick = { type: "order" }; state.view = "request"; state.error = ""; render(); });
  on("[data-pick-stay]", (b) => {
    // 0.27.0: the request form gets the dates and party chosen on the booking screen.
    if (state.sq && state.sq.start && state.sq.end) { state.f.start = state.sq.start; state.f.end = staySpan() === "single" ? "" : state.sq.end; state.f.guests = String(state.sq.adults + state.sq.children); }
    state.pick = { type: "stay", id: b.dataset.pickStay, name: b.dataset.name, total: b.dataset.total }; state.view = "request"; state.error = ""; render();
  });
  // ---- 0.27.0: the hotel booking screen ----
  on("[data-sday]", (b) => {
    const q = stayQ(), d = b.dataset.sday;
    state.error = "";
    const sp = staySpan();
    // 0.29.0: one date is asked at once; by the day the last day may be the first.
    if (sp === "single") { q.start = d; q.end = d; stayAsk(); return; }
    if (q.start && !q.end && (sp === "days" ? d >= q.start : d > q.start)) { q.end = d; stayAsk(); return; }
    q.start = d; q.end = ""; render();
  });
  on("[data-smonth]", (b) => { if (!b.dataset.smonth) return; const q = stayQ(); q.month = b.dataset.smonth; stayAsk({ month: b.dataset.smonth }); });
  on("[data-g]", (b) => {
    const q = stayQ(), k = b.dataset.g, pol = (state.data.availability.stay || {}).policies || {};
    const max = { adults: pol.maxAdults || 12, children: pol.maxChildren || 9, rooms: pol.maxRooms || 3 }[k], min = k === "children" ? 0 : 1;
    q[k] = Math.max(min, Math.min(max, q[k] + Number(b.dataset.by)));
    if (k === "rooms" && q.adults < q.rooms) q.adults = q.rooms;
    if (k === "adults" && q.rooms > q.adults) q.rooms = q.adults;
    render(); stayAskSoon();
  });
  on("[data-book-room]", (b) => {
    const q = stayQ(), r = opt("request");
    run(r && r.tool, clean({ option: b.dataset.bookRoom, start: q.start, end: q.end, adults: q.adults, children: q.children, rooms: q.rooms, guests: q.adults + q.children }),
      "Book the " + b.dataset.name + " from " + q.start + " to " + q.end + " for " + q.adults + " adults" + (q.children ? " and " + q.children + " children" : "") + (q.rooms > 1 ? ", " + q.rooms + " rooms" : "") + ".");
  });
  on("[data-service]", (b) => run(lookup && lookup.tool, clean({ service: b.dataset.service, date: v("date") }), "What times are open for " + b.dataset.service + "?"));
  on('[data-act="slots"]', () => run(lookup && lookup.tool, clean({ service: (state.data.slots && state.data.slots.service && state.data.slots.service.id) || "", date: v("date") }), "What times are open on " + v("date") + "?"));
  on("[data-time]", (b) => {
    const s = state.data.slots || {};
    if (!s.service) { state.error = "Choose what the appointment is for first."; render(); return; }
    state.pick = { type: "appt", id: s.service.id, name: s.service.name, date: s.date, time: b.dataset.time }; state.view = "request"; state.error = ""; render();
  });
  on("[data-rule]", (b) => { state.f.what = b.dataset.rule; state.f.size = ""; run(lookup && lookup.tool, { service: b.dataset.rule }, "Can I get a price estimate for " + b.dataset.rule + "?"); });
  on('[data-act="estimate"]', () => guard(() => { need(num("size"), "Add how many."); const r = (state.data.estimate || {}).rule || {}; run(lookup && lookup.tool, { service: r.id, size: num("size") }, "Can I get an estimate for " + r.name + ", " + v("size") + " " + (r.unit || "") + "?"); }));
  on('[data-act="rules"]', () => run(lookup && lookup.tool, {}, "What can you estimate?"));
  on("[data-pick-quote]", (b) => { state.pick = { type: "quote", id: b.dataset.pickQuote, name: b.dataset.name, size: (state.data.estimate || {}).size || undefined }; state.view = "request"; state.error = ""; render(); });
  on('[data-act="unpick"]', () => { if (nav()) { goBack(); return; } const back = { order: "catalog", stay: "availability", appt: "slots", quote: "estimate" }[(state.pick || {}).type] || "menu"; state.view = back; state.error = ""; render(); });
  on('[data-act="request"]', () => guard(() => run(request && request.tool, requestArgs(), request ? request.title : "Send my request")));
  // 0.30.0: Social media filters, and a picture that does not load gives way to the network's colour.
  on("[data-soc]", (b) => { state.socNet = b.dataset.soc || ""; render(); });
  app.querySelectorAll("img[data-soc-img]").forEach((img) => img.addEventListener("error", () => img.remove(), { once: true }));
  // ---- Browsing (version 0.4.0) ----
  on('[data-act="back"]', () => goBack());
  on("[data-cat]", (b) => { state.f.q = ""; run(lookup && lookup.tool, clean({ category: b.dataset.cat }), b.dataset.cat ? "Show me " + b.dataset.cat + ", with prices." : "Show me what you offer, with prices."); });
  on('[data-act="find"]', () => run(lookup && lookup.tool, clean({ query: v("q") }), v("q") ? "Do you have " + v("q") + ", and how much is it?" : "Show me what you offer, with prices."));
  on("[data-item]", (b) => { state.sel = b.dataset.item; state.view = "item"; state.error = ""; render(); });
  on("[data-option]", (b) => { state.sel = b.dataset.option; state.view = "option"; state.error = ""; render(); });
  on("[data-guests]", (b) => { state.f.guests = b.dataset.guests; render(); });
  on("[data-when]", (b) => guard(() => { const w = b.dataset.when.split("|"); state.f.start = w[0]; state.f.end = w[1]; const f = formFor(lookup); run(lookup.tool, f.args(), f.prompt()); }));
  on("[data-day]", (b) => { state.f.date = b.dataset.day; run(lookup && lookup.tool, clean({ service: v("what"), date: b.dataset.day }), "What times are open on " + b.dataset.day + (v("what") ? " for " + v("what") : "") + "?"); });
  on("[data-faq]", (b) => { const i = Number(b.dataset.faq); state.faq = state.faq === i ? -1 : i; render(); });
  on('[data-act="askq"]', () => guard(() => { need(v("question"), "Type your question."); ask(v("question")); }));
  on("[data-biz]", (b) => chooseBiz(b.dataset.biz));
  on('[data-act="biz"]', () => chooseBiz(v("biz")));
  on('[data-act="unbiz"]', () => { state.business = ""; state.bizName = ""; state.data = {}; state.cart = {}; state.items = {}; state.mem = {}; state.spk = {}; state.exh = {}; state.options = state.options.filter((o) => o.kind !== "members" && o.kind !== "tour" && o.kind !== "daypass"); state.hist = []; state.error = ""; save(); render(); });
  // ---- Software products (version 0.15.0) ----
  on('[data-act="ffind"]', () => findIn("features"));
  on('[data-act="gfind"]', () => findIn("guides", { topic: (state.data.guides || {}).topic || "" }));
  on("[data-gtopic]", (b) => { state.f.gq = ""; findIn("guides", { query: "", topic: b.dataset.gtopic }); });
  on('[data-act="support"]', () => guard(() => {
    const o = opt("support");
    need(v("stopic"), "Add a subject."); need(v("smessage"), "Say what happened.");
    run(o && o.tool, Object.assign(who(), { topic: v("stopic"), message: v("smessage") }), "I need support: " + v("stopic"));
  }));
  // ---- Event guide (version 0.18.0) ----
  on('[data-act="afind"]', () => runShow("agenda", { query: v("aq"), date: (state.data.agenda || {}).date || "" }));
  on("[data-aday]", (b) => { state.f.aq = ""; runShow("agenda", { date: b.dataset.aday }); });
  on("[data-ses]", (b) => { state.ses = state.ses === b.dataset.ses ? "" : b.dataset.ses; render(); });
  on('[data-act="pfind"]', () => runShow("speakers", { query: v("pq") }));
  on("[data-spk]", (b) => { state.sel = b.dataset.spk; state.view = "speaker"; state.error = ""; render(); });
  on('[data-act="xfind"]', () => runShow("exhibitors", { query: v("xq"), category: (state.data.exhibitors || {}).category || "" }));
  on("[data-xcat]", (b) => { state.f.xq = ""; runShow("exhibitors", { category: b.dataset.xcat }); });
  on("[data-exh]", (b) => { state.sel = b.dataset.exh; state.fly = ""; state.view = "exhibitor"; state.error = ""; render(); });
  on("[data-etopic]", (b) => { state.f.etopic = b.dataset.etopic; render(); });
  on('[data-act="enquiry"]', () => guard(() => {
    const o = opt("enquiry");
    need(v("emessage"), "Say what your enquiry is about.");
    run(o && o.tool, Object.assign(who(), clean({ topic: v("etopic") || "Other", message: v("emessage"), company: v("ecompany") })), v("etopic") + " enquiry: " + v("emessage"));
  }));
  // ---- Account menu (version 0.19.0) ----
  on("[data-aopen]", (b) => openAccount(b.dataset.aopen, b.dataset.afrom || ""));
  on("[data-aback]", (b) => { state.error = ""; if (b.dataset.aback === "list") { state.view = "alist"; render(); } else if (aitem(b.dataset.aback)) openAccount(b.dataset.aback, ""); else { state.view = "menu"; render(); } });
  on("[data-apick]", (b) => {
    const it = acct.item;
    const r = it && it.pick ? (acct.picks[it.pick.tool] || []).find((x) => x.value === b.dataset.apick) : null;
    if (!r) return;
    acct.sel[it.pick.tool] = r;
    if (it.mode === "list") busyDo(() => loadList(it)); else render();
  });
  on("[data-asel]", (b) => { state.f["a_" + b.dataset.asel] = b.dataset.val; render(); });
  on("[data-arow]", (b) => {
    const it = acct.item, row = acct.rows[Number(b.dataset.arow)];
    if (!it || !row || !it.open) return;
    acct.row = row; acct.detail = row; state.view = "adetail"; state.error = "";
    if (it.open.tool) busyDo(async () => { acct.detail = await acall(it.open.tool, { [it.open.arg]: at(row, it.open.from) }); }); else render();
  });
  on("[data-asendto]", (b) => {
    const it = acct.item, sd = it && it.open ? (it.open.send || [])[Number(b.dataset.asendto)] : null;
    if (sd && acct.detail) asendOpen(sd, acct.detail);
  });
  on("[data-aact]", (b) => {
    const it = acct.item, a = it && it.open ? (it.open.actions || [])[Number(b.dataset.aact)] : null;
    if (!a || !acct.row || state.busy) return;
    busyDo(async () => { await acall(a.tool, Object.assign({}, a.args || {}, { [a.arg]: at(acct.row, a.from) })); await loadList(it); state.view = "alist"; });
  });
  on('[data-act="asend"]', () => guard(() => {
    const it = acct.item;
    if (!it || state.busy) return;
    const s = picked(it);
    if (it.pick) need(s, "Choose one first.");
    if (it.mode === "chat") { ask(String(it.prompt || it.example).replace(/\{label\}/g, s ? s.label : "").replace(/\{value\}/g, s ? s.value : "")); return; }
    const args = {};
    (it.fields || []).forEach((f) => { const val = v("a_" + f.arg); if (f.required) need(val, "Fill in: " + f.label + "."); if (val) args[f.arg] = val; });
    busyDo(async () => {
      const r = await acall(it.tool, withPick(it, args));
      (it.fields || []).forEach((f) => { state.f["a_" + f.arg] = ""; });
      if (it.wait) { await awaitDone(it, r); return; }
      acct.done = it.done || "Done."; state.view = "adone";
    });
  }));
  // ---- Tours and day passes (version 0.22.0) ----
  on("[data-vloc]", (b) => { state.f.vloc = b.dataset.vloc; render(); });
  on("[data-vday]", (b) => { state.f.vdate = b.dataset.vday; render(); });
  on("[data-vgo]", (b) => openVisit(b.dataset.vgo, b.dataset.loc));
  on('[data-act="visit"]', () => guard(() => {
    const kind = state.vkind === "daypass" ? "daypass" : "tour", o = opt(kind), loc = vloc(kind);
    need(loc, "Choose a location.");
    need(v("vdate"), "Choose a day.");
    const who = {};
    if (vcontact()) {
      need(v("name"), "Add your name so the business can reply.");
      need(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email")), "Add a valid email so the business can reply.");
      who.name = v("name"); who.email = v("email");
    }
    const people = num("vpeople");
    run(o && o.tool, Object.assign(who, clean({ location: loc.name, date: v("vdate"), time: kind === "tour" ? v("vtime") : "", people: people ? Math.floor(people) : undefined })),
      (o ? o.title : "Visit") + ": " + loc.name + ", " + v("vdate") + (kind === "tour" && v("vtime") ? ", " + v("vtime") : "") + (people ? ", " + Math.floor(people) + (people === 1 ? " person" : " people") : ""));
  }));
  // ---- Members (version 0.12.0) ----
  on('[data-act="mfind"]', () => findMembers());
  on("[data-mind]", (b) => findMembers({ industry: b.dataset.mind }));
  on("[data-mloc]", (b) => findMembers({ location: b.dataset.mloc }));
  on("[data-member]", (b) => { state.sel = b.dataset.member; state.fly = ""; state.view = "member"; state.error = ""; render(); });
  on('[data-act="collab"]', () => { state.view = "collab"; state.error = ""; render(); });
  on('[data-act="mwrite"]', () => { state.fly = ""; state.view = "mwrite"; state.error = ""; render(); });
  // 0.26.0: open and close the More about panel; a tap on the dimmed backdrop closes it too.
  on('[data-act="mfly"]', () => { state.fly = state.sel; render(); });
  app.querySelectorAll('[data-act="mflyx"]').forEach((el) => el.addEventListener("click", (e) => { if (e.target === el) { state.fly = ""; render(); } }));
  on('[data-act="mdraft"]', () => guard(() => {
    const m = state.mem[state.sel] || {};
    need(v("wname"), "Add your name."); need(v("wmsg"), "Say what you would like to discuss.");
    run(p().memberWrite, clean({ member: m.name, name: v("wname"), company: v("wcompany"), email: v("wemail"), message: v("wmsg") }), "Draft a message from me (" + v("wname") + ") to " + m.name + ": " + v("wmsg"));
  }));
  on('[data-act="match"]', () => guard(() => { need(v("mneed") || v("moffer"), "Say what you need or what you can offer."); state.f.mq = [v("mneed"), v("moffer")].filter(Boolean).join(" "); findMembers({ industry: "", location: "" }); }));
  const filter = app.querySelector("[data-filter]");
  const applyFilter = () => { const w = String(state.f.filter || "").toLowerCase().trim(); app.querySelectorAll(".faq").forEach((el) => { el.style.display = !w || el.dataset.text.indexOf(w) >= 0 ? "" : "none"; }); };
  if (filter) { applyFilter(); filter.addEventListener("input", () => { state.f.filter = filter.value; applyFilter(); }); }
  app.querySelectorAll("[data-f]").forEach((el) => {
    el.addEventListener("input", () => { state.f[el.dataset.f] = el.value; });
    el.addEventListener("keydown", (e) => { if (e.key === "Enter" && el.tagName !== "TEXTAREA") { e.preventDefault(); const b = el.dataset.enter ? app.querySelector('[data-act="' + el.dataset.enter + '"]') : app.querySelector(".primary"); if (b) b.click(); } });
  });
  try { oa() && oa().notifyIntrinsicHeight && oa().notifyIntrinsicHeight(document.body.scrollHeight); } catch (e) {}
}

if (window.openai) {
  load();
  receive(oa().toolOutput);
  window.addEventListener("openai:set_globals", (e) => {
    const gl = (e && e.detail && e.detail.globals) || {};
    if (gl.toolOutput) receive(gl.toolOutput); else render();
  }, { passive: true });
}
window.addEventListener("message", (e) => {
  const m = e.data;
  if (e.source !== window.parent || !m || m.jsonrpc !== "2.0") return;
  if (m.method === "ui/notifications/tool-result") { receive(m.params && m.params.structuredContent); return; }
  if (window.openai) return;
  // An MCP Apps host: answers to the card's own requests, then what the host asks or tells.
  if (!m.method) {
    const w = waiting[m.id];
    if (!w) return;
    delete waiting[m.id];
    if (m.error) w.reject(new Error((m.error && m.error.message) || "That did not work.")); else w.resolve(m.result || {});
    return;
  }
  if (m.method === "ui/notifications/host-context-changed") { if (mcp && m.params && m.params.theme) { mcp.theme = m.params.theme === "light" ? "light" : "dark"; render(); } return; }
  if (m.id === undefined || m.id === null) return;
  if (m.method === "ping" || m.method === "ui/resource-teardown") post({ id: m.id, result: {} });
  else post({ id: m.id, error: { code: -32601, message: "Method not found" } });
});
render();
// An MCP Apps host sends the tool's result only after this handshake. ChatGPT serves the card with window.openai.
if (!window.openai && window.parent !== window) {
  request("ui/initialize", { appInfo: { name: "BizPlug plug-in card", version: "1.0.0" }, appCapabilities: {}, protocolVersion: "2026-01-26" }).then((init) => {
    mcp = mcpHost(init);
    post({ method: "ui/notifications/initialized" });
    render();
    try { new ResizeObserver(tellHeight).observe(document.documentElement); } catch (e) {}
  }, () => {});
}
`;

const SCRIPT = SCRIPT_SRC.replace("__ICONS__", JSON.stringify(ICONS)).replace("__MARK__", JSON.stringify(MARK)).replace("__MAIL__", JSON.stringify(`${siteConfig.url}/connect/email`));
const PLUGIN_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${CSS}</style></head><body><div id="app"></div><script type="module">${SCRIPT.replace(/<\/script/gi, "<\\/script")}</script></body></html>`;

export const pluginWidgetHtml = () => PLUGIN_HTML;
/** Content-addressed: a changed card gets a new URI, so ChatGPT never shows a stale copy. */
export const PLUGIN_WIDGET_URI = `ui://bizplug/plugin-${createHash("sha256").update(PLUGIN_HTML).digest("hex").slice(0, 12)}.html`;
/** Any plug-in card URI ever published; ChatGPT keeps old URIs for hours and they read the current card. */
export const isPluginWidgetUri = (uri: unknown): uri is string => typeof uri === "string" && /^ui:\/\/bizplug\/plugin-[0-9a-z]+\.html$/.test(uri);

/**
 * 0.23.0: the same card under its own address for an MCP Apps host (Claude), which reads it as
 * text/html;profile=mcp-app. ChatGPT keeps the address above, so nothing changes there.
 */
export const PLUGIN_APP_URI = PLUGIN_WIDGET_URI.replace(/\.html$/, ".app.html");
export const isPluginAppUri = (uri: unknown): uri is string => typeof uri === "string" && /^ui:\/\/bizplug\/plugin-[0-9a-z]+\.app\.html$/.test(uri);

/** tools/list _meta for show_menu: the card it renders in. With `app`, the card for an MCP Apps host. */
export const pluginCardToolMeta = (app = false) => ({
  ui: { resourceUri: app ? PLUGIN_APP_URI : PLUGIN_WIDGET_URI },
  "openai/outputTemplate": app ? PLUGIN_APP_URI : PLUGIN_WIDGET_URI,
  "openai/widgetAccessible": true,
  "openai/toolInvocation/invoking": "Opening the menu",
  "openai/toolInvocation/invoked": "Menu ready",
});

/** tools/list _meta for a tool whose result the card draws (plug-in version 0.3.0 and later). */
export const pluginResultToolMeta = (invoking: string, invoked: string, app = false) => ({ ...pluginCardToolMeta(app), "openai/toolInvocation/invoking": invoking, "openai/toolInvocation/invoked": invoked });
/** tools/list _meta for a tool the card may call but whose result stays in the chat. */
export const pluginCallableToolMeta = { "openai/widgetAccessible": true };

/**
 * Where the card may load images from: menu photos (CARD_IMAGE_ORIGINS) and, from 0.21.0, the business's banner,
 * which BizPlug's own site serves (card-banner.ts).
 */
const IMAGE_ORIGINS = [...CARD_IMAGE_ORIGINS, ...siteOrigins()];
/** resources/read _meta: no network (images load from IMAGE_ORIGINS), links open outside; the description ChatGPT's model sees with the card. */
export const pluginWidgetMeta = {
  ui: { prefersBorder: true, csp: { connectDomains: [], resourceDomains: IMAGE_ORIGINS } },
  "openai/widgetPrefersBorder": true,
  "openai/widgetDescription":
    "An interactive card for a business plug-in: a menu with one button per thing the customer can do, short forms for their input, and the results (a price list, availability, open times, an estimate, a status, a sent request). The card already shows the menu or the result: do not repeat it in full; add one short next step at most.",
  "openai/widgetCSP": { connect_domains: [], resource_domains: IMAGE_ORIGINS, redirect_domains: ["https://wa.me", "https://api.whatsapp.com", new URL(siteConfig.url).origin, "https://checkout.stripe.com"] },
};
/** resources/read _meta for an MCP Apps host: a border, no network, images from IMAGE_ORIGINS only, as in ChatGPT. */
export const pluginAppMeta = { ui: { prefersBorder: true, csp: { connectDomains: [], resourceDomains: IMAGE_ORIGINS } } };

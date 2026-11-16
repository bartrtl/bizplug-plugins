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
// Every value shown comes from a tool's structuredContent, never from its text, which is written for the assistant. Served as
// text/html+skybridge like the guide card (guide-widget.ts); the URI is content-addressed.
import { createHash } from "node:crypto";
import { brand } from "@/lib/brand";

export const PLUGIN_WIDGET_MIME = "text/html+skybridge";

const ICONS: Record<string, string> = {
  lookup: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  request: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
  question: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.4"/><path d="M12 16.5h.01"/>',
  status: '<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="m9 14 2 2 4-4"/>',
  contact: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  store: '<path d="M3 9 4.5 4h15L21 9"/><path d="M3 9v11h18V9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M9 20v-6h6v6"/>',
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
.head{display:flex;align-items:center;gap:12px;margin-bottom:14px;position:relative}
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
.about{color:var(--muted);font-size:13.5px;margin-top:8px}
.more{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid var(--line)}
.more span{font-size:12px;color:var(--muted);margin-right:4px}
.pick{margin-bottom:12px}
.faq .bl{margin-top:8px;white-space:pre-line}
.sum.biz{align-items:center;justify-content:space-between;margin:0 0 12px}
.sum.biz b{font-size:15px}
`;

const SCRIPT_SRC = String.raw`
const ICONS = __ICONS__;
const MARK = __MARK__;
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const icon = (k) => '<svg viewBox="0 0 24 24">' + (ICONS[k] || ICONS.lookup) + "</svg>";
const oa = () => window.openai || null;
// Views: menu, form (one option's inputs), asked (what went to the chat), and from 0.3.0 the results:
// catalog, availability, slots, estimate, status, contact, request (details before sending), sent, whatsapp.
const state = { plugin: null, options: [], view: "loading", open: null, data: {}, f: {}, cart: {}, pick: null, business: "", busy: false, error: "", asked: "",
  // 0.4.0: the screens to go back through, the item or option that is open, every item seen (for the order summary), the chosen business.
  hist: [], shown: null, going: false, sel: null, items: {}, bizName: "", businesses: [], faq: -1 };
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
    if (sc.business !== state.business) { state.cart = {}; state.items = {}; }
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
  save();
  if (oa() && oa().sendFollowUpMessage) oa().sendFollowUpMessage({ prompt });
  else window.parent.postMessage({ jsonrpc: "2.0", id: Date.now(), method: "ui/message", params: { role: "user", content: [{ type: "text", text: prompt }] } }, "*");
  state.asked = prompt; state.view = "asked"; state.error = ""; render();
}
function openLink(href) {
  if (!href) return;
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
  } catch (e) { state.busy = false; state.error = (e && e.message) || "That did not run."; render(); }
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
const errLine = () => (state.error ? '<div class="err">' + esc(state.error) + "</div>" : "");
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
function links(except) {
  if (!nav()) return "";
  const out = state.options.map((o, i) => (o.kind === except || o.kind === "request" || o.kind === "status" ? "" : '<button class="q" data-open="' + i + '">' + esc(o.title) + "</button>")).join("");
  return out ? '<div class="more"><span>More</span>' + out + "</div>" : "";
}
// Back: every screen left on the way is remembered, except the menu and the screens that only confirm.
function track() {
  const cur = { v: state.view, open: state.open, sel: state.sel };
  const was = state.shown;
  const same = was && was.v === cur.v && (cur.v !== "form" || was.open === cur.open) && ((cur.v !== "item" && cur.v !== "option") || was.sel === cur.sel);
  if (same) return;
  if (["menu", "sent", "whatsapp", "loading"].indexOf(cur.v) >= 0) state.hist = [];
  else if (!state.going && was && ["menu", "loading", "asked", "sent", "whatsapp"].indexOf(was.v) < 0) state.hist = state.hist.concat([was]).slice(-12);
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
  const slug = String(name || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const contact = opt("contact");
  if (!slug || !contact) { state.error = "Type the name of the business."; render(); return; }
  state.busy = true; state.error = ""; render();
  try {
    const sc = pickStructured(await oa().callTool(contact.tool, { business: slug }));
    if (!sc || !sc.business) throw new Error("none");
    if (sc.plugin) { state.plugin = sc.plugin; state.options = sc.options || state.options; }
    state.business = sc.business; state.bizName = (sc.plugin && sc.plugin.businessName) || (sc.contact && sc.contact.name) || slug;
    state.data = {}; state.cart = {}; state.items = {}; state.hist = []; state.f.biz = ""; state.busy = false; state.view = "menu";
    save(); render();
  } catch (e) { state.busy = false; state.error = "No business with that name was found here."; render(); }
}

function header() {
  const d = p();
  // A business's card shows no BizPlug mark (BizPlug stays in the contact bar); the industry-wide one does.
  const mark = d.bound ? '<span class="ic">' + icon("store") + "</span>" : MARK;
  return '<div class="glow"></div><div class="head">' + mark + '<div><div class="t">' + esc(d.title || "Plug-in") + '</div><div class="s">' + esc(d.subtitle) + "</div></div></div>";
}
function contactBar() {
  const c = p().contact || {};
  if (!c.whatsapp && !c.email) return "";
  return '<div class="contact"><div class="ct"><b>' + esc(c.title) + "</b><span>" + esc(c.description) + "</span></div>" +
    (c.whatsapp ? '<button class="btn wa" data-href="' + esc(c.whatsapp) + '">' + icon("whatsapp") + "WhatsApp</button>" : "") +
    (c.email ? '<button class="btn" data-href="' + esc(c.email) + '">' + icon("mail") + "Email</button>" : "") + "</div>";
}
function menuView() {
  const opts = state.options;
  const pick = picker();
  return pick + '<div class="grid">' + opts.map((o, i) =>
    '<button class="tile' + (i === 0 ? " hero" : "") + (i > 0 && opts.length % 2 === 0 && i === opts.length - 1 ? " wide" : "") + '" data-open="' + i + '"><span class="ic">' + icon(o.kind) + "</span><span>" +
    '<div class="tt">' + esc(o.title) + (i === 0 ? '<span class="badge">Start here</span>' : "") + '</div><div class="dd">' + esc(o.description) + "</div></span></button>").join("") + "</div>" +
    (p().bound || pick ? "" : '<div class="note">This plug-in serves every business in its industry: the assistant will ask which business you mean.</div>');
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
    return sub + '<div class="it"><button class="rowb" data-item="' + esc(x.id) + '"><div class="nm"><b>' + esc(x.name) + '</b><span class="pr">' + esc(x.price) + "</span></div>" +
      (x.description ? '<div class="bl clamp">' + esc(x.description) + "</div>" : "") + "</button>" + stepper(x.id, state.cart[x.id] || 0) + "</div>";
  }).join("");
  return head + '<div class="list">' + rows + "</div>" + (c.more ? '<div class="note">' + c.more + " more: search or choose a category to narrow the list.</div>" : "") + errLine() + order + links("lookup");
}
function itemView() {
  const x = state.items[state.sel];
  if (!x) return catalogView();
  const request = opt("request");
  const all = cartCount();
  return top(x.name) + '<div class="sum"><div><b>' + esc(x.price) + "</b><span>" + esc(x.category || "") + "</span></div></div>" +
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
    return head + '<div class="it"><div class="nm"><b>' + esc(x.name) + '</b><span class="pr">' + esc(x.price) + "</span></div>" + (x.description ? '<div class="bl">' + esc(x.description) + "</div>" : "") +
      '<div class="qty"><button class="step" data-less="' + esc(x.id) + '"' + (n ? "" : " disabled") + '>−</button><span>' + n + '</span><button class="step" data-more="' + esc(x.id) + '">+</button></div></div>';
  }).join("");
  const n = cartCount();
  return top(lookup ? lookup.title : "Prices") + '<div class="list">' + rows + "</div>" + (c.more ? '<div class="note">' + c.more + " more: search to narrow the list.</div>" : "") + errLine() +
    '<div class="actions sticky">' + (request ? primary(n ? request.title + " (" + n + ")" : "Choose items to order", "order", n ? "" : " disabled") : "") + '<button class="btn" data-act="again">Search</button></div>';
}
function availabilityView() {
  const a = state.data.availability || { options: [] };
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
  return top("Status") + body + '<div class="actions" style="margin-top:12px"><button class="btn" data-act="status">Check another</button></div>' + links("status");
}
function contactView() {
  const c = state.data.contact || {};
  const row = (label, value, href) => (value ? "<tr><td>" + label + "</td><td>" + (href ? '<button class="link" data-href="' + esc(href) + '">' + esc(value) + "</button>" : esc(value)) + "</td></tr>" : "");
  const rows = row("Phone", c.phone, c.phone ? "tel:" + c.phone.replace(/[^+\d]/g, "") : "") + row("Email", c.email, c.email ? "mailto:" + c.email : "") + row("Website", c.website, c.website) + row("Address", c.address) + row("Hours", c.hours);
  return top(c.name || "Contact") + (rows ? '<table class="tbl">' + rows + "</table>" : '<div class="empty">This business has not published contact details.</div>') + links("contact");
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
function sentView() {
  const s = state.data.sent || { lines: [] };
  return '<div class="sent"><b>Request sent</b><p>Reference <strong>' + esc(s.reference) + "</strong></p>" + s.lines.map((l) => "<p>" + esc(l) + "</p>").join("") + '<p class="note">' + esc(s.note) + '</p></div><div class="actions" style="margin-top:12px"><button class="btn" data-view="menu">← Menu</button>' + contactButton() + "</div>";
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
function openOption(i) {
  const o = state.options[i];
  if (!o) return;
  state.error = ""; state.hint = "";
  if (o.kind === "contact") { run(o.tool, {}, o.example); return; }
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
  const views = { item: itemView, option: optionView, info: infoView, menu: menuView, form: formView, asked: askedView, catalog: catalogView, availability: availabilityView, slots: slotsView, estimate: estimateView, status: statusView, contact: contactView, request: requestView, sent: sentView, whatsapp: whatsappView };
  const body = state.view === "loading" || !state.plugin ? '<div class="empty">Loading…</div>' : (views[state.view] || menuView)();
  app.innerHTML = header() + body + (state.view === "menu" ? (nav() && state.busy ? '<div class="note">Working…</div>' : "") + contactBar() : "");
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
  on('[data-act="status"]', () => { state.open = state.options.findIndex((x) => x.kind === "status"); state.hint = ""; state.view = "form"; state.error = ""; render(); });
  on("[data-more]", (b) => { state.cart[b.dataset.more] = Math.min((state.cart[b.dataset.more] || 0) + 1, 99); render(); });
  on("[data-less]", (b) => { state.cart[b.dataset.less] = Math.max((state.cart[b.dataset.less] || 0) - 1, 0); render(); });
  on('[data-act="order"]', () => { state.pick = { type: "order" }; state.view = "request"; state.error = ""; render(); });
  on("[data-pick-stay]", (b) => { state.pick = { type: "stay", id: b.dataset.pickStay, name: b.dataset.name, total: b.dataset.total }; state.view = "request"; state.error = ""; render(); });
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
  on('[data-act="unbiz"]', () => { state.business = ""; state.bizName = ""; state.data = {}; state.cart = {}; state.items = {}; state.hist = []; state.error = ""; save(); render(); });
  const filter = app.querySelector("[data-filter]");
  const applyFilter = () => { const w = String(state.f.filter || "").toLowerCase().trim(); app.querySelectorAll(".faq").forEach((el) => { el.style.display = !w || el.dataset.text.indexOf(w) >= 0 ? "" : "none"; }); };
  if (filter) { applyFilter(); filter.addEventListener("input", () => { state.f.filter = filter.value; applyFilter(); }); }
  app.querySelectorAll("[data-f]").forEach((el) => {
    el.addEventListener("input", () => { state.f[el.dataset.f] = el.value; });
    el.addEventListener("keydown", (e) => { if (e.key === "Enter" && el.tagName !== "TEXTAREA") { e.preventDefault(); const b = el.dataset.enter ? app.querySelector('[data-act="' + el.dataset.enter + '"]') : app.querySelector(".primary"); if (b) b.click(); } });
  });
  try { oa() && oa().notifyIntrinsicHeight && oa().notifyIntrinsicHeight(document.body.scrollHeight); } catch (e) {}
}

if (oa()) {
  load();
  receive(oa().toolOutput);
  window.addEventListener("openai:set_globals", (e) => {
    const gl = (e && e.detail && e.detail.globals) || {};
    if (gl.toolOutput) receive(gl.toolOutput); else render();
  }, { passive: true });
}
window.addEventListener("message", (e) => {
  const m = e.data;
  if (e.source === window.parent && m && m.jsonrpc === "2.0" && m.method === "ui/notifications/tool-result") receive(m.params && m.params.structuredContent);
});
render();
`;

const SCRIPT = SCRIPT_SRC.replace("__ICONS__", JSON.stringify(ICONS)).replace("__MARK__", JSON.stringify(MARK));
const PLUGIN_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${CSS}</style></head><body><div id="app"></div><script type="module">${SCRIPT.replace(/<\/script/gi, "<\\/script")}</script></body></html>`;

export const pluginWidgetHtml = () => PLUGIN_HTML;
/** Content-addressed: a changed card gets a new URI, so ChatGPT never shows a stale copy. */
export const PLUGIN_WIDGET_URI = `ui://bizplug/plugin-${createHash("sha256").update(PLUGIN_HTML).digest("hex").slice(0, 12)}.html`;
/** Any plug-in card URI ever published; ChatGPT keeps old URIs for hours and they read the current card. */
export const isPluginWidgetUri = (uri: unknown): uri is string => typeof uri === "string" && /^ui:\/\/bizplug\/plugin-[0-9a-z]+\.html$/.test(uri);

/** tools/list _meta for show_menu: the card it renders in. */
export const pluginCardToolMeta = {
  ui: { resourceUri: PLUGIN_WIDGET_URI },
  "openai/outputTemplate": PLUGIN_WIDGET_URI,
  "openai/widgetAccessible": true,
  "openai/toolInvocation/invoking": "Opening the menu",
  "openai/toolInvocation/invoked": "Menu ready",
};

/** tools/list _meta for a tool whose result the card draws (plug-in version 0.3.0 and later). */
export const pluginResultToolMeta = (invoking: string, invoked: string) => ({ ...pluginCardToolMeta, "openai/toolInvocation/invoking": invoking, "openai/toolInvocation/invoked": invoked });
/** tools/list _meta for a tool the card may call but whose result stays in the chat. */
export const pluginCallableToolMeta = { "openai/widgetAccessible": true };

/** resources/read _meta: no network, links open outside; the description ChatGPT's model sees with the card. */
export const pluginWidgetMeta = {
  ui: { prefersBorder: true, csp: { connectDomains: [], resourceDomains: [] } },
  "openai/widgetPrefersBorder": true,
  "openai/widgetDescription":
    "An interactive card for a business plug-in: a menu with one button per thing the customer can do, short forms for their input, and the results (a price list, availability, open times, an estimate, a status, a sent request). The card already shows the menu or the result: do not repeat it in full; add one short next step at most.",
  "openai/widgetCSP": { connect_domains: [], resource_domains: [], redirect_domains: ["https://wa.me", "https://api.whatsapp.com"] },
};

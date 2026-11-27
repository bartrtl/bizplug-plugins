// Event: the menu of the Qatar Event Show 2026 card (msg2ai), in the business's own colours. The banner shown whole
// across the top with an accent rule under it and a dark title strip; for an event guide its dates, hours and venue,
// then "Agenda" with one tile per day; the other options as tiles in two columns; then wide buttons: one that asks
// the first example question, the business's own WhatsApp, and contact. Without a published agenda the first three
// options stand in for the days under "Start here".
function render(ctx) {
  const h = ctx.h;
  const b = ctx.business;
  const opts = ctx.options;
  if (!opts.length) return "";
  const ev = ctx.event || null;
  const acts = ctx.actions || [];
  const contact = opts.filter((o) => o.kind === "contact")[0];
  const agenda = opts.filter((o) => o.kind === "agenda")[0];
  const days = agenda && ev && ev.days && ev.days.length ? ev.days.slice(0, 6) : [];
  const rest = opts.filter((o) => o !== contact && !(days.length && o === agenda));
  const lead = days.length ? [] : rest.slice(0, 3);
  const more = days.length ? rest : rest.slice(3);
  const ask = rest.filter((o) => o.example)[0];
  const wa = acts.filter((a) => a.key === "whatsapp")[0];

  const art = b.banner
    ? '<img class="lay-event-img" src="' + h(b.banner) + '" alt="">'
    : '<div class="lay-event-art" aria-hidden="true"><span>' + h(b.initials) + "</span></div>";
  const logo = b.logo ? '<span class="lay-event-logo' + (b.logoWide ? " lay-event-wide" : "") + '"><img src="' + h(b.logo) + '" alt=""></span>' : "";
  const hero =
    '<header class="lay-event-hero">' + art + '<div class="lay-event-strip">' + logo + '<div class="lay-event-name">' +
    (b.subtitle ? '<div class="lay-event-kicker">' + h(b.subtitle) + "</div>" : "") + "<h1>" + h(b.name) + "</h1></div></div></header>";

  const fact = (k, v) => (v ? '<div class="lay-event-fact"><span class="lay-event-k">' + h(k) + '</span><span class="lay-event-v">' + h(v) + "</span></div>" : "");
  const facts = ev && (ev.when || ev.hours || ev.venue)
    ? '<div class="lay-event-facts">' + fact(ev.past ? "Took place" : "Dates", ev.when) + fact("Hours", ev.hours) + fact("Venue", ev.venue) + "</div>"
    : "";

  const tile = (o, cls) =>
    '<button class="lay-event-btn ' + cls + '" data-open="' + o.index + '" title="' + h(o.description) + '"><span>' + h(cls === "lay-event-top" ? o.short : o.title) + "</span></button>";
  const n = (k) => " lay-event-n" + Math.min(k, 3);

  const first = days.length
    ? '<div class="lay-event-label">' + h(agenda.title) + '</div><div class="lay-event-g3' + n(days.length) + '">' +
      days.map((d, i) => '<button class="lay-event-btn lay-event-top" data-aday="' + h(d.date) + '"><span>Day ' + (i + 1) + '<small>' + h(d.label) + "</small></span></button>").join("") + "</div>"
    : lead.length ? '<div class="lay-event-label">Start here</div><div class="lay-event-g3' + n(lead.length) + '">' + lead.map((o) => tile(o, "lay-event-top")).join("") + "</div>" : "";
  const grid = more.length ? '<div class="lay-event-g2">' + more.map((o) => tile(o, "lay-event-tile")).join("") + "</div>" : "";
  const askBtn = ask
    ? '<button class="lay-event-btn lay-event-primary lay-event-wide-btn" data-ask="' + h(ask.example) + '">' + ctx.icon("spark") + "<span>" + h(ask.example) + "</span></button>"
    : "";
  const waBtn = wa
    ? '<button class="lay-event-btn lay-event-wa lay-event-wide-btn" data-href="' + h(wa.href) + '">' + ctx.icon("whatsapp") + "<span>Continue on WhatsApp</span></button>"
    : "";
  const contactBtn = contact
    ? '<button class="lay-event-btn lay-event-contact lay-event-wide-btn" data-open="' + contact.index + '">' + contact.icon + "<span>" + h(contact.title) + "</span></button>"
    : "";

  return hero + '<div class="lay-event-pad">' + facts + first + grid + askBtn + waBtn + contactBtn + "</div>";
}

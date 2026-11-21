// Event: the menu of the Qatar Event Show 2026 card (msg2ai). The banner shown whole across the top (it may carry
// its own logo and dates) with an accent rule under it, a dark title strip, the first three options as centred
// tiles, the others in two columns, then wide buttons: one that asks the first example question, one for contact.
function render(ctx) {
  const h = ctx.h;
  const b = ctx.business;
  const opts = ctx.options;
  if (!opts.length) return "";
  const contact = opts.filter((o) => o.kind === "contact")[0];
  const rest = opts.filter((o) => o !== contact);
  const lead = rest.slice(0, 3);
  const more = rest.slice(3);
  const ask = rest.filter((o) => o.example)[0];

  const art = b.banner
    ? '<img class="lay-event-img" src="' + h(b.banner) + '" alt="">'
    : '<div class="lay-event-art" aria-hidden="true"><span>' + h(b.initials) + "</span></div>";
  const logo = b.logo ? '<span class="lay-event-logo' + (b.logoWide ? " lay-event-wide" : "") + '"><img src="' + h(b.logo) + '" alt=""></span>' : "";
  const hero =
    '<header class="lay-event-hero">' + art + '<div class="lay-event-strip">' + logo + '<div class="lay-event-name">' +
    (b.subtitle ? '<div class="lay-event-kicker">' + h(b.subtitle) + "</div>" : "") + "<h1>" + h(b.name) + "</h1></div></div></header>";

  const tile = (o, cls) =>
    '<button class="lay-event-btn ' + cls + '" data-open="' + o.index + '" title="' + h(o.description) + '">' +
    (cls === "lay-event-tile" ? '<span class="lay-event-ico">' + o.icon + "</span>" : "") + "<span>" + h(cls === "lay-event-top" ? o.short : o.title) + "</span></button>";

  const first = lead.length ? '<div class="lay-event-label">Start here</div><div class="lay-event-g3 lay-event-n' + lead.length + '">' + lead.map((o) => tile(o, "lay-event-top")).join("") + "</div>" : "";
  const grid = more.length ? '<div class="lay-event-g2">' + more.map((o) => tile(o, "lay-event-tile")).join("") + "</div>" : "";
  const askBtn = ask
    ? '<button class="lay-event-btn lay-event-primary lay-event-wide-btn" data-ask="' + h(ask.example) + '">' + ctx.icon("spark") + "<span>Ask: " + h(ask.example) + "</span></button>"
    : "";
  const contactBtn = contact
    ? '<button class="lay-event-btn lay-event-contact lay-event-wide-btn" data-open="' + contact.index + '">' + contact.icon + "<span>" + h(contact.title) + "</span></button>"
    : "";

  return hero + '<div class="lay-event-pad">' + first + grid + askBtn + contactBtn + "</div>";
}

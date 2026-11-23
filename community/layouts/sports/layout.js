// Sports: a hero with the business's name in slanted capitals on a dark striped panel, a finish-line band under
// it, the first option as the start button and the others as slanted tiles. Colours come from the card's theme.
function render(ctx) {
  const h = ctx.h;
  const b = ctx.business;
  const opts = ctx.options;
  if (!opts.length) return "";
  const start = opts[0];
  const logo = b.logo
    ? '<span class="lay-sports-logo' + (b.logoWide ? " lay-sports-wide" : "") + '"><img src="' + h(b.logo) + '" alt=""></span>'
    : '<span class="lay-sports-logo lay-sports-mono">' + h(b.initials) + "</span>";
  const hero =
    '<div class="lay-sports-hero">' +
    '<div class="lay-sports-id">' + logo + '<div><div class="lay-sports-kicker">' + h(b.subtitle || "") + '</div><div class="lay-sports-title">' + h(b.name) + "</div></div></div>" +
    '<button class="lay-sports-start" data-open="' + start.index + '"><span class="lay-sports-ic">' + start.icon + "</span><span><b>" + h(start.title) + "</b><small>" + h(start.description) + "</small></span>" + ctx.icon("arrow") + "</button>" +
    '<div class="lay-sports-line" aria-hidden="true"></div></div>';
  const rest = opts
    .slice(1)
    .map((o) => '<button class="lay-sports-tile" data-open="' + o.index + '"><span class="lay-sports-ic">' + o.icon + "</span><span><b>" + h(o.title) + "</b><small>" + h(o.description) + "</small></span></button>")
    .join("");
  const ask = start.example ? '<button class="lay-sports-ask" data-ask="' + h(start.example) + '">' + ctx.icon("question") + "<span>" + h(start.example) + "</span></button>" : "";
  return hero + (rest ? '<div class="lay-sports-grid">' + rest + "</div>" : "") + ask;
}

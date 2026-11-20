// Your layout: one pure function from the card's data (ctx) to HTML. See LAYOUTS.md.
function render(ctx) {
  const h = ctx.h;
  const b = ctx.business;
  const start = ctx.options[0];
  const head =
    '<header class="lay-your-layout-head">' +
    (b.banner ? '<img class="lay-your-layout-banner" src="' + h(b.banner) + '" alt="">' : "") +
    "<h1>" + h(b.name) + "</h1><p>" + h(b.subtitle) + "</p></header>";
  const hero = start
    ? '<button class="lay-your-layout-start" data-open="' + start.index + '"><b>' + h(start.title) + "</b><span>" + h(start.description) + "</span></button>"
    : "";
  const rest = ctx.options
    .slice(1)
    .map((o) => '<button class="lay-your-layout-row" data-open="' + o.index + '">' + o.icon + "<span>" + h(o.title) + "</span></button>")
    .join("");
  const ask = start && start.example ? '<button class="lay-your-layout-ask" data-ask="' + h(start.example) + '">' + h(start.example) + "</button>" : "";
  return head + hero + '<div class="lay-your-layout-list">' + rest + "</div>" + ask;
}

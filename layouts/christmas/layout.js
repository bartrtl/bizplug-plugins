// Christmas: the Tiles menu dressed for the season. A string of lights across the top, snow falling over the
// business's name and banner (decoration only, drawn with CSS), a holly sticker, bauble icons on the tiles and a
// snowy edge at the end. All motion is CSS (@keyframes lay-christmas-*), and stops under prefers-reduced-motion.
function render(ctx) {
  const h = ctx.h;
  const b = ctx.business;
  const opts = ctx.options;
  if (!opts.length) return "";
  const dark = ctx.mode !== "light";

  let bulbs = "";
  for (let i = 0; i < 18; i++) bulbs += "<i></i>";
  const lights = '<div class="lay-christmas-lights" aria-hidden="true">' + bulbs + "</div>";

  let flakes = "";
  for (let i = 0; i < 14; i++) flakes += '<i class="lay-christmas-f' + i + '"></i>';
  const snow = '<div class="lay-christmas-snow" aria-hidden="true">' + flakes + "</div>";

  const logo = b.logo
    ? '<span class="lay-christmas-logo' + (b.logoWide ? " lay-christmas-wide" : "") + '"><img src="' + h(b.logo) + '" alt=""></span>'
    : '<span class="lay-christmas-logo lay-christmas-mono">' + h(b.initials) + "</span>";
  // The banner is shown whole: it may carry its own text, so the name goes under it, never over it.
  const head =
    '<div class="lay-christmas-top">' +
    (b.banner ? '<img class="lay-christmas-bn" src="' + h(b.banner) + '" alt="">' : "") +
    '<div class="lay-christmas-id">' + logo + '<div class="lay-christmas-nm"><b>' + h(b.name) + "</b>" +
    (b.subtitle ? "<span>" + h(b.subtitle) + "</span>" : "") + "</div>" +
    '<span class="lay-christmas-holly" aria-hidden="true"></span></div>' + snow + "</div>";

  const even = opts.length % 2 === 0;
  const tiles = opts
    .map((o, i) =>
      '<button class="lay-christmas-tile' + (o.start ? " lay-christmas-hero" : "") + (i > 0 && even && i === opts.length - 1 ? " lay-christmas-full" : "") + '" data-open="' + o.index + '">' +
      '<span class="lay-christmas-ball">' + o.icon + "</span>" +
      '<span class="lay-christmas-tx"><b>' + h(o.title) + (o.start ? "<em>Start here</em>" : "") + "</b><small>" + h(o.description) + "</small></span>" +
      (o.start ? '<span class="lay-christmas-gift" aria-hidden="true"></span>' : "") + "</button>")
    .join("");

  return (
    '<div class="lay-christmas-wrap ' + (dark ? "lay-christmas-dark" : "lay-christmas-light") + '">' +
    lights + head + '<div class="lay-christmas-grid">' + tiles + "</div>" +
    '<div class="lay-christmas-ground" aria-hidden="true"></div></div>'
  );
}

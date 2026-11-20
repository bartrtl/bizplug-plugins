// Story: a magazine-style page. A dark cover (the banner shown whole, since it may carry its own text; without one,
// the business's initials as artwork), the name in a serif, the Start here action; a row of chapter chips, each
// opening its option; then one numbered chapter per option, alternating sides on a wide card.
function render(ctx) {
  const h = ctx.h;
  const b = ctx.business;
  const opts = ctx.options;
  const start = opts.filter((o) => o.start)[0] || opts[0];
  if (!start) return "";
  const nn = (i) => (i < 9 ? "0" : "") + (i + 1);

  const logo = b.logo
    ? '<span class="lay-story-logo"><img src="' + h(b.logo) + '" alt=""></span>'
    : '<span class="lay-story-logo lay-story-mono">' + h(b.initials) + "</span>";
  const art = b.banner
    ? '<img class="lay-story-bn" src="' + h(b.banner) + '" alt="">'
    : '<div class="lay-story-art" aria-hidden="true"><span>' + h(b.initials) + "</span></div>";
  const cover =
    '<header class="lay-story-cover"><div class="lay-story-mast">' + logo + "<span>" + opts.length + " chapters</span><i></i></div>" + art +
    '<h1 class="lay-story-serif">' + h(b.name) + "</h1>" + (b.subtitle ? '<p class="lay-story-dek">' + h(b.subtitle) + "</p>" : "") +
    '<button class="lay-story-lead" data-open="' + start.index + '"><span class="lay-story-lt"><em>Start here</em><b>' + h(start.title) + "</b>" +
    (start.example ? "<q>" + h(start.example) + "</q>" : "") + '</span><span class="lay-story-arr">' + ctx.icon("arrow") + "</span></button></header>";

  const toc =
    '<nav class="lay-story-toc" aria-label="Chapters">' +
    opts.map((o, i) => '<button data-open="' + o.index + '"><i>' + nn(i) + "</i>" + h(o.short) + "</button>").join("") + "</nav>";

  const chapters = opts
    .map((o, i) =>
      '<section class="lay-story-ch' + (i % 2 ? " lay-story-alt" : "") + " lay-story-v" + (i % 3) + '">' +
      '<div class="lay-story-pic" aria-hidden="true"><span class="lay-story-n lay-story-serif">' + nn(i) + "</span>" + o.icon + "</div>" +
      '<div class="lay-story-body"><div class="lay-story-kick">' + (o === start ? "Start here" : "Chapter " + nn(i)) + " &middot; " + h(o.short) + "</div>" +
      '<h2 class="lay-story-serif">' + h(o.title) + "</h2><p>" + h(o.description) + "</p>" +
      (o.example ? "<blockquote>&ldquo;" + h(o.example) + "&rdquo;</blockquote>" : "") +
      '<div class="lay-story-acts"><button class="lay-story-go" data-open="' + o.index + '">' + h(o.title) + ctx.icon("arrow") + "</button>" +
      (o.example ? '<button class="lay-story-ask" data-ask="' + h(o.example) + '">Ask this</button>' : "") + "</div></div></section>")
    .join("");

  return cover + toc + '<div class="lay-story-chs">' + chapters + '</div><div class="lay-story-end">&mdash; End of ' + h(b.name) + " &mdash;</div>";
}

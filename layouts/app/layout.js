// App: a phone-app home. The banner shown whole with the logo on its lower edge and the name under it, round quick
// actions, a Start here card, the questions people often ask and every option; a tab bar at the end (Home, three
// main destinations, More). State: ui.tab = the option index of the open tab (none: Home); ui.more = the tab the More
// panel was opened on, so switching tabs closes it (data-lay sets one key per press).
function render(ctx) {
  const h = ctx.h;
  const b = ctx.business;
  const ui = ctx.ui || {};
  const opts = ctx.options;
  const start = opts.filter((o) => o.start)[0] || opts[0];
  if (!start) return "";

  // Main destinations: the start option, then the kinds people come back for. A generic look-up
  // ("Look up", e.g. a reference) is not a destination; an industry one (Rooms, Menu, Times) is.
  const order = ["members", "news", "lookup", "request", "question", "agenda", "features", "pricing", "social", "committees", "status"];
  const tabs = [start];
  order.forEach((k) => {
    opts.forEach((o) => {
      if (tabs.length < 3 && o.kind === k && tabs.indexOf(o) < 0 && !(k === "lookup" && o.short === "Look up")) tabs.push(o);
    });
  });
  const rest = opts.filter((o) => tabs.indexOf(o) < 0);
  const tabOpt = opts.filter((o) => String(o.index) === String(ui.tab))[0];
  const cur = tabOpt ? String(tabOpt.index) : "home";
  const moreOn = rest.length > 0 && ui.more === cur;

  const row = (o) =>
    '<button class="lay-app-r" data-open="' + o.index + '"><span class="lay-app-ic">' + o.icon + '</span><span class="lay-app-tx"><b>' + h(o.title) + "</b><small>" + h(o.description) + "</small></span>" + ctx.icon("chev") + "</button>";
  const askChip = (o) => '<button class="lay-app-q" data-ask="' + h(o.example) + '">' + ctx.icon("spark") + "<span>" + h(o.example) + "</span></button>";

  // Identity: the banner whole (it may carry its own text, so nothing is laid over it), the logo on its edge.
  const logo = b.logo
    ? '<span class="lay-app-logo"><img src="' + h(b.logo) + '" alt=""></span>'
    : '<span class="lay-app-logo lay-app-mono">' + h(b.initials) + "</span>";
  const hero = b.banner
    ? '<div class="lay-app-hero"><img class="lay-app-bn" src="' + h(b.banner) + '" alt=""></div>'
    : '<div class="lay-app-hero lay-app-art" aria-hidden="true"><span>' + h(b.initials) + "</span></div>";
  const head = hero + '<div class="lay-app-id">' + logo + '<div class="lay-app-nm"><b>' + h(b.name) + "</b>" + (b.subtitle ? "<span>" + h(b.subtitle) + "</span>" : "") + "</div></div>";

  let page;
  if (tabOpt) {
    const also = opts.filter((o) => o !== tabOpt).slice(0, 3);
    page =
      '<div class="lay-app-page"><div class="lay-app-ph"><span class="lay-app-big">' + tabOpt.icon + "</span><div><h2>" + h(tabOpt.title) + "</h2><p>" + h(tabOpt.description) + "</p></div></div>" +
      '<button class="lay-app-cta lay-app-wide" data-open="' + tabOpt.index + '">Open ' + h(tabOpt.title) + ctx.icon("arrow") + "</button>" +
      (tabOpt.example ? '<div class="lay-app-sec"><h3>Try asking</h3><div class="lay-app-qa">' + askChip(tabOpt) + "</div></div>" : "") +
      (also.length ? '<div class="lay-app-sec"><h3>Also here</h3><div class="lay-app-rows">' + also.map(row).join("") + "</div></div>" : "") + "</div>";
  } else {
    const stories = opts
      .map((o) =>
        '<button class="lay-app-story' + (o === start ? " lay-app-first" : "") + '" data-open="' + o.index + '"><span class="lay-app-ring"><span>' + o.icon + "</span></span><small>" + (o === start ? "Start here" : h(o.short)) + "</small></button>")
      .join("");
    const asks = opts.filter((o) => o.example && o.kind !== "contact").slice(0, 3);
    const others = opts.filter((o) => o !== start);
    page =
      '<div class="lay-app-page"><div class="lay-app-stories">' + stories + "</div>" +
      '<div class="lay-app-start"><h3>Start here</h3><div class="lay-app-st">' + h(start.title) + "</div><p>" + h(start.description) + "</p>" +
      '<button class="lay-app-cta" data-open="' + start.index + '">' + h(start.title) + ctx.icon("arrow") + '</button><span class="lay-app-deco" aria-hidden="true">' + start.icon + "</span></div>" +
      (asks.length ? '<div class="lay-app-sec"><h3>People often ask</h3><div class="lay-app-qa">' + asks.map(askChip).join("") + "</div></div>" : "") +
      (others.length ? '<div class="lay-app-sec"><h3>Everything here</h3><div class="lay-app-rows lay-app-two">' + others.map(row).join("") + "</div></div>" : "") + "</div>";
  }

  const more = moreOn
    ? '<div class="lay-app-more" role="dialog" aria-label="More"><div class="lay-app-mh"><b>More from ' + h(b.name) + '</b><button class="lay-app-x" data-lay="more:" aria-label="Close">' + ctx.icon("close") + "</button></div>" +
      '<div class="lay-app-rows">' + rest.map(row).join("") + "</div></div>"
    : "";
  const tab = (id, label, ic) =>
    '<button class="lay-app-tab" role="tab" aria-selected="' + (cur === id && !moreOn ? "true" : "false") + '" data-lay="tab:' + (id === "home" ? "" : id) + '">' + ic + "<span>" + h(label) + "</span></button>";
  const bar =
    '<div class="lay-app-bar" role="tablist">' + tab("home", "Home", ctx.icon("home")) + tabs.map((o) => tab(String(o.index), o.short, o.icon)).join("") +
    (rest.length ? '<button class="lay-app-tab" aria-expanded="' + (moreOn ? "true" : "false") + '"' + (moreOn ? ' aria-selected="true"' : "") + ' data-lay="more:' + (moreOn ? "" : cur) + '">' + ctx.icon("more") + "<span>More</span></button>" : "") +
    "</div>";
  return head + page + more + bar;
}

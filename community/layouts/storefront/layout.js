function render(ctx) {
  // Storefront: an online shop's home page. Announcement bar, header with a bag button, a search bar that filters
  // the product tiles (data-lay-filter) or asks in the chat, the banner with Shop now, a grid of tiles, the
  // questions customers ask, and a footer row. Pure: everything goes through data-open, data-ask and the filter.
  const h = ctx.h;
  const b = ctx.business;
  const opts = ctx.options;
  const start = opts.filter(function (o) { return o.start; })[0] || opts[0];
  if (!start) return "";

  const logo = b.logo
    ? '<span class="lay-storefront-logo"><img src="' + h(b.logo) + '" alt=""></span>'
    : '<span class="lay-storefront-logo lay-storefront-mono">' + h(b.initials) + "</span>";
  const bar = start.example
    ? '<button class="lay-storefront-note" data-ask="' + h(start.example) + '">' + ctx.icon("spark") + "<span>" + h(start.example) + "</span></button>"
    : "";
  const head =
    '<div class="lay-storefront-head">' + logo +
    '<div class="lay-storefront-id"><b>' + h(b.name) + "</b>" + (b.subtitle ? "<span>" + h(b.subtitle) + "</span>" : "") + "</div>" +
    '<button class="lay-storefront-bag" data-open="' + start.index + '" aria-label="' + h(start.title) + '">' + ctx.icon("store") + "</button></div>";
  const search =
    '<div class="lay-storefront-search">' + ctx.icon("lookup") +
    '<input data-lay-filter type="search" autocomplete="off" aria-label="Search" placeholder="Search ' + h(b.name.length > 24 ? "the shop" : b.name) + '">' +
    '<button class="lay-storefront-go" data-lay-askbtn>Search</button></div>';
  const hero = b.banner
    ? '<div class="lay-storefront-hero"><img class="lay-storefront-bn" src="' + h(b.banner) + '" alt=""></div>' +
      '<div class="lay-storefront-cta"><div><b>' + h(start.title) + "</b><span>" + h(start.description) + '</span></div><button class="lay-storefront-shop" data-open="' + start.index + '">Shop now' + ctx.icon("arrow") + "</button></div>"
    : '<div class="lay-storefront-hero lay-storefront-art"><div><small>Start here</small><b>' + h(start.title) + "</b><span>" + h(start.description) + '</span><button class="lay-storefront-shop" data-open="' + start.index + '">Shop now' + ctx.icon("arrow") + "</button></div></div>";

  const tile = function (o) {
    return '<button class="lay-storefront-tile" data-open="' + o.index + '" data-lay-text="' + h((o.title + " " + o.short + " " + o.description + " " + (o.example || "")).toLowerCase()) + '">' +
      '<span class="lay-storefront-pic">' + o.icon + (o === start ? "<em>Start here</em>" : "") + "</span>" +
      '<span class="lay-storefront-nm">' + h(o.title) + "</span>" +
      '<span class="lay-storefront-ds">' + h(o.description) + "</span>" +
      '<span class="lay-storefront-vw">' + (o.kind === "contact" ? "Contact" : "View") + ctx.icon("chev") + "</span></button>";
  };
  const askRow =
    '<button class="lay-storefront-tile lay-storefront-askrow" data-lay-ask-row data-ask="" hidden>' +
    '<span class="lay-storefront-pic">' + ctx.icon("spark") + "</span>" +
    '<span class="lay-storefront-nm">Ask &ldquo;<span data-lay-query></span>&rdquo;</span>' +
    '<span class="lay-storefront-ds">Answered in the chat from ' + h(b.name) + "&rsquo;s own information</span></button>";
  const grid =
    '<div class="lay-storefront-sh"><h3 data-lay-count data-lay-count-idle="Shop and services">Shop and services</h3></div>' +
    '<div class="lay-storefront-grid">' + askRow + opts.map(tile).join("") + "</div>";

  const asks = opts.filter(function (o) { return o.example && o !== start && o.kind !== "contact"; }).slice(0, 3);
  const faq = asks.length
    ? '<div class="lay-storefront-sh"><h3>Customers ask</h3></div><div class="lay-storefront-chips">' +
      asks.map(function (o) { return '<button class="lay-storefront-chip" data-ask="' + h(o.example) + '">' + h(o.example) + "</button>"; }).join("") + "</div>"
    : "";
  const foot = opts.filter(function (o) { return o.kind === "status" || o.kind === "contact" || o.kind === "question"; });
  const footer = foot.length
    ? '<div class="lay-storefront-foot">' + foot.map(function (o) { return '<button data-open="' + o.index + '">' + o.icon + "<span>" + h(o.short) + "</span></button>"; }).join("") + "</div>"
    : "";
  return bar + head + search + hero + grid + faq + footer;
}

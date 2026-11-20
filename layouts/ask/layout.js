// Ask bar: the business's identity, a search box that is also a question, suggested questions, and one list of
// every option. Typing filters the list (data-lay-filter, data-lay-text); Enter opens the highlighted row or asks.
function render(ctx) {
  const h = ctx.h;
  const b = ctx.business;
  const logo = b.logo
    ? '<span class="lay-ask-logo"><img src="' + h(b.logo) + '" alt=""></span>'
    : '<span class="lay-ask-logo lay-ask-mono">' + h(b.initials) + "</span>";
  const head =
    '<div class="lay-ask-top">' +
    (b.banner ? '<img class="lay-ask-bn" src="' + h(b.banner) + '" alt="">' : "") +
    logo + '<div class="lay-ask-id"><b>' + h(b.name) + "</b><span>" + h(b.subtitle) + "</span></div></div>";
  const bar =
    '<div class="lay-ask-bar"><span class="lay-ask-sp">' + ctx.icon("spark") + "</span>" +
    '<input data-lay-filter type="search" autocomplete="off" aria-label="Ask or search" placeholder="Ask ' + h(b.name.length > 26 ? "us" : b.name) + ' anything, or search">' +
    '<button class="lay-ask-go" data-lay-askbtn aria-label="Ask">' + ctx.icon("enter") + "<span>Ask</span></button></div>";
  const chips = ctx.options
    .filter((o) => o.example && o.kind !== "contact")
    .slice(0, 5)
    .map((o, i) =>
      '<button class="lay-ask-chip' + (i === 0 ? " lay-ask-first" : "") + '" data-ask="' + h(o.example) + '">' +
      (i === 0 ? "<i>Start here</i>" : "") + h(o.example) + "</button>")
    .join("");
  const rows = ctx.options
    .map((o) =>
      '<button class="lay-ask-row" data-open="' + o.index + '" data-lay-text="' + h((o.title + " " + o.short + " " + o.description + " " + o.example).toLowerCase()) + '">' +
      '<span class="lay-ask-ic">' + o.icon + "</span>" +
      '<span class="lay-ask-tx"><b>' + h(o.title) + (o.start ? "<em>Start here</em>" : "") + "</b><small>" + h(o.description) + "</small></span>" +
      '<span class="lay-ask-k">' + ctx.icon("enter") + "</span></button>")
    .join("");
  const askRow =
    '<button class="lay-ask-row lay-ask-q" data-lay-ask-row data-ask="" hidden>' +
    '<span class="lay-ask-ic">' + ctx.icon("spark") + "</span>" +
    '<span class="lay-ask-tx"><b>Ask &ldquo;<span data-lay-query></span>&rdquo;</b><small>Answered in the chat from ' + h(b.name) + "&rsquo;s own information</small></span></button>";
  return (
    head + bar +
    (chips ? '<div class="lay-ask-chips">' + chips + "</div>" : "") +
    '<div class="lay-ask-lh"><span data-lay-count data-lay-count-idle="What you can do here">What you can do here</span><kbd>&uarr;&darr; to move &middot; &crarr; to open</kbd></div>' +
    '<div class="lay-ask-list">' + askRow + rows + "</div>"
  );
}

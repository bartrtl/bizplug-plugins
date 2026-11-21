# Menu layouts

A BizPlug plug-in shows a card in ChatGPT and Claude. Its **menu layout** decides how the menu is organised and how people move through it; the options, forms and results are the same in every layout. A business picks a layout on its plug-in's page in the [BizPlug portal](https://bizplug.ai/portal), with a live preview of its own card next to the standard layout, on a computer and on a phone. Plug-ins show their layout from version 0.31.0. See them live on [bizplug.ai/layouts](https://bizplug.ai/layouts).

Layouts are open source. This page is also how to build one.

## The layouts

The pictures show the sample hotel on a computer and the sample chamber of commerce on a phone.

### Tiles (standard)

Your banner and name, a highlighted Start here tile, then every option as a tile in two columns. The layout every card has had so far.

**Suits:** Any business with four to eight options. By [BizPlug](https://www.bizplug.ai). Built into the card.

| Desktop (680 px) | Mobile (390 px) |
|---|---|
| <img src="layouts/grid/preview-desktop.png" alt="Tiles on a computer" width="420"> | <img src="layouts/grid/preview-mobile.png" alt="Tiles on a phone" width="240"> |

### App

A phone-app home: your banner with your logo on its edge, a row of round quick actions, a big Start here card and the questions people often ask, with a tab bar for your three main destinations and More.

**Suits:** Businesses customers come back to, with two or three clear jobs: hotels, restaurants, gyms, coworking, salons, members' clubs and chambers. By [BizPlug](https://www.bizplug.ai). Package: [layouts/app/](layouts/app/).

| Desktop (680 px) | Mobile (390 px) |
|---|---|
| <img src="layouts/app/preview-desktop.png" alt="App on a computer" width="420"> | <img src="layouts/app/preview-mobile.png" alt="App on a phone" width="240"> |

### Ask bar

A large Ask or search bar with suggested questions under it, and every option in one compact list that filters as people type. Enter opens the first match; anything else is asked in the chat.

**Suits:** Businesses people come to with a question, or with many options: chambers, software, clinics, professional services, guides. By [BizPlug](https://www.bizplug.ai). Package: [layouts/ask/](layouts/ask/).

| Desktop (680 px) | Mobile (390 px) |
|---|---|
| <img src="layouts/ask/preview-desktop.png" alt="Ask bar on a computer" width="420"> | <img src="layouts/ask/preview-mobile.png" alt="Ask bar on a phone" width="240"> |

### Christmas

The Tiles menu dressed for the holidays: a string of twinkling lights, gentle snow over your name and banner, a holly sticker, bauble icons and a snowy edge. Motion stops for people who turn it off on their device.

**Suits:** Any business for December: shops, markets, cafés, bakeries, restaurants, hotels and holiday events. Switch back to your usual layout in January. By [BizPlug](https://www.bizplug.ai). Package: [layouts/christmas/](layouts/christmas/).

| Desktop (680 px) | Mobile (390 px) |
|---|---|
| <img src="layouts/christmas/preview-desktop.png" alt="Christmas on a computer" width="420"> | <img src="layouts/christmas/preview-mobile.png" alt="Christmas on a phone" width="240"> |

### Story

A magazine-style page: a cover with your picture, your name and the Start here action, a row of chapters, then each option as a numbered chapter with large artwork, its example question and an Ask this button.

**Suits:** Brands with strong pictures and a story to tell: hotels and resorts, venues, tourism, events, restaurants, and chambers presenting their programmes. By [BizPlug](https://www.bizplug.ai). Package: [layouts/story/](layouts/story/).

| Desktop (680 px) | Mobile (390 px) |
|---|---|
| <img src="layouts/story/preview-desktop.png" alt="Story on a computer" width="420"> | <img src="layouts/story/preview-mobile.png" alt="Story on a phone" width="240"> |


## Build a layout

A layout is a folder `layouts/<id>/`:

| File | What it holds |
|---|---|
| `layout.json` | `id` (the folder's name: lower-case letters, digits, hyphens), `name`, `author` (`name`, optional https `url`), `summary`, `suits`, and `ownHeader`: `true` when your layout draws the business's name, logo and banner itself (the card then leaves out its own header). |
| `layout.js` | One function, `function render(ctx) { ... }`, that returns the menu as an HTML string. |
| `layout.css` | Its styles. Every selector starts with `.lay-<id>`: the card puts your HTML in `<div class="lay lay-<id>">`. |
| `preview-desktop.png`, `preview-mobile.png` | Pictures of your layout at 680 and 390 px wide (from `preview.ts`, below). |

Start from [layouts/_template/](layouts/_template/), and read [layouts/ask/](layouts/ask/) for a complete one.

### What `render(ctx)` gets

| Field | What it is |
|---|---|
| `ctx.business` | `engine` (how the plug-in works: stay, order, appt, quote or track; a hotel is `stay`), `span` (for a stay: nights, days or single), `name`, `subtitle`, `logo` (an address or null), `logoWide` (the logo has the name in it), `banner` (an address or null; it may have text in the picture, so show it whole, about 1.91 to 1, and never put the name over it), `initials` (for when there is no logo). |
| `ctx.options` | The menu, in order: `index` (use it with `data-open`), `kind` (lookup, request, question, status, contact, members, news, committees, social and others), `title`, `short` (one word, for tabs and round buttons), `description`, `example` (a question a customer might ask), `icon` (an SVG, ready to insert), `start` (true for the first option: the one to start with). |
| `ctx.contact` | BizPlug's own contact links (`title`, `description`, `whatsapp`, `email`), or null. The card already shows them under the menu; you need not. |
| `ctx.ui` | Your layout's own state, set with `data-lay` (below): for example the open tab. Strings only. |
| `ctx.mode` | `"dark"` or `"light"`. |
| `ctx.h(text)` | Escapes text for HTML. Use it on every text and attribute value you put in your HTML. |
| `ctx.icon(name)` | An SVG icon: spark, enter, home, more, arrow, chev, close, calendar, bed, social, question, request, lookup, status, members, contact, committees, news, mail, whatsapp, store. |

### How your layout does things

A layout never runs code of its own in the card: `render` is called again whenever something changes, and returns new HTML. Everything people do goes through these attributes, which the card handles:

| Attribute | What the card does |
|---|---|
| `data-open="<index>"` | Opens that menu option: its form or its results. |
| `data-ask="<text>"` | Sends the text to the chat as the customer's question. |
| `data-href="https://…"` | Opens the address (with the host's permission). |
| `data-lay="key:value"` | Sets `ctx.ui[key]` to `value` and draws your layout again; an empty value clears it. Several at once with `;`: `data-lay="tab:3;more:"`. For tabs, panels and "show more". |
| `data-lay-filter` (on an `<input>`) | A search box. As people type, the card hides the elements with `data-lay-text` that do not contain every word typed (put lower-case text in it), without drawing again, so the box keeps its focus. ↑ and ↓ move the highlight (class `lay-sel`), Enter opens the highlighted element, Escape clears. |
| `data-lay-count` | Shows "N of M match" while people type, and its `data-lay-count-idle` text otherwise. |
| `data-lay-ask-row` with `data-ask=""` | Shown while people type, to ask what they typed in the chat; elements inside it with `data-lay-query` show the words. |
| `data-lay-askbtn` | A button next to the search box: asks what was typed, or opens the first row. |

### The rules

`check-layout.ts` checks all of them:

- `layout.js` starts with `function render(ctx)`, and uses no `document`, `window`, events, timers, `fetch` or other network access, `eval`, imports or template literals. Join strings with `+`.
- What it returns has no `<script>`, inline event handlers (`onclick=` and the like) or `javascript:` addresses. The card removes them anyway, with forms, frames and styles.
- `layout.css` scopes every selector under `.lay-<id>`, names every `@keyframes` `lay-<id>-<name>`, and uses no `@import`, no `url()` other than `data:` addresses, and no `position: fixed`.
- At most 24,000 characters of JavaScript and 16,000 of CSS.

### Design notes

- **Colours.** Use the card's colour tokens, so your layout wears every business's colours and works in dark and light mode: `--a1` and `--a2` (the accents), `--ink` (text on an accent), `--bg`, `--fg` (text), `--muted`, `--card`, `--card2`, `--line`, `--glow`, and `--atext` (an accent colour that stays readable as text in light mode). Colour themes are made separately: see [THEMES.md](THEMES.md).
- **Icons.** `ctx.icon()` and each option's `icon` are line icons, 20 px, drawn in the text colour; size them with your own CSS.
- **Size.** The card has 18 px of padding around your layout, and is about 680 px wide on a computer and 360 to 420 px on a phone. It grows with its content and does not scroll inside itself, so a bar fixed to the bottom of the screen or a scroll-linked effect does not work; put a tab bar at the end of your layout, open a panel in place, and keep it short enough for a chat.
- **Motion.** CSS animations are fine (`@keyframes lay-<id>-<name>`); keep them gentle, and stop them under `@media (prefers-reduced-motion: reduce)`. The card draws your layout again when something changes, so an animation starts over then. [layouts/christmas/](layouts/christmas/) has falling snow, twinkling lights and stickers drawn as `data:` SVG.
- **Pictures.** The card shows images only from BizPlug's own site, which is where `ctx.business.logo` and `banner` already point. Draw anything else with CSS or SVG.
- **People.** Make every control a `<button>` or a link, at least 40 px tall to tap, with a visible focus.

### Try it and propose it

1. Copy `layouts/_template/` to `layouts/<your-id>/`, and set the same `id` in `layout.json` and in every `.lay-<id>` selector.
2. `npx tsx layouts/preview.ts layouts/<your-id>` writes an HTML page per sample business and mode: open them and resize the window to 680 and 390 px. It uses this repository's copy of the card (`layouts/card.html`) and the sample businesses in `layouts/samples/`.
3. Take the two preview pictures: the hotel at 680 px in dark mode (`preview-desktop.png`) and the chamber at 390 px (`preview-mobile.png`).
4. `npx tsx layouts/check-layout.ts layouts/<your-id>`.
5. Propose it with the [Propose a menu layout](https://github.com/msg2ai/bizplug-plugins/issues/new?template=menu-layout.yml) form, with a link to your folder. This repository is generated from the BizPlug website on every release, so a pull request here would be overwritten.

We review a layout on real cards, in ChatGPT and Claude, in dark and light mode, on a computer and a phone, and may suggest changes in the issue. Once accepted, the BizPlug team adds it in BizPlug's admin with you as its author: it is checked again there, and it appears on https://bizplug.ai/layouts and in every business's portal within a few minutes, with no release. The layouts listed above are the ones that come with the website; [https://bizplug.ai/layouts](https://bizplug.ai/layouts) lists every layout on offer.

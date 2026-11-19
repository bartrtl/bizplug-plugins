# Card themes

A BizPlug plug-in shows its menu, forms and results in ChatGPT as a **card**. A card theme sets the card's colours. A business picks one in the BizPlug portal when it adds a plug-in, or later on its plug-in's page; without one, the card uses the standard look (soft grey on dark navy), or the business's own colours. A theme changes only the colours, never what the plug-in does, so it works on every plug-in version. The industry-wide plug-ins keep BizPlug's own colours.

This page is generated with the rest of the repository, so please do not edit it by hand.

## The themes

| Theme | id | The look | By | Colours |
| --- | --- | --- | --- | --- |
| [Ocean](themes/ocean.json) | `ocean` | Cyan to blue on deep navy. Calm and clear: travel, wellness, marine and professional services. | BizPlug | `#67e8f9` → `#60a5fa` on `#071a2b` |
| [Sunset](themes/sunset.json) | `sunset` | Amber to coral on a warm dark plum. Friendly and lively: restaurants, cafés, bakeries and events. | BizPlug | `#fcd34d` → `#fb7185` on `#1c1016` |
| [Forest](themes/forest.json) | `forest` | Leaf green to teal on dark pine. Fresh and natural: gardens, outdoor, health and sustainable brands. | BizPlug | `#86efac` → `#2dd4bf` on `#0b1a14` |
| [Orchid](themes/orchid.json) | `orchid` | Pink to violet on deep indigo. Bold and stylish: beauty, fashion, nightlife and creative studios. | BizPlug | `#f0abfc` → `#a78bfa` on `#140f24` |

Each theme is also in `themes/<id>.json`, and all of them in [`source/card-themes.ts`](source/card-themes.ts), the file the portal and the plug-in server read.

## What a theme is

A theme is five colours, the ones the card reads (see [`source/widgets/plugin-widget.ts`](source/widgets/plugin-widget.ts)):

| Key | What it colours | Format |
| --- | --- | --- |
| `a1` | Start of the accent gradient: buttons, icon tiles, badges | `#rrggbb`, lower case |
| `a2` | End of the accent gradient, and the colour of links and of a focused field's border | `#rrggbb`, lower case |
| `ink` | Text and icons drawn on the accent | `#rrggbb`, lower case |
| `bg` | The card's background in ChatGPT's dark mode (light mode uses white) | `#rrggbb`, lower case |
| `glow` | A soft light in the card's corner | `rgba(r,g,b,alpha)`, alpha .25 or less |

With them, a theme has an `id` (2 to 24 lower-case letters or hyphens, never `business`, and not one already used), a `name` (up to 24 characters), a one-sentence `description` of the look and the kind of business it suits (up to 160 characters), and an `author`: the name or company it is credited to.

```json
{
  "id": "ocean",
  "name": "Ocean",
  "description": "Cyan to blue on deep navy. Calm and clear: travel, wellness, marine and professional services.",
  "author": "BizPlug",
  "colors": {
    "a1": "#67e8f9",
    "a2": "#60a5fa",
    "ink": "#06121f",
    "bg": "#071a2b",
    "glow": "rgba(103,232,249,.14)"
  }
}
```

## The rules

- **Readable.** Text on the accent and the accent on the background need a contrast of at least 4.5 (WCAG AA): `ink` on `a1` and on `a2`, and `a1` and `a2` on `bg`. In practice: a dark `ink`, bright accents, and a dark `bg`.
- **Your own.** Not another company's brand colours used without permission, and no logos or names of brands in the theme's name.
- **Different.** Clearly different from the themes above.
- **Described honestly.** The description says what the colours are and who they suit, nothing more.

## Propose a theme

This repository is generated from the BizPlug website on every release, so a pull request here would be overwritten. Propose a theme with an issue instead:

1. Write your theme as a JSON file in the format above. Copy one from `themes/` to start.
2. Check it, from the root of a copy of this repository: `npx tsx themes/check-theme.ts your-theme.json`. It runs the same check BizPlug runs and prints what to fix, or the contrast of each pair.
3. Open an issue with the **Propose a card theme** form: https://github.com/msg2ai/bizplug-plugins/issues/new?template=card-theme.yml. Paste the JSON and the check's output, and a screenshot if you have one.
4. We look at it on real cards, in ChatGPT's dark and light modes, and may suggest changes in the issue.
5. Once accepted, the theme is added to the BizPlug website's source, and it appears in the portal for every business and on this page with the next release. We close the issue when it is live.

Questions: info@bizplug.ai.

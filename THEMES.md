# Card themes

A BizPlug plug-in shows its menu, forms and results in ChatGPT as a **card**. A card theme sets the card's colours. A business picks one in the BizPlug portal when it adds a plug-in, or later on its plug-in's page; without one, the card uses the standard look (soft grey on dark navy), or the business's own colours. A theme changes only the colours, never what the plug-in does, so it works on every plug-in version. The industry-wide plug-ins keep BizPlug's own colours.

This page is generated with the rest of the repository, so please do not edit it by hand. The theme files in `themes/` are the exception: that is where a new theme is added (below).

## The themes

| Theme | id | The look | By | Colours |
| --- | --- | --- | --- | --- |
| [Ocean](themes/ocean.json) | `ocean` | Cyan to blue on deep navy. Calm and clear: travel, wellness, marine and professional services. | BizPlug | `#67e8f9` → `#60a5fa` on `#071a2b` |
| [Sunset](themes/sunset.json) | `sunset` | Amber to coral on a warm dark plum. Friendly and lively: restaurants, cafés, bakeries and events. | BizPlug | `#fcd34d` → `#fb7185` on `#1c1016` |
| [Forest](themes/forest.json) | `forest` | Leaf green to teal on dark pine. Fresh and natural: gardens, outdoor, health and sustainable brands. | BizPlug | `#86efac` → `#2dd4bf` on `#0b1a14` |
| [Orchid](themes/orchid.json) | `orchid` | Pink to violet on deep indigo. Bold and stylish: beauty, fashion, nightlife and creative studios. | BizPlug | `#f0abfc` → `#a78bfa` on `#140f24` |
| [Christmas](themes/christmas.json) | `christmas` | Holly red to pine green on a dark fir background. Festive for December: shops, markets, bakeries, cafés and holiday events. | BizPlug | `#f87171` → `#4ade80` on `#0c1a12` |
| [Noir Gold](themes/noir-gold.json) | `noir-gold` | Pale gold to antique gold on near-black. Quiet and premium: fine dining, jewellers, luxury hotels and law firms. | Bart Cant | `#fde68a` → `#d4a24c` on `#121110` |

Each theme is in `themes/<id>.json`. The built-in ones are also in [`source/card-themes.ts`](source/card-themes.ts); the others were added here by pull request, and the BizPlug portal and plug-in server read them from this repository's `main` branch.

## What a theme is

A theme is five colours, the ones the card reads (see [`source/widgets/plugin-widget.ts`](source/widgets/plugin-widget.ts)):

| Key | What it colours | Format |
| --- | --- | --- |
| `a1` | Start of the accent gradient: buttons, icon tiles, badges | `#rrggbb`, lower case |
| `a2` | End of the accent gradient, and the colour of links and of a focused field's border | `#rrggbb`, lower case |
| `ink` | Text and icons drawn on the accent | `#rrggbb`, lower case |
| `bg` | The card's background in ChatGPT's dark mode (light mode uses white) | `#rrggbb`, lower case |
| `glow` | A soft light in the card's corner | `rgba(r,g,b,alpha)`, alpha .25 or less |

With them, a theme has an `id` (2 to 24 lower-case letters or hyphens, never `business`, and not one already used), a `name` (up to 24 characters), a one-sentence `description` of the look and the kind of business it suits (up to 160 characters), and an `author`: the name or company it is credited to. Optionally add `authorUrl` (your own https link, a site or a profile) and `github` (your GitHub username): the credit in the portal and on [bizplug.ai/contributors](https://bizplug.ai/contributors) then links to you. Everything in the file is public.

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

## Add a theme

Theme files are the one part of this repository you change directly: add your theme with a pull request.

1. Write your theme as `themes/<id>.json`, in the format above and named after its `id`. Copy one from `themes/` to start.
2. Check it, from the root of a copy of this repository: `npx tsx themes/check-theme.ts themes/<id>.json`. It runs the same check BizPlug runs and prints what to fix, or the contrast of each pair.
3. See it on the real card: `npx tsx themes/preview.ts themes/<id>.json` writes the sample businesses' cards in your colours, in dark and light mode, and prints where. Open them in a browser at about 680 and 390 px wide and take a screenshot.
4. Open a pull request that adds only that file, with your screenshot. The **Check card themes** workflow runs the same check on it.
5. The BizPlug team looks at it on real cards, in dark and light mode, and may suggest changes in the pull request.
6. Once it is merged into `main`, the theme is offered in the BizPlug portal to every business within about ten minutes, with no release needed, and it is listed on this page after the next update. Removing the file removes it from the portal: a business that picked it gets its standard look again.

Not on GitHub, or prefer not to open a pull request? Use the [Propose a card theme](https://github.com/msg2ai/bizplug-plugins/issues/new?template=card-theme.yml) form instead, with the JSON and the check's output, and the team adds the file for you.

Everything else in this repository is generated from the BizPlug website, so a theme's pull request changes nothing outside `themes/<id>.json`. Plug-ins and menu layouts are contributed by pull request too, in `community/`: see [Contribute](README.md#contribute-plug-ins-themes-and-layouts).

Questions: info@bizplug.ai.

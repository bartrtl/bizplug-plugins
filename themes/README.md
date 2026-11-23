# Card themes

A card theme is five colours for a plug-in's card in ChatGPT. A business picks one in the BizPlug portal. [THEMES.md](../THEMES.md) shows every theme with its colours, explains each colour and lists the rules a theme must meet.

## What is in this folder

| File | Theme | By |
| --- | --- | --- |
| [`ocean.json`](ocean.json) | Ocean | BizPlug |
| [`sunset.json`](sunset.json) | Sunset | BizPlug |
| [`forest.json`](forest.json) | Forest | BizPlug |
| [`orchid.json`](orchid.json) | Orchid | BizPlug |
| [`belgium.json`](belgium.json) | Belgium | Bart Cant - Rethink Labs |
| [`christmas.json`](christmas.json) | Christmas | Bart Cant - Rethink Labs |
| [`jamaica.json`](jamaica.json) | Jamaica | Bart Cant - Rethink Labs |
| [`mexico.json`](mexico.json) | Mexico | Bart Cant - Rethink Labs |
| [`noir-gold.json`](noir-gold.json) | Noir Gold | Bart Cant |
| [`qatar.json`](qatar.json) | Qatar | Bart Cant - Rethink Labs |
| [`usa.json`](usa.json) | USA | Bart Cant - Rethink Labs |

`check-theme.ts` checks a theme the way BizPlug does: valid colours, a unique id, and readable contrast. `preview.ts` draws it on the real card with the sample businesses.

```json
{
  "id": "harbour",
  "name": "Harbour",
  "description": "Sea blue to sand on dark slate. Calm and clear: marinas, seafood restaurants and coastal stays.",
  "author": "Your name or company",
  "colors": { "a1": "#7dd3fc", "a2": "#fcd9a8", "ink": "#0b1620", "bg": "#0d1a24", "glow": "rgba(125,211,252,.14)" }
}
```

## Add a theme with a pull request

1. Fork https://github.com/msg2ai/bizplug-plugins and create a branch.
2. Add `themes/<id>.json`, named after its `id`. Copy a file from this folder to start.
3. From the root of your copy: `npx tsx themes/check-theme.ts themes/<id>.json`. Fix what it reports.
   Then `npx tsx themes/preview.ts themes/<id>.json` draws the sample businesses' cards in your colours, in dark and light mode: open the pages it prints and take a screenshot.
4. Open a pull request against `main` that adds only that file, and fill in its checklist. The **Check card themes** workflow runs the same check, and fails if the pull request changes anything outside `themes/`.
5. The BizPlug team looks at it on real cards, in dark and light mode, and may ask for changes in the pull request.
6. Once merged, the file stays here credited to you, and the theme is offered to every business in the portal within about ten minutes, with no release needed.

Not on GitHub? Use the [Propose a card theme](https://github.com/msg2ai/bizplug-plugins/issues/new?template=card-theme.yml) form, and the team adds the file for you.

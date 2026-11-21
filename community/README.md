# Community contributions

Plug-ins and menu layouts that collaborators added to this repository with a pull request. Everything in `community/` is kept as its authors wrote it: the release that rewrites the rest of the repository never changes it. Card themes are contributed in [`themes/`](../themes) instead.

## Plug-ins: `community/plugins/<name>/`

None yet: yours can be the first.

A plug-in package has the same layout as the ones in [`plugins/`](../plugins): at least `plugin.json`, `mcp.json` and `README.md`, and `data/` only if a business must provide data. [CONTRIBUTING.md](../CONTRIBUTING.md) says what each file must contain.

## Menu layouts: `community/layouts/<id>/`

None yet: yours can be the first.

A layout has `layout.json`, `layout.js`, `layout.css`, `preview-desktop.png` and `preview-mobile.png`. Start from [`layouts/_template/`](../layouts/_template), and see [LAYOUTS.md](../LAYOUTS.md) for what `render(ctx)` gets and the rules.

## Add yours

1. Fork https://github.com/msg2ai/bizplug-plugins and create a branch, for example `theme/harbour`, `layout/magazine` or `plugin/acme-bookings`.
2. Add only the files of your contribution, in the folder the table names. Everything else is generated from the BizPlug website on every release (the packages in `plugins/`, `layouts/`, `source/` and the pages at the top), so a change there would be overwritten; the checks fail a pull request that changes it.
3. Run the check for your kind of contribution and fix what it reports.
4. Open a pull request against `main`. Its description starts with a checklist ([`.github/pull_request_template.md`](../.github/pull_request_template.md)): keep the part for your kind of contribution, paste the check's output, and add a screenshot.
5. The checks run on the pull request, and the BizPlug team reviews it: on real cards, in dark and light mode, for a theme or a layout, and in ChatGPT for a plug-in. Changes are asked for in the pull request.
6. Once approved, it is merged into `main` and stays in this repository, credited to you, through every release.

What merging does and does not do: your work is published here for anyone to read and use. A layout is offered to businesses in the BizPlug portal once the team adds it in BizPlug's admin, and a plug-in is listed in the BizPlug marketplace once its listing (who hosts it, its privacy policy and terms) is agreed with you.

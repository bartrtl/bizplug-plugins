<!-- Thank you for contributing. Keep the section for your kind of contribution and delete the others. -->

- [ ] My contribution is my own work, and I agree it is published under this repository's [MIT License](https://github.com/msg2ai/bizplug-plugins/blob/main/LICENSE)

## What this adds

<!-- One or two sentences: the plug-in, theme, layout or industry, and who it is for. -->

## Card theme: `themes/<id>.json`

- [ ] Only `themes/<id>.json` is added or changed, and the file name matches its `id`
- [ ] `npx tsx themes/check-theme.ts themes/<id>.json` passes (output below)
- [ ] Previewed with `npx tsx themes/preview.ts themes/<id>.json`, dark and light (screenshot below)
- [ ] The colours are my own work, not another company's brand colours used without permission
- [ ] BizPlug may offer this theme to every business, credited to the `author` in the file

## Menu layout: `community/layouts/<id>/`

- [ ] Only `community/layouts/<id>/` is added: `layout.json`, `layout.js`, `layout.css`, `preview-desktop.png`, `preview-mobile.png`
- [ ] `npx tsx layouts/check-layout.ts community/layouts/<id>` passes (output below)
- [ ] Previewed with `npx tsx layouts/preview.ts community/layouts/<id>` at 680 and 390 px, dark and light
- [ ] The layout is my own work, and BizPlug may offer it to every business, credited to me

## New industry: `community/industries/<slug>.json`

- [ ] Only `community/industries/<slug>.json` is added, and the file name matches its `slug`
- [ ] `npx tsx industries/check-industry.ts community/industries/<slug>.json` passes (output below)
- [ ] I tried the preview from the bot's comment, in ChatGPT or with `npx tsx industries/test-industry.ts <this pull request's number>`
- [ ] The industry is not already in [INDUSTRIES.md](https://github.com/msg2ai/bizplug-plugins/blob/main/INDUSTRIES.md), and no existing industry fits it: a business that fits one uses that industry's plug-in under its own name
- The closest existing industry, and what a customer does in mine that it cannot: <!-- e.g. Fitness & Gyms (fitness): ... -->
- [ ] Everything the file says is true of the plug-in (it answers from the business's profile and sends requests the business confirms)
- [ ] If the file has `collections` or `forms`: the sample rows are made up, a list holds things and not people's details, and I tried each one in the preview
- [ ] I understand that merging publishes this industry on BizPlug, and BizPlug may publish it

## Plug-in: `community/plugins/<name>/`

- [ ] Only `community/plugins/<name>/` is added, with `plugin.json`, `mcp.json` and `README.md` ([CONTRIBUTING.md](https://github.com/msg2ai/bizplug-plugins/blob/main/CONTRIBUTING.md))
- [ ] It works in ChatGPT developer mode with the URL in `mcp.json`
- [ ] `plugin.json` links a privacy policy and terms of service, and has review test cases, one of which must not call a tool
- [ ] No secrets (API keys, tokens) are in the package
- Hosting: <!-- my own endpoint, or hosted by BizPlug -->
- Website and contact: <!-- -->
- [ ] I understand that once merged it is listed in the BizPlug marketplace, with its name, descriptions, author, links and server address

## Check output

```
<!-- paste the output of the check here -->
```

## Screenshot

<!-- The card with your theme or layout, or your plug-in answering in ChatGPT. Not needed for an industry file. -->

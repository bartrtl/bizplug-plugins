---
name: build-a-bizplug-plugin
description: Build a business's BizPlug plug-in for ChatGPT and Claude from the business's own website, with the BizPlug CLI (@bizplug/cli). Use when someone wants a plug-in for their business, asks to set up or update its BizPlug data, or names an industry plug-in and a business. Gathers the data from the business's own pages, writes the files the industry's plug-in needs, sends them to the person's BizPlug account and checks them, and asks before anything is deployed.
---

# Build a BizPlug plug-in from a business's website

A BizPlug plug-in is a ChatGPT and Claude app for one business, built from the business's own data: what it offers, its prices, hours and questions. Each industry has a standard plug-in, and each needs a few CSV files. This skill fills them in from the business's own website and sends them with the BizPlug CLI. Nothing goes live until the person asks BizPlug for a deploy and the BizPlug team publishes it.

Run the CLI as `npx @bizplug/cli <command>` (written `bizplug` below), or install it once with `npm install -g @bizplug/cli`. It needs Node.js 18 or later.

## Rules

- **Only the business's own sources.** Use its website, files the person gives you, and what the person tells you. Never a directory site, a review site, another business, or a guess.
- **Never invent anything.** That covers prices, hours, capacities, availability, phone numbers, email addresses, awards, numbers and testimonials. When the site does not say, leave the cell empty and add it to your questions for the person.
- **Keep sensitive data out.** No passwords, API keys, card or bank numbers, government ID numbers, and no customer's personal data. Contact details are the business's published ones only.
- **Use the business's own words and images.** Write summaries in its words, without new claims. Use only images on its own site.
- **Ask before anything that reaches someone.** `bizplug request` sends a deploy request to the BizPlug team, so ask first, per plug-in. Never run `bizplug publish`, and never request production without a clear yes.
- **Never enter a password, an API key or a sign-in code yourself.** The person approves the sign-in.

## Steps

1. **Sign in.** Run `bizplug whoami`. If it is not signed in, run `bizplug login`. It shows a code and a link: ask the person to open the link, check the code, and press **Approve** in the BizPlug portal. They need a BizPlug account (https://www.bizplug.ai/portal).

2. **Pick the industry.** Run `bizplug industries` and choose the one that fits the business best. Each line names the files its plug-in needs. If two fit, or none does, ask the person. Use an existing industry under the business's own name, not a new one.

3. **Read what the industry needs.** In the public repository (https://github.com/msg2ai/bizplug-plugins), open these files for that industry:
   - `plugins/<industry>/data/AGENT_INSTRUCTIONS.md` lists every file, its columns in order, which ones are required, an example, and how to collect each.
   - `data/requirements.json` holds the same, as data.
   - `data/templates/<file>.csv` is a template per file.

   Follow these exactly: same column names, same order, same formats (numbers without a currency sign, `true` or `false`, https addresses, ids that are short, lowercase and unique).

4. **Gather from the business's site.** Read its pages: home, about, services or menu, prices, hours, contact and FAQ. Note the page each fact came from.
   - **Logo:** use the site's own logo image (the header logo, or its `og:image`), as an https address. Open it and check it is the logo and reads on a white background. If not, say so and ask for another.
   - **Gaps:** what the site does not say goes on your list of questions, not into a file. That includes the inbox where requests should go (`notify_email`).

5. **Write the files.** Put them in a folder for the business, one CSV per dataset, with the first row exactly the column names. Write UTF-8, and quote any value that holds a comma. Then check every file against `requirements.json`:
   - required columns filled;
   - ids unique;
   - numbers and dates in the stated format;
   - the row limits respected.

6. **Show it and ask.** Show the person:
   - each file's rows;
   - the page each value came from;
   - your questions for the business.

   Ask before sending. A yes covers the files you showed.

7. **Send it.**
   - **New plug-in** (`bizplug plugins` does not list it): create it from a small profile. Write `<business>.json` with these keys:
     - `industry` and `slug` (the business's short name: lowercase letters, digits and hyphens);
     - `name`, `tagline`, `summary`, `email`, `website`, `logo`;
     - when known: `phone`, `address`, `city`, `region`, `hours`, `currency`.

     Then run `bizplug push <business>.json`. This adds the plug-in to the account and sends business.csv. Push then reports the industry's other required files as missing, and ends with an error. That is expected: you send them next.
   - **Each CSV file:** `bizplug upload <industry>/<slug> <dataset> <file.csv>`. The dataset is its `id` in `requirements.json` or its file name, for example `catalog` or `catalog.csv`. Each upload is checked as in the portal.
   - **An existing plug-in:** upload only the files that changed. A new upload becomes that file's latest version. Nothing changes in ChatGPT until the plug-in is published again.

8. **Check it.** Run `bizplug status <industry>/<slug>` (add `--json` to read it as data).
   - Every required file should show as accepted.
   - For a rejected file, read its errors, fix the file, show the person what changed, and upload it again.
   - Warnings and review notes never block. Fix what is wrong, and tell the person why you left the rest.

9. **Ask about the deploy.** Ask the person before you run `bizplug request <industry>/<slug> test`. This tells the BizPlug team, who publish the plug-in to the test address and email the person. Production comes later, with `bizplug request <industry>/<slug> prod`, once they have tried it in ChatGPT or Claude.

10. **Report.** Give the person:
    - the files sent and accepted;
    - what is still missing, and the questions only the business can answer;
    - the next step: the test deploy, or the answers you are waiting for;
    - the plug-in's page in the portal, shown by `bizplug status`.

## After it is live

These apply to test and production at once, with no deploy:
- `bizplug card <plugin> --theme <id>` or `--colors <main>,<second>,<background>`, and `--banner <https address>`: how the card looks.
- `bizplug integrations <plugin>`: where requests go (email, Slack, a webhook and more), and the customer buttons (WhatsApp, booking and payment pages, reviews). `set`, `remove` and `test` act on one at a time. A secret is passed as `-` and read from stdin.

Run `bizplug --help` for every command. The full guide is https://www.bizplug.ai/how-to/developers/bizplug-cli.

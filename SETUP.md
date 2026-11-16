# Set up, configure and test a BizPlug plug-in

This page covers the three steps in order. The examples use the Coffee Shops & Cafes plug-in (`plugins/coffee-shops`); every other industry works the same way with its own tool names and files. This page is generated with the rest of the repository, so please do not edit it by hand.

- [Setup](#setup): add a plug-in to ChatGPT
- [Configuration](#configuration): give a plug-in your business's own data
- [Testing](#testing): check it before customers use it

## Setup

A plug-in is an MCP server hosted by BizPlug. There is nothing to install or run: you give ChatGPT the plug-in's address.

1. In ChatGPT, open Settings, then Apps & Connectors, and turn on developer mode.
2. Create a connector. Paste the plug-in's MCP server URL, for example `https://mcp.bizplug.ai/plugin/coffee-shops`. Every URL is in the [README](README.md) and in each package's `mcp.json`. No sign-in is needed.
3. Start a new chat, pick the connector and ask "What can this plug-in do?" It answers with its menu.

There are two kinds of address:

| Address | What it serves |
| --- | --- |
| `https://mcp.bizplug.ai/plugin/<industry>` | Every business in that industry. The assistant asks which business you mean. |
| `https://mcp.bizplug.ai/plugin/<industry>/<business>` | One business, with its own data. This is the address a business gives its customers. |

## Configuration

A plug-in answers only from what the business has published. Configuring it means providing that data. Each package lists exactly what is needed:

- `plugins/<industry>/data/requirements.json`: the datasets and their columns, with which are required.
- `plugins/<industry>/data/templates/*.csv`: one CSV template per dataset, with an example row.
- `plugins/<industry>/data/AGENT_INSTRUCTIONS.md`: step-by-step instructions for a person or an AI agent collecting the data, including what must never be uploaded (secrets, card or ID numbers, customers' personal data).

### 1. Add the plug-in to your account

Sign up at https://bizplug.ai/portal, save your business profile and add your industry's plug-in from the marketplace.

### 2. Provide the data

Either upload each CSV file under its dataset on the plug-in's page in the portal, or send it through the data API:

1. Create an API key at https://bizplug.ai/portal/api.
2. List your plug-ins and their ids: `GET https://bizplug.ai/api/portal/v1/plugins` with the header `Authorization: Bearer <key>`.
3. Send each file: `PUT https://bizplug.ai/api/portal/v1/plugins/<plugin-id>/datasets/<file name>` with `Content-Type: text/csv` and the file as the body, or `Content-Type: application/json` and `{"rows": [{...}]}` keyed by the column names.

Both ways check the file against its dataset and list every error. Fix them and send the file again until it is accepted.

### 3. Choose what to bundle

On the plug-in's page you can tick what you want bundled with it, such as where requests are sent and which systems it connects to. Each option says whether it is included, set up with you, or a custom integration that is quoted separately before anything is built. Your choice goes to the BizPlug team with your deploy request.

### 4. Request a deploy

1. When the required files are accepted, press Request test deploy. BizPlug publishes the plug-in to a test address, `https://mcp-test.bizplug.ai/plugin/<industry>/<business>`, and emails you.
2. Test it (see [Testing](#testing)).
3. Press Request production. The plug-in then answers at `https://mcp.bizplug.ai/plugin/<industry>/<business>`. The plug-in is $24.99 a month or $199 a year; plan details are confirmed with you before any payment.

Files you upload after a deploy do not go live by themselves: request a deploy again to publish them. Each deploy request also runs an automated review of the files, which flags problems for the team to look at.

### Versions

A published plug-in keeps the version it was published with until you press Upgrade on its page: on test first, then on production. Upgrading changes how the plug-in behaves, never your data.

| Version | Date | What changed |
| --- | --- | --- |
| 0.1.0 | 2026-11-15 | The plug-in's tools for your industry, questions answered from your own information, and a text menu of what it can do. |
| 0.2.0 | 2026-11-16 | A menu card in ChatGPT: your customers see a button for each thing they can do. Each button opens a short form (dates and party size, an item, a reference, a question or a request), so customers tap and fill in instead of typing everything. |
| 0.3.0 | 2026-11-16 | Results show inside the card: prices, availability, open times, estimates and statuses, instead of only as text in the chat. Customers can go from a result straight to a request in the card: pick an option or a time, add their name and email, and send. |
| 0.4.0 | 2026-11-16 | Customers browse by tapping: your own categories and services, and shortcuts for dates and party size, appear as buttons on each form. A list can be searched and filtered by category in the card, and each item or option opens on its own screen, with Back to return. Your published questions and answers show in the card, so common questions are answered with one tap. Other questions still go to the chat. |

## Testing

### In ChatGPT

Add the test address as a connector (see [Setup](#setup)) and try the plug-in as a customer would. Each package carries its own test cases in `plugin.json`, under `extensions["com.openai"].review.test_cases`: a prompt, what should happen, and whether a tool should be called at all. For Coffee Shops & Cafes:

| Prompt | Expected |
| --- | --- |
| What can this plug-in do? | Calls show_menu, which shows the menu card; does not list the options again, or lists them exactly as returned where there is no card. |
| Mobile order-ahead for pickup | Calls get_menu and answers from the published profile. |
| What time do you open, and do you have oat milk? | Answers from the business profile, or says it is not covered and offers contact details. |
| Go ahead and send it. | Calls place_pickup_order only after the customer has confirmed the details, and reports that the business still has to confirm. |
| Write me a poem about the ocean. | Does not call any tool. |

Beyond those, check your own data:

- **Look-up** (`get_menu`): every item, price, date or time shown matches what you uploaded, and nothing is shown that you did not upload.
- **Request** (`place_pickup_order`): the assistant asks the customer to confirm the details before it sends anything, and says the business still has to confirm.
- **Status** (`get_order_status`): a reference you have published a status for is found. For any other reference, including a request you have just sent, the plug-in says there is no published status and that the business replies by email.
- **Questions**: answers come from your FAQ file and business details. For anything they do not cover, the plug-in says so and offers your contact details instead of guessing.
- **Contact details** (`get_business_info`, `get_contact`): name, hours, phone, email and address are right.

### Without ChatGPT

The server speaks MCP over streamable HTTP, so any MCP client can connect to the same URL. To see a plug-in's tools from a terminal:

```bash
curl -s -X POST https://mcp.bizplug.ai/plugin/coffee-shops \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

The response lists the six tools with their descriptions and input schemas.

### If something is wrong

- **Wrong or missing information:** correct the CSV file, upload it again and request a new test deploy.
- **Anything else:** write to info@bizplug.ai with the plug-in's address and the question you asked.

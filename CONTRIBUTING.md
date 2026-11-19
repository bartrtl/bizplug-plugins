# Submit a plug-in to the BizPlug marketplace

BizPlug lists plug-ins (MCP servers) that work next to the BizPlug industry plug-ins in ChatGPT. This page explains how to submit one and what it must contain to be valid. It is generated with the rest of the repository, so please do not edit it by hand.

## How to submit

This repository is generated from the BizPlug website on every release, so a pull request that adds a folder under `plugins/` would be overwritten. Submit through the website instead:

1. Build your plug-in with the components below, and check it in ChatGPT developer mode (see [SETUP.md](SETUP.md#setup)).
2. Fill in the submission form at https://bizplug.ai/marketplace#submit: the tool's name and website, your MCP server URL or repository, whether you host it or BizPlug should, the industries it is for, and what it does.
3. We review the tools, descriptions and data handling with you, and agree the terms of the listing before anything goes live.
4. Once accepted, your plug-in is either hosted by BizPlug or connected from your own endpoint, so it works next to the industry plug-ins.

Questions: info@bizplug.ai.

## What a valid plug-in contains

A plug-in is a folder with the same layout as the packages in `plugins/`. Use [`plugins/coffee-shops`](plugins/coffee-shops) as a working example.

```
<your-plugin>/
  plugin.json        required: who it is from, what it does, and how it is reviewed
  mcp.json           required: where the MCP server lives and how it authenticates
  README.md          required: what the plug-in does and each of its tools
  data/              only if a business must provide data for the plug-in to work
    requirements.json        the datasets, column by column
    templates/*.csv          a CSV template per dataset, with an example row
    AGENT_INSTRUCTIONS.md    how a person or an AI agent collects and submits that data
```

### 1. The MCP server

- Speaks MCP over **streamable HTTP**, at a stable **https** address.
- Each tool has a clear name, a one-sentence description of what it does, and an input schema that lists every input and says which are required. The assistant chooses tools from these descriptions alone.
- Tools that only read are marked read-only; tools that send something on the user's behalf say so in their description.
- Answers come from the data the plug-in is given. When something is not covered, the tool says so instead of guessing.

### 2. `mcp.json`

Follows `https://agent-plugins.org/schemas/1.0.0/mcp.schema.json`: one entry under `mcpServers` with `"type": "streamable-http"`, the server's `url`, and its authentication under `extensions["com.openai"].auth` (`{ "type": "none" }` when no sign-in is needed).

### 3. `plugin.json`

Follows `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`. These fields are required for a listing:

| Field | What it holds |
| --- | --- |
| `name`, `version` | A unique lowercase name and a semantic version |
| `description` | What the plug-in does and who provides it, in plain sentences |
| `author.name` | The company or person responsible for the plug-in |
| `mcpServers` | `"./mcp.json"` |
| `extensions["com.openai"].interface` | `displayName`, `shortDescription`, `longDescription`, `defaultPrompt` (starter prompts), `category`, and `websiteURL`, `privacyPolicyURL` and `termsOfServiceURL`, all https |
| `extensions["com.openai"].review` | `commerce` (true if it sells anything) and `test_cases`: prompts with the expected behaviour and `shouldTrigger`, including at least one prompt that must **not** call a tool |

### 4. Data handling

- A privacy policy and terms of service that describe what the plug-in reads, stores and sends.
- It never asks for card numbers, bank details, passwords or government ID numbers in the chat. Payments, if any, go through a payment provider's own checkout.
- Secrets (API keys, tokens) are never in the package. A server that needs them keeps them in its own environment.
- It only shares information the business or the user has provided for that purpose.

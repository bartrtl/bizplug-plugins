// Tests an industry plug-in the way ChatGPT uses it: the tool list, the menu, the look-up, a request, its status,
// a request with nothing filled in, and the business's information and contact details. Copied as it is to
// industries/test-industry.ts in the public plug-in repository (github.com/msg2ai/bizplug-plugins) by
// scripts/export-plugins.ts; it imports nothing, so it runs there on its own with Node 18 or later.
//
//   npx tsx industries/test-industry.ts <pull request number>     a proposed industry, previewed on mcp-test
//   npx tsx industries/test-industry.ts --plugin <url>            any plug-in, e.g. an industry's sample business
//   options: --host <base> (default https://mcp-test.bizplug.ai), --engine <order|stay|appt|quote|track>, --json
//
// It sends a request only to a sample business (one that marks its answers as sample data and never sends
// anything). For any other plug-in it skips the request steps, so a test can never reach a real business.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSON from the plug-in, read field by field
type Json = Record<string, any>;
type Check = { step: string; ok: boolean | null; detail: string };

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const asJson = args.includes("--json");
const host = (flag("--host") ?? "https://mcp-test.bizplug.ai").replace(/\/+$/, "");
const pr = args.find((a) => /^\d+$/.test(a));
const ENGINES = ["order", "stay", "appt", "quote", "track"];
const COMMON = ["show_menu", "get_business_info", "get_contact"];

function usage(message?: string): never {
  if (message) console.error(message);
  console.error("usage: npx tsx industries/test-industry.ts <pull request number> | --plugin <url> [--engine <engine>] [--host <base>] [--json]");
  process.exit(2);
}

const day = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);
const textOf = (r: Json) => String(r?.content?.[0]?.text ?? "");
const refOf = (s: string) => s.match(/BP-[A-Z0-9]{6}/)?.[0] ?? null;

let rpcId = 0;
async function rpc(url: string, method: string, params?: Json): Promise<Json> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++rpcId, method, ...(params ? { params } : {}) }),
    signal: AbortSignal.timeout(30_000),
  });
  const body = (await res.json().catch(() => null)) as Json | null;
  if (!body) throw new Error(`${method}: HTTP ${res.status}, not JSON`);
  if (body.error) throw new Error(body.error.message ?? JSON.stringify(body.error));
  return body.result;
}
const call = (url: string, name: string, a: Json = {}) => rpc(url, "tools/call", { name, arguments: a });

async function main() {
  let url: string;
  let engine = flag("--engine");
  let expected: string[] | null = null;
  let sampleItem: string | null = null;
  let sampleRef: string | null = null;
  let label: string;

  if (pr) {
    // A proposal: GET says what the preview offers.
    url = `${host}/plugin/proposal/${pr}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    const info = (await res.json().catch(() => null)) as Json | null;
    if (!res.ok || !info) usage(`The preview of pull request #${pr} is not available: ${info?.error ?? `HTTP ${res.status}`}`);
    engine = info!.proposal.engine;
    const t = info!.proposal.tools;
    expected = [t.lookup, t.request, t.status];
    sampleItem = info!.sample?.firstItem?.id ?? null;
    sampleRef = info!.sample?.reference ?? null;
    label = `${info!.proposal.name} (pull request #${pr})`;
  } else {
    url = flag("--plugin") ?? usage();
    label = url;
  }

  const checks: Check[] = [];
  const check = (step: string, ok: boolean | null, detail: string) => checks.push({ step, ok, detail });

  // 1. The tool list.
  const list = await rpc(url, "tools/list");
  const tools = (list.tools ?? []) as Json[];
  const names = tools.map((t) => String(t.name));
  // Without a proposal the engine's three tools are the ones after show_menu, in order.
  const three = expected ?? names.filter((n) => !COMMON.includes(n)).slice(0, 3);
  const [lookup, request, status] = three;
  const missing = [...COMMON, ...three].filter((n) => !names.includes(n));
  check("tools/list", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : names.join(", "));
  const bad = tools.filter((t) => t.inputSchema?.type !== "object" || typeof t.description !== "string" || !t.description);
  check("tool definitions", bad.length === 0, bad.length ? `no object input schema or description: ${bad.map((t) => t.name).join(", ")}` : "every tool has a description and an object input schema");
  const req = tools.find((t) => t.name === request);
  check("request tool annotation", req ? req.annotations?.readOnlyHint === false : null, req ? `readOnlyHint ${req.annotations?.readOnlyHint}` : "no request tool");

  // 2. The menu, and whether this is a sample business.
  const menu = await call(url, "show_menu");
  check("show_menu", !menu.isError && textOf(menu).length > 0, textOf(menu).split("\n")[0].slice(0, 100));
  engine = engine ?? menu.structuredContent?.plugin?.engine;
  if (!engine || !ENGINES.includes(engine)) usage("Could not tell the engine: add --engine <order|stay|appt|quote|track>.");

  // 3. The look-up, and what to request from it.
  let la: Json = {};
  if (engine === "stay") la = { start: day(10), end: day(12) };
  if (engine === "track") la = { reference: sampleRef ?? "BP-TEST00" };
  const look = await call(url, lookup, la);
  const sc = look.structuredContent ?? {};
  const sample = sc.plugin?.sample === true || menu.structuredContent?.plugin?.sample === true || textOf(look).startsWith("[SAMPLE DATA");
  check(`${lookup} (look-up)`, !look.isError, textOf(look).replace(/^\[SAMPLE DATA[^\]]*\]\s*/, "").split("\n")[0].slice(0, 100));

  let ra: Json | null = null;
  const who = { name: "Test Contributor", email: "test@example.com" };
  if (engine === "order") {
    const id = sampleItem ?? sc.catalog?.items?.[0]?.id;
    if (sampleItem) check("example item first", sc.catalog?.items?.[0]?.id === sampleItem, `first item: ${sc.catalog?.items?.[0]?.name ?? "none"}`);
    if (id) ra = { items: [{ id, quantity: 1 }], fulfilment: "pickup", ...who };
  } else if (engine === "stay") {
    const id = sc.availability?.options?.[0]?.id ?? sampleItem;
    if (id) ra = { option: id, start: day(10), end: day(12), ...who };
  } else if (engine === "appt") {
    const s = sc.slots ?? {};
    const id = sampleItem ?? s.service?.id ?? s.services?.[0]?.id;
    if (sampleItem) check("example item first", s.services?.[0]?.id === sampleItem, `first service: ${s.services?.[0]?.name ?? "none"}`);
    if (id && s.date && s.times?.[0]) ra = { service: id, date: s.date, time: s.times[0], ...who };
  } else if (engine === "quote") {
    const id = sampleItem ?? sc.estimate?.rules?.[0]?.id;
    if (sampleItem) check("example item first", sc.estimate?.rules?.[0]?.id === sampleItem, `first service: ${sc.estimate?.rules?.[0]?.name ?? "none"}`);
    if (id) ra = { service: id, ...who };
  } else {
    ra = { topic: "Test", message: "A test request from the BizPlug industry test.", ...who };
  }

  // 4. A request and its status: only on a sample business, which never sends anything.
  if (!sample) {
    check(`${request} (request)`, null, "skipped: not a sample business, so no request is sent");
    check(`${status} (status)`, null, "skipped");
  } else if (!ra) {
    check(`${request} (request)`, false, "the look-up returned nothing to request");
  } else {
    const sent = await call(url, request, ra);
    const ref = refOf(textOf(sent));
    check(`${request} (request)`, !sent.isError && Boolean(ref), sent.isError ? textOf(sent).slice(0, 120) : `reference ${ref}; ${/nothing was sent/i.test(textOf(sent)) ? "sample: nothing was sent" : "sent"}`);
    if (ref) {
      const st = await call(url, status, { reference: ref });
      check(`${status} (status)`, !st.isError && textOf(st).includes(ref), textOf(st).replace(/^\[SAMPLE DATA[^\]]*\]\s*/, "").split("\n")[0].slice(0, 100));
    } else check(`${status} (status)`, null, "skipped: no reference");
    const empty = await call(url, request, {});
    check(`${request} with nothing filled in`, empty.isError === true, empty.isError ? `refused: ${textOf(empty).slice(0, 90)}` : "accepted an empty request");
  }

  // 5. The business's information and contact details.
  const info = await call(url, "get_business_info", { question: "What are your opening hours?" });
  check("get_business_info", !info.isError, textOf(info).replace(/^\[SAMPLE DATA[^\]]*\]\s*/, "").split("\n")[0].slice(0, 100));
  const contact = await call(url, "get_contact");
  check("get_contact", !contact.isError, textOf(contact).replace(/^\[SAMPLE DATA[^\]]*\]\s*/, "").split("\n")[0].slice(0, 100));

  const failed = checks.filter((c) => c.ok === false).length;
  if (asJson) console.log(JSON.stringify({ plugin: label, url, engine, sample, passed: failed === 0, checks }, null, 2));
  else {
    console.log(`${label}\n${url} · engine ${engine}${sample ? " · sample business" : ""}\n`);
    for (const c of checks) console.log(`${c.ok === true ? "✓" : c.ok === false ? "✗" : "–"} ${c.step}: ${c.detail}`);
    console.log(failed ? `\n${failed} check${failed === 1 ? "" : "s"} failed.` : "\nAll checks passed.");
  }
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(`✗ ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});

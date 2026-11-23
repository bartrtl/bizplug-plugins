/**
 * Ready-made colour themes for a plug-in's ChatGPT card (widgets/plugin-widget.ts). A client picks one when
 * adding a plug-in in the portal, or later on the plug-in's page; a profile file may name one in `cardTheme`.
 * "Business colours" (DEFAULT_CARD_THEME) means the business's own `theme` from its profile, or the neutral
 * palette when it has none.
 *
 * A theme only sets the five colours the card already reads (`plugin.theme` in cardInfo, plugin-mcp.ts), so
 * picking one changes no behaviour and works on every plug-in version. The industry-wide plug-ins keep
 * BizPlug's colours.
 *
 * Published in the public plug-in repository (source/card-themes.ts, themes/<id>.json and THEMES.md, written
 * by scripts/export-plugins.ts), where others can propose a theme. Keep this file pure data: no imports of
 * server code. A new theme must pass themeProblems(); `pnpm plugins:check` checks every theme here.
 */

/** The colours the card reads. a1 → a2 is the accent gradient, ink the text and icons on it, bg the dark background, glow a soft rgba of the accent. */
export type CardThemeColors = { a1: string; a2: string; ink: string; bg: string; glow: string };

/**
 * Decorations a theme may add around the card's content: a band above it, a thin divider under the business's
 * name, a band below it, and up to three stickers in the top corner. They are named shapes and colours that the
 * card draws itself (widgets/plugin-widget.ts, `decorBand`, `decorStickers`): a theme carries no code, no CSS and
 * no image. A sticker is one of the named shapes, or its own outline as SVG path data on a 24 by 24 grid, drawn in
 * one colour. Motion is one of the named ones and stops for people who turn motion off on their device.
 */
export const DECOR_PATTERNS = ["stripes", "lines", "serrated", "dots", "slant"] as const;
/** A named look for the card's own shapes: `sport` slants the tabs and tags and sets titles in upper-case italics. */
export const DECOR_STYLES = ["sport"] as const;
export const DECOR_BAND_MOTIONS = ["shimmer", "twinkle"] as const;
export const DECOR_SHAPES = ["star", "heart", "diamond", "circle", "leaf", "sun"] as const;
export const DECOR_STICKER_MOTIONS = ["twinkle", "float", "spin", "flow", "walk"] as const;
export type DecorBand = { pattern: (typeof DECOR_PATTERNS)[number]; colors: string[]; motion?: (typeof DECOR_BAND_MOTIONS)[number] };
export type DecorSticker = {
  /** One of the named shapes, or `path` instead. */
  shape?: (typeof DECOR_SHAPES)[number];
  /** The sticker's own outline: SVG path data on a 24 by 24 grid (letters, digits, spaces, commas, dots and minus only). */
  path?: string;
  color: string;
  /** Draw the outline as a line instead of filling it. `flow` moves along such a line; `walk` crosses the top of the card. */
  line?: boolean;
  /** Draw it larger, for a sticker with detail. */
  large?: boolean;
  motion?: (typeof DECOR_STICKER_MOTIONS)[number];
};
export type CardDecor = { header?: DecorBand; divider?: DecorBand; footer?: DecorBand; stickers?: DecorSticker[]; style?: (typeof DECOR_STYLES)[number] };

export type CardTheme = {
  /** Lower-case letters and hyphens. Stored on the client's plug-in, so never rename one. */
  id: string;
  name: string;
  /** One sentence: the look, and the kind of business it suits. */
  description: string;
  /** Who made it: "BizPlug", or the person or company that proposed it in the public repository. */
  author: string;
  /** Optional: the author's own https link (site or profile); the credit links to it. */
  authorUrl?: string;
  /** Optional: the author's GitHub username, shown with the credit. */
  github?: string;
  colors: CardThemeColors;
  /** Optional decorations around the card's content (CardDecor). */
  decor?: CardDecor;
};

/** Where others read how to propose a theme (THEMES.md in the public plug-in repository). */
export const THEMES_URL = "https://github.com/msg2ai/bizplug-plugins/blob/main/THEMES.md";

/** The choice that keeps the business's own colours (or the neutral palette). Not a theme of its own. */
export const DEFAULT_CARD_THEME = "business";

/** The neutral palette a business's card uses when it has no colours of its own (the card's CSS defaults). */
export const NEUTRAL_COLORS: CardThemeColors = { a1: "#e8ebf3", a2: "#b9c2d8", ink: "#0f1320", bg: "#0f1320", glow: "rgba(185,194,216,.12)" };

export const CARD_THEMES: CardTheme[] = [
  {
    id: "ocean",
    name: "Ocean",
    description: "Cyan to blue on deep navy. Calm and clear: travel, wellness, marine and professional services.",
    author: "BizPlug",
    colors: { a1: "#67e8f9", a2: "#60a5fa", ink: "#06121f", bg: "#071a2b", glow: "rgba(103,232,249,.14)" },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Amber to coral on a warm dark plum. Friendly and lively: restaurants, cafés, bakeries and events.",
    author: "BizPlug",
    colors: { a1: "#fcd34d", a2: "#fb7185", ink: "#1f0f14", bg: "#1c1016", glow: "rgba(251,113,133,.14)" },
  },
  {
    id: "forest",
    name: "Forest",
    description: "Leaf green to teal on dark pine. Fresh and natural: gardens, outdoor, health and sustainable brands.",
    author: "BizPlug",
    colors: { a1: "#86efac", a2: "#2dd4bf", ink: "#052e1f", bg: "#0b1a14", glow: "rgba(134,239,172,.12)" },
  },
  {
    id: "orchid",
    name: "Orchid",
    description: "Pink to violet on deep indigo. Bold and stylish: beauty, fashion, nightlife and creative studios.",
    author: "BizPlug",
    colors: { a1: "#f0abfc", a2: "#a78bfa", ink: "#1a1030", bg: "#140f24", glow: "rgba(240,171,252,.14)" },
  },
];

/** The shape of a theme id, built-in or from the public repository's themes/ (card-themes-remote.ts). */
export const THEME_ID = /^[a-z][a-z-]{1,23}$/;

export const getCardTheme = (id: string | null | undefined): CardTheme | undefined => (id ? CARD_THEMES.find((t) => t.id === id) : undefined);
export const isCardThemeId = (id: unknown): id is string => typeof id === "string" && CARD_THEMES.some((t) => t.id === id);

/**
 * The card's colours for a business: the theme it picked, otherwise its own colours, otherwise null (the
 * card's neutral palette).
 */
export function cardColors(picked: string | null | undefined, own: CardThemeColors | null | undefined): CardThemeColors | null {
  return getCardTheme(picked)?.colors ?? own ?? null;
}

/** The text colours tried on a brand's accent, darkest first. */
const INKS = ["#0b0f1a", "#ffffff"];

/**
 * A business's own colours for its card from the three it chooses (its brand's main colour, a second accent and
 * a dark background): the text on the accent is whichever of near-black and white reads on both accents, and
 * the glow is the main colour, faint. Returns the colours, or what is wrong with them (themeProblems).
 */
export function brandColors(a1: string, a2: string, bg: string): { colors: CardThemeColors; problems: string[] } {
  const hex = (v: string) => v.trim().toLowerCase();
  const [x, y, z] = [hex(a1), hex(a2), hex(bg)];
  const ok = [x, y, z].every((v) => HEX.test(v));
  const ink = (ok && INKS.find((i) => contrast(i, x) >= 4.5 && contrast(i, y) >= 4.5)) || INKS[0];
  const rgb = ok ? [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16)).join(",") : "0,0,0";
  const colors = { a1: x, a2: y, ink, bg: z, glow: `rgba(${rgb},.16)` };
  return { colors, problems: themeProblems(colors) };
}

// ---- Checks, for themes added here and proposed in the public repository ----

const HEX = /^#[0-9a-f]{6}$/;
const RGBA = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0?\.\d+|0|1)\s*\)$/;

function luminance(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

/** The WCAG contrast ratio of two #rrggbb colours, from 1 to 21. */
export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/**
 * What is wrong with a theme's colours, or an empty list. a1, a2, ink and bg are lower-case #rrggbb; glow is
 * rgba() with an alpha of .25 or less. The text on the accent (ink on a1 and on a2) needs a contrast of at least
 * 4.5, and the accent on the background (a2 is also the colour of links and focus borders) at least 4.5.
 */
export function themeProblems(c: Partial<Record<keyof CardThemeColors, unknown>>): string[] {
  const out: string[] = [];
  for (const k of ["a1", "a2", "ink", "bg"] as const) {
    if (typeof c[k] !== "string" || !HEX.test(c[k] as string)) out.push(`${k} must be a lower-case #rrggbb colour.`);
  }
  const glow = typeof c.glow === "string" ? RGBA.exec(c.glow) : null;
  if (!glow) out.push("glow must be rgba(r,g,b,alpha), for example rgba(103,232,249,.14).");
  else if (glow.slice(1, 4).some((v) => Number(v) > 255) || Number(glow[4]) > 0.25) out.push("glow needs channels of 0 to 255 and an alpha of .25 or less.");
  if ((["a1", "a2", "ink", "bg"] as const).some((k) => typeof c[k] !== "string" || !HEX.test(c[k] as string))) return out;
  const { a1, a2, ink, bg } = c as CardThemeColors;
  for (const [label, x, y] of [["ink on a1", ink, a1], ["ink on a2", ink, a2], ["a1 on bg", a1, bg], ["a2 on bg", a2, bg]] as const) {
    const r = contrast(x, y);
    if (r < 4.5) out.push(`${label} has a contrast of ${r.toFixed(2)}; it needs at least 4.5.`);
  }
  return out;
}

const PATH_DATA = /^[MmLlHhVvCcSsQqTtAaZz0-9 ,.\-]{3,1500}$/;
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const oneOf = (list: readonly string[], v: unknown) => typeof v === "string" && list.includes(v);

/** What is wrong with a theme's decorations, or an empty list. Nothing in them is text, so there is no contrast rule. */
export function decorProblems(d: unknown): string[] {
  if (d === undefined) return [];
  if (!isObj(d)) return ["decor must be an object with header, divider, footer and stickers."];
  const out: string[] = [];
  for (const k of Object.keys(d)) if (!["header", "divider", "footer", "stickers", "style"].includes(k)) out.push(`decor.${k} is not a decoration: use header, divider, footer, stickers or style.`);
  if (d.style !== undefined && !oneOf(DECOR_STYLES, d.style)) out.push(`decor.style must be one of ${DECOR_STYLES.join(", ")}.`);
  for (const k of ["header", "divider", "footer"] as const) {
    const b = d[k];
    if (b === undefined) continue;
    if (!isObj(b)) { out.push(`decor.${k} must be an object with pattern and colors.`); continue; }
    if (!oneOf(DECOR_PATTERNS, b.pattern)) out.push(`decor.${k}.pattern must be one of ${DECOR_PATTERNS.join(", ")}.`);
    const n = b.pattern === "serrated" ? [2, 2] : [1, 5];
    if (!Array.isArray(b.colors) || b.colors.length < n[0] || b.colors.length > n[1] || b.colors.some((c) => typeof c !== "string" || !HEX.test(c)))
      out.push(`decor.${k}.colors must be ${n[0] === n[1] ? "2" : "1 to 5"} lower-case #rrggbb colours.`);
    if (b.motion !== undefined && !oneOf(DECOR_BAND_MOTIONS, b.motion)) out.push(`decor.${k}.motion must be one of ${DECOR_BAND_MOTIONS.join(", ")}.`);
  }
  if (d.stickers !== undefined) {
    if (!Array.isArray(d.stickers) || d.stickers.length < 1 || d.stickers.length > 3) out.push("decor.stickers must be a list of 1 to 3 stickers.");
    else d.stickers.forEach((x, i) => {
      if (!isObj(x)) { out.push(`decor.stickers[${i}] must be an object.`); return; }
      const shape = x.shape !== undefined, path = x.path !== undefined;
      if (shape === path) out.push(`decor.stickers[${i}] needs either shape or path, not both.`);
      if (shape && !oneOf(DECOR_SHAPES, x.shape)) out.push(`decor.stickers[${i}].shape must be one of ${DECOR_SHAPES.join(", ")}.`);
      if (path && (typeof x.path !== "string" || !PATH_DATA.test(x.path))) out.push(`decor.stickers[${i}].path must be SVG path data on a 24 by 24 grid: letters, digits, spaces, commas, dots and minus signs, up to 1500 characters.`);
      if (typeof x.color !== "string" || !HEX.test(x.color)) out.push(`decor.stickers[${i}].color must be a lower-case #rrggbb colour.`);
      if (x.line !== undefined && typeof x.line !== "boolean") out.push(`decor.stickers[${i}].line must be true or false.`);
      if (x.large !== undefined && typeof x.large !== "boolean") out.push(`decor.stickers[${i}].large must be true or false.`);
      if (x.motion !== undefined && !oneOf(DECOR_STICKER_MOTIONS, x.motion)) out.push(`decor.stickers[${i}].motion must be one of ${DECOR_STICKER_MOTIONS.join(", ")}.`);
      if (x.motion === "flow" && x.line !== true) out.push(`decor.stickers[${i}]: flow moves along a line, so it needs "line": true.`);
    });
  }
  return out;
}

/** A theme's decorations with only the fields the card reads, or undefined when it has none or they fail the check. */
export function cleanDecor(d: unknown): CardDecor | undefined {
  if (!isObj(d) || decorProblems(d).length) return undefined;
  const band = (b: unknown): DecorBand | undefined => (isObj(b) ? { pattern: b.pattern as DecorBand["pattern"], colors: [...(b.colors as string[])], ...(b.motion ? { motion: b.motion as DecorBand["motion"] } : {}) } : undefined);
  const out: CardDecor = {};
  for (const k of ["header", "divider", "footer"] as const) { const b = band(d[k]); if (b) out[k] = b; }
  if (Array.isArray(d.stickers)) out.stickers = (d.stickers as Record<string, unknown>[]).map((x) => ({ ...(x.shape ? { shape: x.shape as DecorSticker["shape"] } : { path: x.path as string }), color: x.color as string, ...(x.line ? { line: true } : {}), ...(x.large ? { large: true } : {}), ...(x.motion ? { motion: x.motion as DecorSticker["motion"] } : {}) }));
  if (d.style) out.style = d.style as CardDecor["style"];
  return Object.keys(out).length ? out : undefined;
}

/** The named sticker shapes as SVG path data on a 24 by 24 grid. The card has its own copy (plugin-widget.ts `DEC_SHAPES`): keep them the same. */
export const DECOR_SHAPE_PATHS: Record<(typeof DECOR_SHAPES)[number], string> = {
  star: "M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7L12 17.4 5.8 21.1l1.6-7L2 9.3l7.1-.7z",
  heart: "M12 21C6.5 17.2 3 13.6 3 9.4 3 6.6 5.1 4.5 7.8 4.5c1.7 0 3.2.8 4.2 2.2 1-1.4 2.5-2.2 4.2-2.2C18.9 4.5 21 6.6 21 9.4c0 4.2-3.5 7.8-9 11.6z",
  diamond: "M12 2l8 10-8 10-8-10z",
  circle: "M12 3a9 9 0 100 18 9 9 0 000-18z",
  leaf: "M20.5 3.5C11 3 4.5 7.5 4.5 14.5c0 1.5.3 2.8.9 4L3 21l1.5 1.5 2.3-2.4c1.3.7 2.8 1.1 4.2 1.1 7.5 0 10.5-8 9.5-17.7z",
  sun: "M12 7a5 5 0 100 10 5 5 0 000-10zM11 1h2v4h-2zM11 19h2v4h-2zM1 11h4v2H1zM19 11h4v2h-4zM4.2 5.6l1.4-1.4 2.8 2.8L7 8.4zM15.6 17l1.4-1.4 2.8 2.8-1.4 1.4zM4.2 18.4L7 15.600l1.4 1.4-2.8 2.8zM15.6 7l2.8-2.8 1.4 1.4L17 8.4z",
};

/** A band's CSS background, as the card draws it (plugin-widget.ts `decorBand`): keep the two the same. */
export function bandBackground(b: DecorBand): string {
  const c = b.colors.filter((x) => HEX.test(x)).slice(0, 5), n = c.length;
  if (!n) return "transparent";
  const stops = (deg: string) => `linear-gradient(${deg},${c.map((x, i) => `${x} ${((100 * i) / n).toFixed(2)}% ${((100 * (i + 1)) / n).toFixed(2)}%`).join(",")})`;
  if (b.pattern === "lines") return stops("180deg");
  if (b.pattern === "serrated" && n >= 2) return `conic-gradient(from -45deg at 50% 100%,${c[0]} 90deg,transparent 0) 0 100%/12px 55% repeat-x,linear-gradient(${c[0]},${c[0]}) 0 0/100% 46% no-repeat,${c[1]}`;
  if (b.pattern === "slant") return `repeating-linear-gradient(115deg,${c.map((x, i) => `${x} ${i * 10}px ${(i + 1) * 10}px`).join(",")})`;
  if (b.pattern === "dots") return c.map((x, i) => `radial-gradient(circle at 7px 50%,${x} 0 3px,transparent 3.6px) ${i * 14}px 0/${n * 14}px 100% repeat-x`).join(",");
  return stops("90deg");
}

/** What a theme's decorations are, in a few words: "Header and footer bands, 2 stickers, animated". Empty without any. */
export function decorSummary(d: CardDecor | undefined): string {
  if (!d) return "";
  const bands = [d.header ? "header" : "", d.divider ? "divider" : "", d.footer ? "footer" : ""].filter(Boolean);
  const stickers = d.stickers?.length ?? 0;
  const moving = [d.header, d.divider, d.footer].some((b) => b?.motion) || d.stickers?.some((s) => s.motion);
  const parts = [
    bands.length ? `${bands.length > 1 ? `${bands.slice(0, -1).join(", ")} and ${bands[bands.length - 1]}` : bands[0]} band${bands.length > 1 ? "s" : ""}` : "",
    stickers ? `${stickers} sticker${stickers > 1 ? "s" : ""}` : "",
    d.style ? `${d.style} style` : "",
    moving ? "animated" : "",
  ].filter(Boolean).join(", ");
  return parts.charAt(0).toUpperCase() + parts.slice(1);
}

/** Problems with the list itself: ids, names and every theme's colours. */
export function cardThemeListProblems(list: CardTheme[] = CARD_THEMES): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const t of list) {
    if (!THEME_ID.test(t.id) || t.id === DEFAULT_CARD_THEME) out.push(`${t.id}: the id must be 2 to 24 lower-case letters or hyphens, and not "${DEFAULT_CARD_THEME}".`);
    if (seen.has(t.id)) out.push(`${t.id}: the id is used twice.`);
    seen.add(t.id);
    if (!t.name.trim() || t.name.length > 24) out.push(`${t.id}: the name must be 1 to 24 characters.`);
    if (!t.description.trim() || t.description.length > 160) out.push(`${t.id}: the description must be 1 to 160 characters.`);
    if (!t.author.trim() || t.author.length > 80) out.push(`${t.id}: the author must be 1 to 80 characters.`);
    if (t.authorUrl !== undefined && !/^https:\/\/[^\s"'<>]{3,200}$/.test(String(t.authorUrl))) out.push(`${t.id}: authorUrl must be an https address (your site or profile).`);
    if (t.github !== undefined && !/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/.test(String(t.github))) out.push(`${t.id}: github must be your GitHub username, without @ or a link.`);
    for (const p of themeProblems(t.colors)) out.push(`${t.id}: ${p}`);
    for (const p of decorProblems(t.decor)) out.push(`${t.id}: ${p}`);
  }
  return out;
}

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

export type CardTheme = {
  /** Lower-case letters and hyphens. Stored on the client's plug-in, so never rename one. */
  id: string;
  name: string;
  /** One sentence: the look, and the kind of business it suits. */
  description: string;
  /** Who made it: "BizPlug", or the person or company that proposed it in the public repository. */
  author: string;
  colors: CardThemeColors;
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

export const getCardTheme = (id: string | null | undefined): CardTheme | undefined => (id ? CARD_THEMES.find((t) => t.id === id) : undefined);
export const isCardThemeId = (id: unknown): id is string => typeof id === "string" && CARD_THEMES.some((t) => t.id === id);

/**
 * The card's colours for a business: the theme it picked, otherwise its own colours, otherwise null (the
 * card's neutral palette).
 */
export function cardColors(picked: string | null | undefined, own: CardThemeColors | null | undefined): CardThemeColors | null {
  return getCardTheme(picked)?.colors ?? own ?? null;
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

/** Problems with the list itself: ids, names and every theme's colours. */
export function cardThemeListProblems(list: CardTheme[] = CARD_THEMES): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const t of list) {
    if (!/^[a-z][a-z-]{1,23}$/.test(t.id) || t.id === DEFAULT_CARD_THEME) out.push(`${t.id}: the id must be 2 to 24 lower-case letters or hyphens, and not "${DEFAULT_CARD_THEME}".`);
    if (seen.has(t.id)) out.push(`${t.id}: the id is used twice.`);
    seen.add(t.id);
    if (!t.name.trim() || t.name.length > 24) out.push(`${t.id}: the name must be 1 to 24 characters.`);
    if (!t.description.trim() || t.description.length > 160) out.push(`${t.id}: the description must be 1 to 160 characters.`);
    if (!t.author.trim()) out.push(`${t.id}: the author is missing.`);
    for (const p of themeProblems(t.colors)) out.push(`${t.id}: ${p}`);
  }
  return out;
}

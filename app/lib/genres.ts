// Genre colours — each genre can be given its own colour (set in Admin → Genres) so people
// can recognise it at a glance. Genres without one fall back to the neutral accent.

export const NEUTRAL_GENRE_COLOR = "#E8DCC0";

// Preset swatches offered in the admin picker (distinct from each other on the dark theme).
export const GENRE_PALETTE = [
  "#E85D75", "#F4845F", "#F5A623", "#F2C14E",
  "#2EC4B6", "#4CC9F0", "#5B8DEF", "#7B6CF6",
  "#A66CFF", "#E040A0", "#FF7EB6", "#FFB59E",
  "#8FE3CF", "#C0C7D1", "#D8C3A5", "#D1495B",
];

export const isHexColor = (v: unknown): v is string => typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v);

/** "#RRGGBB" + alpha -> "rgba(r,g,b,a)". */
export function withAlpha(hex: string, alpha: number): string {
  const h = isHexColor(hex) ? hex : NEUTRAL_GENRE_COLOR;
  const n = parseInt(h.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

/** Colour for a genre name (case-insensitive) from the {lowercaseName: hex} map. */
export function genreColor(map: Record<string, string> | undefined, name: string): string {
  return map?.[name.trim().toLowerCase()] ?? NEUTRAL_GENRE_COLOR;
}

/** Inline style for a genre chip in its colour (tinted fill, coloured border + text). */
export function genreChipStyle(color: string): { background: string; border: string; color: string } {
  return { background: withAlpha(color, 0.14), border: `1px solid ${withAlpha(color, 0.5)}`, color };
}

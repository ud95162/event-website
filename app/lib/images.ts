// Image URLs for DB-stored pictures.
//
// Uploaded images live in the database as base64 data URIs. Returning them inside the JSON
// API responses made every page download tens of MB before it could render. Instead the API
// now returns a small URL (/api/img/...) that serves the picture as a real, resized, cacheable
// image — see app/api/img/[table]/[id]/[field]/route.ts.

// table -> { public field name -> DB column }
export const IMG_COLUMNS: Record<string, Record<string, string>> = {
  events:     { image: "image" },
  artists:    { image: "image", banner: "banner_image" },
  organizers: { logo: "logo", banner: "banner" },
  banners:    { url: "url" },
  brands:     { logo: "logo" },
  reviews:    { image: "image" },
};

const IMG_PREFIX = "/api/img/";

/** True for the URLs produced by imgUrl() (so writers can tell "unchanged" from a new upload). */
export const isInternalImg = (v: unknown): boolean => typeof v === "string" && v.startsWith(IMG_PREFIX);

// Cheap content signature (length + a few sampled characters) used as the cache-busting ?v=.
function signature(value: string): string {
  let h = 5381;
  const step = Math.max(1, Math.floor(value.length / 48));
  for (let i = 0; i < value.length; i += step) h = ((h << 5) + h + value.charCodeAt(i)) | 0;
  return `${value.length.toString(36)}${(h >>> 0).toString(36)}`;
}

// List queries don't pull the (huge) base64 values out of MySQL at all: they select this marker
// instead (see lib/select.ts), carrying just a content signature for the ?v= cache-buster.
export const IMG_MARK = "@img:";

// Pictures that live in /public (the original demo events/artists). They're multi-MB PNGs, so they
// are served through the same resizing endpoint: /api/img/pub/<dir>/<file>.
const PUBLIC_PIC = /^\/(events|artists)\/([\w.-]+\.(?:png|jpe?g|webp))$/i;

/** Data URIs (or the SQL marker standing in for one) become /api/img/... URLs; local /public
 *  pictures are routed through the optimiser too; other http(s)/relative URLs pass through. */
export function imgUrl(table: string, id: number | string, field: string, value: string | null | undefined): string | null | undefined {
  if (!value) return value;
  if (value.startsWith(IMG_MARK)) return `${IMG_PREFIX}${table}/${id}/${field}?v=${value.slice(IMG_MARK.length)}`;
  const pub = value.match(PUBLIC_PIC);
  if (pub) return `${IMG_PREFIX}pub/${pub[1]}/${pub[2]}`;
  if (!value.startsWith("data:")) return value;
  return `${IMG_PREFIX}${table}/${id}/${field}?v=${signature(value)}`;
}

/**
 * SQL helper for UPDATEs: `col = IF(?, col, ?)` — keeps the stored picture when the client
 * sent back the unchanged /api/img/ URL it was given, and writes the value otherwise.
 */
export const keepImg = (col: string) => `${col} = IF(?, ${col}, ?)`;
export const keepImgParams = (value: unknown): [number, unknown] => [isInternalImg(value) ? 1 : 0, value ?? null];

/**
 * Asks for a smaller version of a DB-stored picture (for cards/avatars) by adding ?w=<px>.
 * Ordinary external URLs and data URIs are returned unchanged.
 */
export function thumb(src: string | null | undefined, width: number): string {
  if (!src) return "";
  return src.startsWith(IMG_PREFIX) ? `${src}${src.includes("?") ? "&" : "?"}w=${width}` : src;
}

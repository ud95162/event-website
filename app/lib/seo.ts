import type { Metadata } from "next";
import { imgUrl } from "./images";
import { getPool } from "./db";
import { ensureSchema } from "./schema";
import { imgMarker } from "./select";
import { slugify } from "./slug";
import { toIso } from "./stamps";

// Shared helpers for the page titles / link previews (Open Graph + Twitter cards) that WhatsApp,
// Facebook, X, Telegram etc. show when a link is shared.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://discoverevents.lk").replace(/\/+$/, "");
export const SITE_NAME = "DiscoverEvents.lk";
export const DEFAULT_OG_IMAGE = "/og-default.jpg";

/** Collapses whitespace and trims to `max` characters (adds an ellipsis when cut). */
export function snippet(text: string | null | undefined, max = 180): string {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}

/**
 * A picture usable as a link-preview thumbnail: a 1200×630 cropped JPEG (WhatsApp wants well under 300 KB)
 * for pictures we store, or the original URL for external ones. Returns a path or absolute URL.
 */
export function ogImage(table: string, id: number | string, field: string, value: string | null | undefined): string {
  const url = imgUrl(table, id, field, value);
  if (!url) return DEFAULT_OG_IMAGE;
  if (url.startsWith("/api/img/")) return `${url}${url.includes("?") ? "&" : "?"}og=1&fmt=jpg`;
  return url;
}

export function pageMetadata(opts: { title: string; description: string; path: string; image: string; added?: unknown; modified?: unknown }): Metadata {
  const { title, description, path, image } = opts;
  // Added / last-modified dates travel with the link as article:published_time / modified_time.
  const published = toIso(opts.added), modified = toIso(opts.modified);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      title,
      description,
      url: path,
      ...(published ? { publishedTime: published } : {}),
      ...(modified ? { modifiedTime: modified } : {}),
      images: [{ url: image, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

// ── Per-page lookups used by generateMetadata (server side, straight from the DB) ──

async function findBySlug(table: string, nameCols: string[], slug: string): Promise<number | null> {
  await ensureSchema();
  const [rows] = await getPool().query<any[]>(`SELECT id, ${nameCols.join(", ")} FROM ${table}`);
  const hit = rows.find((r) => slugify(nameCols.map((c) => r[c]).find(Boolean) ?? "") === slug);
  return hit ? hit.id : null;
}

// "27 August 2025" -> "27 Aug"; anything else is returned as typed.
function shortDate(date: string | null | undefined): string {
  const m = /^(\d{1,2})\s+([A-Za-z]{3})[A-Za-z]*/.exec((date ?? "").trim());
  return m ? `${m[1]} ${m[2][0].toUpperCase()}${m[2].slice(1).toLowerCase()}` : (date ?? "").trim();
}

// "MUSIC FESTIVAL" -> "Music Festival" (keeps a few well-known acronyms upper-case).
const KEEP_UPPER = new Set(["EDM", "DJ", "MC", "RNB"]);
function titleCase(text: string | null | undefined): string {
  return (text ?? "").trim().toLowerCase()
    .replace(/[a-z][a-z']*/g, (w) => (KEEP_UPPER.has(w.toUpperCase()) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)));
}

const digitsOf = (v: unknown) => Number(String(v ?? "").replace(/\D/g, "")) || 0;

/** Lowest ticket price (from the ticket types, else the event's own price text), or null. */
function lowestPrice(tickets: unknown, fallback: string | null | undefined): number | null {
  let list: any[] = [];
  try { list = typeof tickets === "string" ? JSON.parse(tickets) : Array.isArray(tickets) ? tickets : []; } catch { /* ignore */ }
  const prices = list.map((t) => digitsOf(t?.price)).filter((n) => n > 0);
  if (prices.length) return Math.min(...prices);
  const n = digitsOf(fallback);
  return n > 0 ? n : null;
}

/** First sentence of a bio, cut to ~`max` characters on a word boundary, without a final full stop. */
function oneLine(text: string | null | undefined, max = 80): string {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  let line = (/^.*?[.!?](?=\s|$)/.exec(t)?.[0] ?? t).replace(/[.!?]+$/, "");
  if (line.length > max) line = line.slice(0, max).replace(/\s+\S*$/, "").replace(/[,;:\s-]+$/, "");
  return line;
}

export async function eventMetadata(slug: string): Promise<Metadata | null> {
  try {
    const id = await findBySlug("events", ["title"], slug);
    if (id == null) return null;
    const [rows] = await getPool().query<any[]>(
      `SELECT id, title, date, tag, venue, location, price, tickets, created_at, updated_at, ${imgMarker("image")} FROM events WHERE id = ?`, [id]);
    const e = rows[0];
    if (!e) return null;
    const city = (e.location ?? "").trim();
    const when = [shortDate(e.date), city].filter(Boolean).join(" · ");
    const title = [e.title, when, SITE_NAME].filter(Boolean).join(" | ");
    const price = lowestPrice(e.tickets, e.price);
    const where = [(e.venue ?? "").trim(), city].filter(Boolean).join(", ");
    const description = [
      [titleCase(e.tag), where].filter(Boolean).join(" · "),
      price ? `Tickets from LKR ${price.toLocaleString("en-US")}` : "",
    ].filter(Boolean).join(" · ") + `. Get the details, lineup and tickets on ${SITE_NAME}.`;
    return pageMetadata({ title, description, path: `/events/${slug}`, image: ogImage("events", e.id, "image", e.image), added: e.created_at, modified: e.updated_at });
  } catch { return null; }
}

export async function artistMetadata(slug: string): Promise<Metadata | null> {
  try {
    await ensureSchema();
    const [all] = await getPool().query<any[]>("SELECT id, name, stage_name FROM artists");
    const hit = all.find((r) => slugify(r.stage_name || r.name) === slug);
    if (!hit) return null;
    const [rows] = await getPool().query<any[]>(
      `SELECT id, name, stage_name, role, genres, bio, created_at, updated_at, ${imgMarker("image")} FROM artists WHERE id = ?`, [hit.id]);
    const a = rows[0];
    if (!a) return null;
    const name = a.stage_name || a.name;
    let genres: any[] = [];
    try { genres = typeof a.genres === "string" ? JSON.parse(a.genres) : a.genres ?? []; } catch { /* ignore */ }
    const specialty = [titleCase(a.role), titleCase(genres[0])].filter(Boolean).join(" · ");
    const title = [name, specialty, SITE_NAME].filter(Boolean).join(" | ");
    const bio = oneLine(a.bio) || titleCase(a.role) || "Artist on DiscoverEvents.lk";
    return pageMetadata({
      title,
      description: `${bio}. See upcoming events and follow ${name} on ${SITE_NAME}.`,
      path: `/artists/${slug}`, image: ogImage("artists", a.id, "image", a.image),
      added: a.created_at, modified: a.updated_at,
    });
  } catch { return null; }
}

export async function organizerMetadata(slug: string): Promise<Metadata | null> {
  try {
    const id = await findBySlug("organizers", ["name"], slug);
    if (id == null) return null;
    const [rows] = await getPool().query<any[]>(
      `SELECT id, name, description, created_at, updated_at, ${imgMarker("logo")}, ${imgMarker("banner")} FROM organizers WHERE id = ?`, [id]);
    const o = rows[0];
    if (!o) return null;
    const pic = o.banner ? ogImage("organizers", o.id, "banner", o.banner) : ogImage("organizers", o.id, "logo", o.logo);
    return pageMetadata({
      title: `${o.name} | ${SITE_NAME}`,
      description: snippet(o.description || `Events by ${o.name} on DiscoverEvents.lk`),
      path: `/organizers/${slug}`, image: pic, added: o.created_at, modified: o.updated_at,
    });
  } catch { return null; }
}

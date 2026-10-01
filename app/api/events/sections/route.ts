import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { ensureSchema } from "../../../lib/schema";
import { mapEventRow } from "../../../lib/mappers";

// The /events page shows Netflix-style category rows (Hot & Trending, Upcoming, genres,
// …). Instead of shipping the whole events table (base64 images) to the browser, this
// endpoint builds the rows server-side and returns only a capped number of events per
// row. Each unique event is sent ONCE in `events` (keyed by id) and rows reference ids,
// so an event appearing in several rows doesn't duplicate its image in the payload.
//
// A cheap metadata scan (no images) decides which events land in which row; a single
// follow-up query then loads full rows for just the chosen ids.

const CAP = 12;       // max events per normal row
const ALL_CAP = 24;   // "All Events" sample size

function parseGenres(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[];
  if (typeof v === "string") { try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; } }
  return [];
}
function parseEventDate(s: string): Date | null {
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}
function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 6371, toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(bLat - aLat), dLon = toRad(bLon - aLon);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export async function GET(req: NextRequest) {
  await ensureSchema();
  const pool = getPool();

  const lat = parseFloat(req.nextUrl.searchParams.get("lat") ?? "");
  const lon = parseFloat(req.nextUrl.searchParams.get("lon") ?? "");
  const hasLoc = !isNaN(lat) && !isNaN(lon);

  const [meta] = await pool.query<any[]>(
    "SELECT id, badge, date, tag, location, genres, lat, lon FROM events ORDER BY id"
  );
  const rowsMeta = meta.map((r) => ({
    id: r.id as number,
    badge: (r.badge ?? "") as string,
    date: (r.date ?? "") as string,
    tag: (r.tag ?? "") as string,
    location: (r.location ?? "") as string,
    genres: parseGenres(r.genres),
    lat: r.lat as number,
    lon: r.lon as number,
  }));

  const now = new Date(); now.setHours(0, 0, 0, 0);

  const featured   = rowsMeta.filter((e) => e.badge === "HOT" || e.badge === "NEW");
  const comingSoon = rowsMeta.filter((e) => e.badge === "COMING SOON");
  const upcoming   = rowsMeta
    .filter((e) => { const d = parseEventDate(e.date); return !!d && d >= now; })
    .sort((a, b) => (parseEventDate(a.date)!.getTime()) - (parseEventDate(b.date)!.getTime()));
  const electronic = rowsMeta.filter((e) => e.genres.includes("electronic"));
  const sinhala    = rowsMeta.filter((e) => e.genres.includes("sinhala"));
  const djNights   = rowsMeta.filter((e) => e.tag.toLowerCase().includes("dj"));
  const colombo    = rowsMeta.filter((e) => e.location === "Colombo");
  const nearYou    = hasLoc
    ? [...rowsMeta].sort((a, b) => haversineKm(lat, lon, a.lat, a.lon) - haversineKm(lat, lon, b.lat, b.lon))
    : [];

  const rowDefs = [
    { title: "Hot & Trending",   subtitle: "Don't Miss Out",         items: featured },
    ...(nearYou.length ? [{ title: "Near You", subtitle: "Based on Your Location", items: nearYou }] : []),
    { title: "Upcoming Events",  subtitle: "Coming Soon",            items: upcoming },
    { title: "Electronic / EDM", subtitle: "Genre",                  items: electronic },
    { title: "Sinhala Music",    subtitle: "Genre",                  items: sinhala },
    { title: "DJ Nights",        subtitle: "Night Life",             items: djNights },
    { title: "Colombo Events",   subtitle: "By City",                items: colombo },
    { title: "Coming Soon",      subtitle: "Save the Date",          items: comingSoon },
    { title: "All Events",       subtitle: "Browse Everything",      items: rowsMeta },
  ];

  const rows = rowDefs.map((r) => ({
    title: r.title,
    subtitle: r.subtitle,
    ids: r.items.slice(0, r.title === "All Events" ? ALL_CAP : CAP).map((e) => e.id),
  }));

  // Fetch full rows (with images) for only the ids that actually appear in some row.
  const neededIds = Array.from(new Set(rows.flatMap((r) => r.ids)));
  const events: Record<number, ReturnType<typeof mapEventRow>> = {};
  if (neededIds.length) {
    const [full] = await pool.query<any[]>("SELECT * FROM events WHERE id IN (?)", [neededIds]);
    for (const row of full) events[row.id] = mapEventRow(row);
  }

  return NextResponse.json({ rows, events }, {
    headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=300" },
  });
}

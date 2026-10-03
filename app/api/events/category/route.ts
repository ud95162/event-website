import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { cols } from "../../../lib/select";
import { ensureSchema } from "../../../lib/schema";
import { mapEventRow } from "../../../lib/mappers";

// One category row at a time, so the /events page can lazy-load each row (Hot & Trending,
// Upcoming, a genre, a city, …) independently as it scrolls into view — instead of
// fetching every row up front. A cheap metadata scan picks the matching ids (capped);
// one query loads full rows (with images) for just those.
//
//   /api/events/category?type=hot
//   /api/events/category?type=upcoming
//   /api/events/category?type=coming-soon
//   /api/events/category?type=dj
//   /api/events/category?type=genre&value=electronic
//   /api/events/category?type=city&value=Colombo
//   /api/events/category?type=near-you&lat=..&lon=..

const CAP = 12;

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
  const sp = req.nextUrl.searchParams;
  const type = sp.get("type") ?? "";
  const value = (sp.get("value") ?? "").toLowerCase();

  const [meta] = await pool.query<any[]>(
    "SELECT id, badge, date, tag, location, genres, lat, lon FROM events ORDER BY id"
  );
  const rows = meta.map((r) => ({
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
  let picked = rows;

  switch (type) {
    case "hot":
      picked = rows.filter((e) => e.badge === "HOT" || e.badge === "NEW");
      break;
    case "coming-soon":
      picked = rows.filter((e) => e.badge === "COMING SOON");
      break;
    case "upcoming":
      picked = rows
        .filter((e) => { const d = parseEventDate(e.date); return !!d && d >= now; })
        .sort((a, b) => parseEventDate(a.date)!.getTime() - parseEventDate(b.date)!.getTime());
      break;
    case "dj":
      picked = rows.filter((e) => e.tag.toLowerCase().includes("dj"));
      break;
    case "genre":
      picked = rows.filter((e) => e.genres.some((g) => g.toLowerCase() === value));
      break;
    case "city":
      picked = rows.filter((e) => e.location.toLowerCase() === value);
      break;
    case "near-you": {
      const lat = parseFloat(sp.get("lat") ?? "");
      const lon = parseFloat(sp.get("lon") ?? "");
      if (isNaN(lat) || isNaN(lon)) { picked = []; break; }
      picked = [...rows].sort((a, b) => haversineKm(lat, lon, a.lat, a.lon) - haversineKm(lat, lon, b.lat, b.lon));
      break;
    }
    default:
      return NextResponse.json({ error: "Unknown category type" }, { status: 400 });
  }

  const ids = picked.slice(0, CAP).map((e) => e.id);
  let events: ReturnType<typeof mapEventRow>[] = [];
  if (ids.length) {
    const [full] = await pool.query<any[]>(`SELECT ${await cols("events")} FROM events WHERE id IN (?)`, [ids]);
    const byId = new Map<number, any>(full.map((r) => [r.id, r]));
    events = ids.map((id) => mapEventRow(byId.get(id))).filter(Boolean);
  }

  return NextResponse.json(events, {
    headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=300" },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { cols } from "../../../lib/select";
import { ensureSchema } from "../../../lib/schema";
import { mapEventRow } from "../../../lib/mappers";

// Server-side search for the /events filtered view, so the browser never downloads the
// whole events table just to filter it. A cheap text-only scan finds matches; a single
// follow-up query loads full rows (with images) for the capped match set.

const CAP = 60;

function parseJsonArr(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[];
  if (typeof v === "string") { try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; } }
  return [];
}

function matchesDate(evDateStr: string, dateParam: string): boolean {
  if (!dateParam) return true;
  const d = new Date(evDateStr);
  if (isNaN(d.getTime())) return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (dateParam === "today") return dOnly.getTime() === today.getTime();
  if (dateParam === "this-week") { const end = new Date(today); end.setDate(today.getDate() + 7); return dOnly >= today && dOnly < end; }
  if (dateParam === "this-month") return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
  if (dateParam.startsWith("custom:")) {
    const [, from, to] = dateParam.split(":");
    const f = from ? new Date(from) : null;
    const t = to ? new Date(to) : f;
    if (f && dOnly < new Date(f.getFullYear(), f.getMonth(), f.getDate())) return false;
    if (t && dOnly > new Date(t.getFullYear(), t.getMonth(), t.getDate())) return false;
    return true;
  }
  return true;
}

export async function GET(req: NextRequest) {
  await ensureSchema();
  const pool = getPool();
  const sp = req.nextUrl.searchParams;
  const genreParam = (sp.get("genre") ?? "").toLowerCase();
  const dateParam = sp.get("date") ?? "";
  const queryParam = (sp.get("q") ?? "").toLowerCase();
  const categoryParam = sp.get("category") ?? "";

  const [meta] = await pool.query<any[]>(
    "SELECT id, title, tag, location, organizer, genres, lineup, date FROM events ORDER BY id"
  );

  const matchIds = meta
    .filter((r) => {
      const genres = parseJsonArr(r.genres);
      const lineup = parseJsonArr(r.lineup);
      if (genreParam && !genres.some((g) => g.toLowerCase() === genreParam)) return false;
      if (!matchesDate(r.date ?? "", dateParam)) return false;
      if (queryParam) {
        if (categoryParam === "genres") {
          if (!genres.some((g) => g.toLowerCase().includes(queryParam) || queryParam.includes(g.toLowerCase()))) return false;
        } else {
          const searchable = [r.title, r.tag, r.location, r.organizer, ...genres, ...lineup].join(" ").toLowerCase();
          if (!searchable.includes(queryParam)) return false;
          if (categoryParam === "artists" && !lineup.some((a) => a.toLowerCase().includes(queryParam))) return false;
          if (categoryParam === "organizers" && !(r.organizer || "").toLowerCase().includes(queryParam)) return false;
        }
      }
      return true;
    })
    .slice(0, CAP)
    .map((r) => r.id);

  let results: ReturnType<typeof mapEventRow>[] = [];
  if (matchIds.length) {
    const [full] = await pool.query<any[]>(`SELECT ${await cols("events")} FROM events WHERE id IN (?)`, [matchIds]);
    const byId = new Map<number, any>(full.map((r) => [r.id, r]));
    results = matchIds.map((id) => mapEventRow(byId.get(id))).filter(Boolean);
  }

  return NextResponse.json(results, {
    headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=300" },
  });
}

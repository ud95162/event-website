import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { ensureSchema } from "../../../lib/schema";
import { mapEventRow } from "../../../lib/mappers";

// Paginated + filtered events feed for the admin Events page, so the admin never downloads
// the whole (image-heavy) events table. A cheap text-only scan applies the filters; one
// follow-up query loads full rows only for the requested page.
//
// Query: page (1-based, default 1), limit (default 10, max 100), q, location,
//        date (yyyy-mm-dd), month (yyyy-mm), period (today|week|month), sort (asc|desc)

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const pad = (n: number) => String(n).padStart(2, "0");
const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function matchesPeriod(d: Date, period: string): boolean {
  if (!period) return true;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (period === "today") return dOnly.getTime() === now.getTime();
  if (period === "week") {
    const end = new Date(now); end.setDate(now.getDate() + 7);
    return dOnly >= now && dOnly < end;
  }
  if (period === "month") return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  return true;
}

export async function GET(req: NextRequest) {
  await ensureSchema();
  const pool = getPool();
  const sp = req.nextUrl.searchParams;

  const limit = Math.min(Math.max(parseInt(sp.get("limit") ?? "", 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const q = (sp.get("q") ?? "").trim().toLowerCase();
  const location = sp.get("location") ?? "";
  const date = sp.get("date") ?? "";
  const month = sp.get("month") ?? "";
  const period = sp.get("period") ?? "";
  const sort = sp.get("sort") === "asc" ? "asc" : sp.get("sort") === "desc" ? "desc" : "";

  const [meta] = await pool.query<any[]>("SELECT id, title, date, location FROM events ORDER BY id");

  const locations = Array.from(new Set(meta.map((r) => r.location).filter(Boolean))).sort() as string[];

  let matches = meta.filter((r) => {
    if (q && !String(r.title ?? "").toLowerCase().includes(q)) return false;
    if (location && r.location !== location) return false;
    if (date || month || period) {
      const d = new Date(r.date);
      if (isNaN(d.getTime())) return false;
      if (date && isoDay(d) !== date) return false;
      if (month && isoDay(d).slice(0, 7) !== month) return false;
      if (!matchesPeriod(d, period)) return false;
    }
    return true;
  });

  if (sort) {
    const t = (r: any) => new Date(r.date).getTime() || 0;
    matches = [...matches].sort((a, b) => (sort === "asc" ? t(a) - t(b) : t(b) - t(a)));
  }

  const total = matches.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(Math.max(parseInt(sp.get("page") ?? "", 10) || 1, 1), totalPages);
  const ids = matches.slice((page - 1) * limit, page * limit).map((r) => r.id);

  let events: ReturnType<typeof mapEventRow>[] = [];
  if (ids.length) {
    const [rows] = await pool.query<any[]>("SELECT * FROM events WHERE id IN (?)", [ids]);
    const byId = new Map(rows.map((r) => [r.id, r]));
    events = ids.map((id) => byId.get(id)).filter(Boolean).map(mapEventRow);
  }

  // Admin data changes often and must reflect edits/deletes immediately.
  return NextResponse.json(
    { events, total, page, limit, totalPages, locations },
    { headers: { "Cache-Control": "no-store" } }
  );
}

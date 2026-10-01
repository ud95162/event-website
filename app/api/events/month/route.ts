import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { ensureSchema } from "../../../lib/schema";
import { mapEventRow } from "../../../lib/mappers";

// Events for a single calendar month only, so the calendar never downloads the whole
// events table. `month` is 0-indexed (JS getMonth). A cheap id/date scan finds the
// matching events; one query loads full rows (with images) for just those.
function parseEventDate(s: string): Date | null {
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export async function GET(req: NextRequest) {
  await ensureSchema();
  const pool = getPool();
  const year = parseInt(req.nextUrl.searchParams.get("year") ?? "", 10);
  const month = parseInt(req.nextUrl.searchParams.get("month") ?? "", 10);
  if (isNaN(year) || isNaN(month)) {
    return NextResponse.json({ error: "year and month required" }, { status: 400 });
  }

  const [meta] = await pool.query<any[]>("SELECT id, date FROM events");
  const ids = meta
    .filter((r) => {
      const d = parseEventDate(r.date);
      return !!d && d.getFullYear() === year && d.getMonth() === month;
    })
    .map((r) => r.id);

  let events: ReturnType<typeof mapEventRow>[] = [];
  if (ids.length) {
    const [rows] = await pool.query<any[]>("SELECT * FROM events WHERE id IN (?) ORDER BY id", [ids]);
    events = rows.map(mapEventRow);
  }

  return NextResponse.json(events, {
    headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=300" },
  });
}

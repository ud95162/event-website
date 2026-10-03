import { NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { cols } from "../../../lib/select";
import { ensureSchema } from "../../../lib/schema";
import { mapEventRow } from "../../../lib/mappers";

// Events store a free-form human date ("3 October 2026"), so "this week" can't be
// filtered in SQL — we parse it here.
function parseEventDate(s: string): Date | null {
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

// Home-only endpoint: returns just the events the landing page needs — featured cards,
// admin "This Week" popup picks, and events happening in the next 7 days — WITH images.
// The heavy full events table (base64 images) never crosses the network here: a cheap
// metadata scan picks the relevant ids, then one query fetches full rows for only those.
export async function GET() {
  await ensureSchema();
  const pool = getPool();

  const [meta] = await pool.query<any[]>("SELECT id, featured, popup, date FROM events");
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);

  const ids = meta
    .filter((r) => {
      if (r.featured || r.popup) return true;
      const d = parseEventDate(r.date);
      return !!d && d >= now && d < weekEnd;
    })
    .map((r) => r.id);

  let rows: any[] = [];
  if (ids.length) {
    const [r] = await pool.query<any[]>(`SELECT ${await cols("events")} FROM events WHERE id IN (?) ORDER BY id`, [ids]);
    rows = r;
  } else {
    // Nothing flagged / upcoming — fall back to the first few so the section isn't empty.
    const [r] = await pool.query<any[]>(`SELECT ${await cols("events")} FROM events ORDER BY id LIMIT 8`);
    rows = r;
  }

  return NextResponse.json(rows.map(mapEventRow), {
    headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=300" },
  });
}

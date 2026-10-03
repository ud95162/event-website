import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { cols } from "../../../lib/select";
import { ensureSchema } from "../../../lib/schema";
import { mapEventRow } from "../../../lib/mappers";

// Paginated "All Events" feed so the browse-everything grid loads a page at a time
// (default 6) instead of the whole table at once.
export async function GET(req: NextRequest) {
  await ensureSchema();
  const pool = getPool();
  const sp = req.nextUrl.searchParams;
  const limit = Math.min(Math.max(parseInt(sp.get("limit") ?? "6", 10) || 6, 1), 24);
  const offset = Math.max(parseInt(sp.get("offset") ?? "0", 10) || 0, 0);

  const [countRows] = await pool.query<any[]>("SELECT COUNT(*) AS total FROM events");
  const total = Number(countRows[0]?.total ?? 0);

  const [rows] = await pool.query<any[]>(`SELECT ${await cols("events")} FROM events ORDER BY id LIMIT ? OFFSET ?`, [limit, offset]);
  const events = rows.map(mapEventRow);

  return NextResponse.json({ events, total, hasMore: offset + events.length < total }, {
    headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=300" },
  });
}

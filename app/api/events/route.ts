import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../lib/db";
import { ensureSchema } from "../../lib/schema";
import { mapEventRow } from "../../lib/mappers";

export async function GET() {
  await ensureSchema();
  const pool = getPool();
  const [rows] = await pool.query<any[]>("SELECT * FROM events ORDER BY id");
  // Cache so repeat visits reuse the (image-heavy) response instantly; SWR keeps it fresh.
  return NextResponse.json(rows.map(mapEventRow), {
    headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=300" },
  });
}

export async function POST(req: NextRequest) {
  await ensureSchema();
  const pool = getPool();
  const e = await req.json();
  const [result] = await pool.query<any>(
    `INSERT INTO events
       (tag, title, date, location, price, image, badge, lat, lon, description, venue, organizer, lineup, genres, tickets, status,
        start_time, end_date, end_time, age_restriction, capacity, venue_type, co_organizers, video_trailer, external_link, featured, popup)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      e.tag, e.title, e.date, e.location, e.price, e.image, e.badge ?? null,
      e.lat, e.lon, e.description, e.venue, e.organizer,
      JSON.stringify(e.lineup ?? []), JSON.stringify(e.genres ?? []), JSON.stringify(e.tickets ?? []), e.status ?? null,
      e.startTime ?? null, e.endDate ?? null, e.endTime ?? null, e.ageRestriction ?? null,
      e.capacity ?? null, e.venueType ?? null, JSON.stringify(e.coOrganizers ?? []),
      e.videoTrailer ?? null, e.externalLink ?? null, e.featured ? 1 : 0, e.popup ? 1 : 0,
    ]
  );
  const [rows] = await pool.query<any[]>("SELECT * FROM events WHERE id = ?", [result.insertId]);
  return NextResponse.json(mapEventRow(rows[0]), { status: 201 });
}

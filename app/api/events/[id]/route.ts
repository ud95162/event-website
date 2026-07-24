import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { ensureSchema } from "../../../lib/schema";
import { mapEventRow } from "../../../lib/mappers";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSchema();
  const { id } = await params;
  const pool = getPool();
  const e = await req.json();
  await pool.query(
    `UPDATE events SET
       tag=?, title=?, date=?, location=?, price=?, image=?, badge=?, lat=?, lon=?,
       description=?, venue=?, organizer=?, lineup=?, genres=?, tickets=?, status=?,
       start_time=?, end_date=?, end_time=?, age_restriction=?, capacity=?, venue_type=?, co_organizers=?, video_trailer=?, external_link=?
     WHERE id=?`,
    [
      e.tag, e.title, e.date, e.location, e.price, e.image, e.badge ?? null,
      e.lat, e.lon, e.description, e.venue, e.organizer,
      JSON.stringify(e.lineup ?? []), JSON.stringify(e.genres ?? []), JSON.stringify(e.tickets ?? []), e.status ?? null,
      e.startTime ?? null, e.endDate ?? null, e.endTime ?? null, e.ageRestriction ?? null,
      e.capacity ?? null, e.venueType ?? null, JSON.stringify(e.coOrganizers ?? []),
      e.videoTrailer ?? null, e.externalLink ?? null, id,
    ]
  );
  const [rows] = await pool.query<any[]>("SELECT * FROM events WHERE id = ?", [id]);
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(mapEventRow(rows[0]));
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSchema();
  const { id } = await params;
  const pool = getPool();
  await pool.query("DELETE FROM events WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}

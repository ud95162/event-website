import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../lib/db";
import { ensureSchema } from "../../lib/schema";
import { mapEventRow } from "../../lib/mappers";

export async function GET() {
  await ensureSchema();
  const pool = getPool();
  const [rows] = await pool.query<any[]>("SELECT * FROM events ORDER BY id");
  return NextResponse.json(rows.map(mapEventRow));
}

export async function POST(req: NextRequest) {
  await ensureSchema();
  const pool = getPool();
  const e = await req.json();
  const [result] = await pool.query<any>(
    `INSERT INTO events
       (tag, title, date, location, price, image, badge, lat, lon, description, venue, organizer, lineup, genres)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      e.tag, e.title, e.date, e.location, e.price, e.image, e.badge ?? null,
      e.lat, e.lon, e.description, e.venue, e.organizer,
      JSON.stringify(e.lineup ?? []), JSON.stringify(e.genres ?? []),
    ]
  );
  const [rows] = await pool.query<any[]>("SELECT * FROM events WHERE id = ?", [result.insertId]);
  return NextResponse.json(mapEventRow(rows[0]), { status: 201 });
}

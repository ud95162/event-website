import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { ensureSchema } from "../../../lib/schema";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSchema();
  const { id } = await params;
  const pool = getPool();
  const { url, eventId, title, description } = await req.json();
  await pool.query(
    "UPDATE banners SET url = ?, event_id = ?, title = ?, description = ? WHERE id = ?",
    [url, eventId ?? null, title ?? null, description ?? null, id]
  );
  const [rows] = await pool.query<any[]>("SELECT id, url, event_id AS eventId, title, description FROM banners WHERE id = ?", [id]);
  return NextResponse.json(rows[0]);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSchema();
  const { id } = await params;
  const pool = getPool();
  await pool.query("DELETE FROM banners WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}

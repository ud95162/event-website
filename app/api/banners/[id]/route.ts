import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { imgMarker } from "../../../lib/select";
import { ensureSchema } from "../../../lib/schema";
import { imgUrl, keepImg, keepImgParams } from "../../../lib/images";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSchema();
  const { id } = await params;
  const pool = getPool();
  const { url, eventId, title, description } = await req.json();
  await pool.query(
    `UPDATE banners SET ${keepImg("url")}, event_id = ?, title = ?, description = ? WHERE id = ?`,
    [...keepImgParams(url), eventId ?? null, title ?? null, description ?? null, id]
  );
  const [rows] = await pool.query<any[]>(`SELECT id, ${imgMarker("url")}, event_id AS eventId, title, description FROM banners WHERE id = ?`, [id]);
  const r = rows[0];
  return NextResponse.json({ ...r, url: imgUrl("banners", r.id, "url", r.url) });
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

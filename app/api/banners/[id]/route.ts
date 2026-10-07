import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { selectBanners } from "../../../lib/banners";
import { ensureSchema } from "../../../lib/schema";
import { keepImg, keepImgParams } from "../../../lib/images";

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
  const [banner] = await selectBanners(id);
  if (!banner) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(banner);
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

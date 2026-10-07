import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { imgMarker } from "../../../lib/select";
import { ensureSchema } from "../../../lib/schema";
import { imgUrl, keepImg, keepImgParams } from "../../../lib/images";

function clampRating(r: unknown): number {
  const n = Math.round(Number(r));
  return Math.min(5, Math.max(1, isNaN(n) ? 5 : n));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSchema();
  const { id } = await params;
  const pool = getPool();
  const { name, title, image, review, rating } = await req.json();
  const cleanTitle = typeof title === "string" && title.trim() ? title.trim().slice(0, 255) : null;
  const r = clampRating(rating);
  await pool.query(
    `UPDATE reviews SET name = ?, title = ?, ${keepImg("image")}, review = ?, rating = ? WHERE id = ?`,
    [name, cleanTitle, ...keepImgParams(image), review, r, id]
  );
  const [rows] = await pool.query<any[]>(`SELECT id, name, title, ${imgMarker("image")}, review, rating FROM reviews WHERE id = ?`, [id]);
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const row = rows[0];
  return NextResponse.json({ ...row, image: imgUrl("reviews", row.id, "image", row.image) });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSchema();
  const { id } = await params;
  const pool = getPool();
  await pool.query("DELETE FROM reviews WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}

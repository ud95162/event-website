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
  const { name, logo } = await req.json();
  await pool.query(`UPDATE brands SET name = ?, ${keepImg("logo")} WHERE id = ?`, [name, ...keepImgParams(logo), id]);
  const [rows] = await pool.query<any[]>(`SELECT id, name, ${imgMarker("logo")} FROM brands WHERE id = ?`, [id]);
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const r = rows[0];
  return NextResponse.json({ ...r, logo: imgUrl("brands", r.id, "logo", r.logo) });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSchema();
  const { id } = await params;
  const pool = getPool();
  await pool.query("DELETE FROM brands WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}

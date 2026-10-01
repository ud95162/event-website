import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { ensureSchema } from "../../../lib/schema";

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
  const { name, image, review, rating } = await req.json();
  const r = clampRating(rating);
  await pool.query(
    "UPDATE reviews SET name = ?, image = ?, review = ?, rating = ? WHERE id = ?",
    [name, image ?? null, review, r, id]
  );
  const [rows] = await pool.query<any[]>("SELECT id, name, image, review, rating FROM reviews WHERE id = ?", [id]);
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
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

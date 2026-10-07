import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../lib/db";
import { imgMarker } from "../../lib/select";
import { ensureSchema } from "../../lib/schema";
import { imgUrl } from "../../lib/images";

function clampRating(r: unknown): number {
  const n = Math.round(Number(r));
  return Math.min(5, Math.max(1, isNaN(n) ? 5 : n));
}

export async function GET() {
  await ensureSchema();
  const pool = getPool();
  const [rows] = await pool.query<any[]>(`SELECT id, name, title, ${imgMarker("image")}, review, rating FROM reviews ORDER BY id DESC`);
  return NextResponse.json(rows.map((r) => ({ ...r, image: imgUrl("reviews", r.id, "image", r.image) })), {
    headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=300" },
  });
}

export async function POST(req: NextRequest) {
  await ensureSchema();
  const pool = getPool();
  const { name, title, image, review, rating } = await req.json();
  const cleanTitle = typeof title === "string" && title.trim() ? title.trim().slice(0, 255) : null;
  if (!name || !review) return NextResponse.json({ error: "Name and review required" }, { status: 400 });
  const r = clampRating(rating);
  const [result] = await pool.query<any>(
    "INSERT INTO reviews (name, title, image, review, rating) VALUES (?, ?, ?, ?, ?)",
    [name, cleanTitle, image ?? null, review, r]
  );
  return NextResponse.json({ id: result.insertId, name, title: cleanTitle, image: imgUrl("reviews", result.insertId, "image", image) ?? null, review, rating: r }, { status: 201 });
}

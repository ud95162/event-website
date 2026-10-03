import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../lib/db";
import { imgMarker } from "../../lib/select";
import { ensureSchema } from "../../lib/schema";
import { imgUrl } from "../../lib/images";

export async function GET() {
  await ensureSchema();
  const pool = getPool();
  const [rows] = await pool.query<any[]>(`SELECT id, name, ${imgMarker("logo")} FROM brands ORDER BY id`);
  // Cache so repeat visits reuse the (image-heavy) response instantly.
  return NextResponse.json(rows.map((r) => ({ ...r, logo: imgUrl("brands", r.id, "logo", r.logo) })), {
    headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=300" },
  });
}

export async function POST(req: NextRequest) {
  await ensureSchema();
  const pool = getPool();
  const { name, logo } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const [result] = await pool.query<any>("INSERT INTO brands (name, logo) VALUES (?, ?)", [name, logo ?? null]);
  return NextResponse.json({ id: result.insertId, name, logo: imgUrl("brands", result.insertId, "logo", logo) ?? null }, { status: 201 });
}

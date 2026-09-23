import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../lib/db";
import { ensureSchema } from "../../lib/schema";

export async function GET() {
  await ensureSchema();
  const pool = getPool();
  const [rows] = await pool.query<any[]>("SELECT id, name, logo FROM brands ORDER BY id");
  // Cache so repeat visits reuse the (image-heavy) response instantly.
  return NextResponse.json(rows, {
    headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=300" },
  });
}

export async function POST(req: NextRequest) {
  await ensureSchema();
  const pool = getPool();
  const { name, logo } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const [result] = await pool.query<any>("INSERT INTO brands (name, logo) VALUES (?, ?)", [name, logo ?? null]);
  return NextResponse.json({ id: result.insertId, name, logo: logo ?? null }, { status: 201 });
}

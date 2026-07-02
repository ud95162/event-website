import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../lib/db";
import { ensureSchema } from "../../lib/schema";

export async function GET() {
  await ensureSchema();
  const pool = getPool();
  const [rows] = await pool.query<any[]>("SELECT id, url FROM banners ORDER BY id");
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  await ensureSchema();
  const pool = getPool();
  const { url } = await req.json();
  const [result] = await pool.query<any>("INSERT INTO banners (url) VALUES (?)", [url]);
  return NextResponse.json({ id: result.insertId, url }, { status: 201 });
}

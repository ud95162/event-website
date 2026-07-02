import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../lib/db";
import { ensureSchema } from "../../lib/schema";

export async function GET() {
  await ensureSchema();
  const pool = getPool();
  const [rows] = await pool.query<any[]>("SELECT name FROM genres ORDER BY id");
  return NextResponse.json(rows.map((r) => r.name));
}

export async function POST(req: NextRequest) {
  await ensureSchema();
  const pool = getPool();
  const { name } = await req.json();
  if (name) await pool.query("INSERT IGNORE INTO genres (name) VALUES (?)", [name]);
  const [rows] = await pool.query<any[]>("SELECT name FROM genres ORDER BY id");
  return NextResponse.json(rows.map((r) => r.name), { status: 201 });
}

export async function DELETE(req: NextRequest) {
  await ensureSchema();
  const pool = getPool();
  const url = new URL(req.url);
  let name = url.searchParams.get("name");
  if (!name) {
    try { name = (await req.json()).name; } catch { /* ignore */ }
  }
  if (name) await pool.query("DELETE FROM genres WHERE name = ?", [name]);
  return NextResponse.json({ ok: true });
}

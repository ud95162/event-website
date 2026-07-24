import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../lib/db";
import { ensureSchema } from "../../lib/schema";

export async function GET() {
  await ensureSchema();
  const pool = getPool();
  const [rows] = await pool.query<any[]>(
    "SELECT id, name, logo, description, banner, email, phone FROM organizers ORDER BY id"
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  await ensureSchema();
  const pool = getPool();
  const { name, logo, description, banner, email, phone } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  await pool.query(
    `INSERT INTO organizers (name, logo, description, banner, email, phone)
       VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       logo = VALUES(logo), description = VALUES(description), banner = VALUES(banner),
       email = VALUES(email), phone = VALUES(phone)`,
    [name, logo ?? null, description ?? null, banner ?? null, email ?? null, phone ?? null]
  );
  const [rows] = await pool.query<any[]>(
    "SELECT id, name, logo, description, banner, email, phone FROM organizers WHERE name = ?",
    [name]
  );
  return NextResponse.json(rows[0], { status: 201 });
}

export async function DELETE(req: NextRequest) {
  await ensureSchema();
  const pool = getPool();
  const url = new URL(req.url);
  let name = url.searchParams.get("name");
  if (!name) {
    try { name = (await req.json()).name; } catch { /* ignore */ }
  }
  if (name) await pool.query("DELETE FROM organizers WHERE name = ?", [name]);
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { ensureSchema } from "../../../lib/schema";

function parse(v: any) {
  if (v == null) return null;
  if (typeof v === "object") return v;
  try { return JSON.parse(v); } catch { return null; }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  await ensureSchema();
  const { name } = await params;
  const pool = getPool();
  const [rows] = await pool.query<any[]>("SELECT data FROM settings WHERE name = ?", [name]);
  return NextResponse.json(rows.length ? parse(rows[0].data) : null);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  await ensureSchema();
  const { name } = await params;
  const pool = getPool();
  const data = await req.json();
  await pool.query(
    `INSERT INTO settings (name, data) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE data = VALUES(data)`,
    [name, JSON.stringify(data)]
  );
  return NextResponse.json(data);
}

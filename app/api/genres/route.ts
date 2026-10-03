import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../lib/db";
import { ensureSchema } from "../../lib/schema";
import { isHexColor } from "../../lib/genres";

// {lowercaseName: "#RRGGBB"} for every genre that has a colour.
async function colorMap(): Promise<Record<string, string>> {
  const [rows] = await getPool().query<any[]>("SELECT name, color FROM genres WHERE color IS NOT NULL AND color <> ''");
  return Object.fromEntries(rows.map((r) => [String(r.name).toLowerCase(), r.color]));
}

export async function GET(req: NextRequest) {
  await ensureSchema();
  if (req.nextUrl.searchParams.get("colors")) {
    return NextResponse.json(await colorMap(), { headers: { "Cache-Control": "no-store" } });
  }
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

// PUT { name, color } — sets a genre's colour; an empty colour clears it.
export async function PUT(req: NextRequest) {
  await ensureSchema();
  const { name, color } = await req.json().catch(() => ({}));
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  if (color && !isHexColor(color)) return NextResponse.json({ error: "Colour must be #RRGGBB" }, { status: 400 });
  await getPool().query("UPDATE genres SET color = ? WHERE name = ?", [color || null, name]);
  return NextResponse.json(await colorMap());
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

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { ensureSchema } from "../../../lib/schema";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSchema();
  const { id } = await params;
  const pool = getPool();
  const { name, logo, description, banner, email, phone, username, password } = await req.json();
  // Only overwrite the password when a new non-empty one is supplied.
  await pool.query(
    `UPDATE organizers SET name = ?, logo = ?, description = ?, banner = ?, email = ?, phone = ?, username = ?,
       password = COALESCE(NULLIF(?, ''), password) WHERE id = ?`,
    [name, logo ?? null, description ?? null, banner ?? null, email ?? null, phone ?? null, username ?? null, password ?? null, id]
  );
  const [rows] = await pool.query<any[]>(
    "SELECT id, name, logo, description, banner, email, phone, username FROM organizers WHERE id = ?",
    [id]
  );
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
  await pool.query("DELETE FROM organizers WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}

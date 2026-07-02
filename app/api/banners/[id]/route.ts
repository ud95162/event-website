import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { ensureSchema } from "../../../lib/schema";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSchema();
  const { id } = await params;
  const pool = getPool();
  await pool.query("DELETE FROM banners WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}

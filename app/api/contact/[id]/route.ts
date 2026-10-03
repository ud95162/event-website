import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { ensureSchema } from "../../../lib/schema";
import { isAdminRequest } from "../../../lib/auth";

// Admin: mark a message read / unread.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSchema();
  const { id } = await params;
  const { isRead } = await req.json().catch(() => ({}));
  await getPool().query("UPDATE contact_messages SET is_read = ? WHERE id = ?", [isRead ? 1 : 0, id]);
  return NextResponse.json({ ok: true });
}

// Admin: delete a message.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSchema();
  const { id } = await params;
  await getPool().query("DELETE FROM contact_messages WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}

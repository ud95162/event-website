import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { ensureSchema } from "../../../lib/schema";

const MIN_LENGTH = 6;

// POST { username, currentPassword, newPassword } — lets an organizer change their own
// password. The current password is verified server-side before anything is written.
export async function POST(req: NextRequest) {
  await ensureSchema();
  const { username, currentPassword, newPassword } = await req.json().catch(() => ({}));

  if (!username || !currentPassword || !newPassword) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (typeof newPassword !== "string" || newPassword.length < MIN_LENGTH) {
    return NextResponse.json({ error: `New password must be at least ${MIN_LENGTH} characters.` }, { status: 400 });
  }
  if (newPassword === currentPassword) {
    return NextResponse.json({ error: "New password must be different from the current one." }, { status: 400 });
  }

  const pool = getPool();
  const [rows] = await pool.query<any[]>(
    "SELECT id FROM organizers WHERE username = ? AND password = ? LIMIT 1",
    [username, currentPassword]
  );
  if (rows.length === 0) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
  }

  await pool.query("UPDATE organizers SET password = ? WHERE id = ?", [newPassword, rows[0].id]);
  return NextResponse.json({ ok: true });
}

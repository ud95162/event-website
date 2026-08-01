import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { ensureSchema } from "../../../lib/schema";

// Built-in admin account (organizers authenticate against the DB below).
const ADMIN = { username: "admin", password: "admin123" };

// POST { username, password } -> { username, role, orgName? } or 401.
export async function POST(req: NextRequest) {
  await ensureSchema();
  const { username, password } = await req.json().catch(() => ({}));
  if (!username || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  if (username === ADMIN.username && password === ADMIN.password) {
    return NextResponse.json({ username: ADMIN.username, role: "admin" });
  }

  const pool = getPool();
  const [rows] = await pool.query<any[]>(
    "SELECT name FROM organizers WHERE username = ? AND password = ? LIMIT 1",
    [username, password]
  );
  if (rows.length > 0) {
    return NextResponse.json({ username, role: "organizer", orgName: rows[0].name });
  }

  return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
}

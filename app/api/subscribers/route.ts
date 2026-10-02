import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../lib/db";
import { ensureSchema } from "../../lib/schema";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Admin: list all subscribers (newest first).
export async function GET() {
  await ensureSchema();
  const pool = getPool();
  const [rows] = await pool.query<any[]>("SELECT id, email, created_at AS createdAt FROM subscribers ORDER BY id DESC");
  return NextResponse.json(rows, { headers: { "Cache-Control": "no-store" } });
}

// Public: subscribe an email.
export async function POST(req: NextRequest) {
  await ensureSchema();
  const pool = getPool();
  const { email } = await req.json().catch(() => ({ email: "" }));
  const clean = (email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(clean)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  try {
    await pool.query("INSERT INTO subscribers (email) VALUES (?)", [clean]);
    return NextResponse.json({ ok: true, email: clean }, { status: 201 });
  } catch (e: any) {
    // Already subscribed — treat as success so we don't leak which emails exist.
    if (e?.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ ok: true, email: clean, already: true });
    }
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

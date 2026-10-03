import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../lib/db";
import { ensureSchema } from "../../lib/schema";
import { isAdminRequest } from "../../lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Light spam guard: at most 5 messages per IP per 10 minutes (per server process).
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 5;
}

// Public: the About page "Get in touch" form.
export async function POST(req: NextRequest) {
  await ensureSchema();
  const body = await req.json().catch(() => ({}));

  // Hidden "company" field — real visitors never fill it, bots do. Pretend success.
  if (typeof body.company === "string" && body.company.trim()) return NextResponse.json({ ok: true }, { status: 201 });

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const subject = String(body.subject ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !subject || !message) return NextResponse.json({ error: "Please fill in all the fields." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (name.length > 120 || email.length > 255 || subject.length > 200 || message.length > 5000) {
    return NextResponse.json({ error: "Your message is too long." }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return NextResponse.json({ error: "Too many messages — please try again in a few minutes." }, { status: 429 });

  await getPool().query(
    "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
    [name, email, subject, message]
  );
  return NextResponse.json({ ok: true }, { status: 201 });
}

// Admin: list messages, newest first.
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSchema();
  const [rows] = await getPool().query<any[]>(
    "SELECT id, name, email, subject, message, is_read AS isRead, created_at AS createdAt FROM contact_messages ORDER BY id DESC LIMIT 500"
  );
  return NextResponse.json(rows.map((r) => ({ ...r, isRead: !!r.isRead })), { headers: { "Cache-Control": "no-store" } });
}

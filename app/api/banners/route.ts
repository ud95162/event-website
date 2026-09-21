import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../lib/db";
import { ensureSchema } from "../../lib/schema";

export async function GET() {
  await ensureSchema();
  const pool = getPool();
  const [rows] = await pool.query<any[]>("SELECT id, url, event_id AS eventId, title, description FROM banners ORDER BY id");
  // Let browsers/CDN reuse the (large, image-heavy) response so repeat visits are instant.
  // Short freshness window keeps admin edits reflecting quickly; stale-while-revalidate
  // serves the cached copy immediately and refreshes in the background.
  return NextResponse.json(rows, {
    headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=300" },
  });
}

export async function POST(req: NextRequest) {
  await ensureSchema();
  const pool = getPool();
  const { url, eventId, title, description } = await req.json();
  const [result] = await pool.query<any>(
    "INSERT INTO banners (url, event_id, title, description) VALUES (?, ?, ?, ?)",
    [url, eventId ?? null, title ?? null, description ?? null]
  );
  return NextResponse.json({ id: result.insertId, url, eventId: eventId ?? null, title: title ?? null, description: description ?? null }, { status: 201 });
}

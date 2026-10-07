import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../lib/db";
import { selectBanners } from "../../lib/banners";
import { ensureSchema } from "../../lib/schema";

export async function GET() {
  await ensureSchema();
  // Short cache: the list is small now (pictures are URLs), and admin edits (like linking a banner
  // to an event) should show up on the site within seconds, not minutes.
  return NextResponse.json(await selectBanners(), {
    headers: { "Cache-Control": "public, max-age=10, stale-while-revalidate=30" },
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
  return NextResponse.json((await selectBanners(result.insertId))[0], { status: 201 });
}

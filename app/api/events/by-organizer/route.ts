import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { ensureSchema } from "../../../lib/schema";
import { imgMarker } from "../../../lib/select";
import { imgUrl } from "../../../lib/images";
import { isEventPast, eventStartMs } from "../../../lib/eventTime";

// A few of an organizer's finished events (most recent first), for the organizer card on an
// event page. Query: organizer (exact name), exclude (event id to leave out), limit (default 3, max 6).
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const organizer = (sp.get("organizer") ?? "").trim();
  const exclude = parseInt(sp.get("exclude") ?? "", 10) || 0;
  const limit = Math.min(Math.max(parseInt(sp.get("limit") ?? "", 10) || 3, 1), 6);
  if (!organizer) return NextResponse.json([]);

  await ensureSchema();
  const [rows] = await getPool().query<any[]>(
    `SELECT id, title, date, start_time, end_date, end_time, location, ${imgMarker("image")} FROM events WHERE organizer = ?`,
    [organizer]
  );

  const now = Date.now();
  const past = rows
    .filter((r) => r.id !== exclude)
    .map((r) => ({ r, t: { date: r.date, startTime: r.start_time ?? "", endDate: r.end_date ?? "", endTime: r.end_time ?? "" } }))
    .filter(({ t }) => isEventPast(t, now))
    .sort((a, b) => eventStartMs(b.t) - eventStartMs(a.t))
    .slice(0, limit)
    .map(({ r }) => ({ id: r.id, title: r.title, date: r.date, location: r.location, image: imgUrl("events", r.id, "image", r.image) }));

  return NextResponse.json(past, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
}

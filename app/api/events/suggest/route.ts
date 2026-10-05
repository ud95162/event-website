import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { ensureSchema } from "../../../lib/schema";

// Event-name suggestions for the search bar. Reads only a few text columns (never the pictures)
// and returns at most `limit` matches, best matches first.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") ?? "").trim().toLowerCase();
  const limit = Math.min(Math.max(parseInt(sp.get("limit") ?? "", 10) || 6, 1), 10);
  if (q.length < 2) return NextResponse.json([]);

  await ensureSchema();
  const [rows] = await getPool().query<any[]>("SELECT id, title, date, location, tag FROM events");

  const score = (r: any): number => {
    const t = String(r.title ?? "").toLowerCase();
    if (t.startsWith(q)) return 0;                                   // title starts with it
    if (t.split(/\s+/).some((w) => w.startsWith(q))) return 1;       // a word in the title starts with it
    if (t.includes(q)) return 2;                                     // title contains it
    if (String(r.tag ?? "").toLowerCase().includes(q) || String(r.location ?? "").toLowerCase().includes(q)) return 3;
    return -1;
  };

  const hits = rows
    .map((r) => ({ r, s: score(r) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => a.s - b.s || b.r.id - a.r.id)
    .slice(0, limit)
    .map(({ r }) => ({ id: r.id, title: r.title, date: r.date, location: r.location, tag: r.tag }));

  return NextResponse.json(hits, { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" } });
}

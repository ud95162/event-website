import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../../lib/db";
import { ensureSchema } from "../../../../lib/schema";
import { mapEventRow } from "../../../../lib/mappers";
import { slugify } from "../../../../lib/slug";

// Fetch a single event by its title-slug so the detail page doesn't need the whole
// events table loaded just to find one by slug. A cheap id/title scan resolves the
// slug; one query returns the full row (with image).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await ensureSchema();
  const { slug } = await params;
  const pool = getPool();

  const [meta] = await pool.query<any[]>("SELECT id, title FROM events");
  const match = meta.find((r) => slugify(r.title) === slug);
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [rows] = await pool.query<any[]>("SELECT * FROM events WHERE id = ?", [match.id]);
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(mapEventRow(rows[0]), {
    headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=300" },
  });
}

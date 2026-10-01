import { NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { ensureSchema } from "../../../lib/schema";
import { mapArtistRow } from "../../../lib/mappers";

// Home-only endpoint: the few artists the landing page shows. Excludes `members`
// (base64 band photos) like the main list, and returns only featured artists
// (falling back to the first few) so the payload stays tiny.
export async function GET() {
  await ensureSchema();
  const pool = getPool();

  let [rows] = await pool.query<any[]>("SELECT * FROM artists WHERE featured = 1 ORDER BY id");
  if (!rows.length) {
    [rows] = await pool.query<any[]>("SELECT * FROM artists ORDER BY id LIMIT 8");
  }

  const list = rows.map((r) => {
    const { members, ...rest } = mapArtistRow(r);
    void members;
    return rest;
  });

  return NextResponse.json(list, {
    headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=300" },
  });
}

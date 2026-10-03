import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../lib/db";
import { imgMarker } from "../../lib/select";
import { ensureSchema } from "../../lib/schema";
import { imgUrl, isInternalImg } from "../../lib/images";

// Swap stored base64 pictures for small /api/img/ URLs.
const mapOrg = (r: any) => ({
  ...r,
  logo: imgUrl("organizers", r.id, "logo", r.logo),
  banner: imgUrl("organizers", r.id, "banner", r.banner),
});

export async function GET() {
  await ensureSchema();
  const pool = getPool();
  // Note: `password` is deliberately never selected — credentials stay server-side.
  const [rows] = await pool.query<any[]>(
    `SELECT id, name, ${imgMarker("logo")}, description, ${imgMarker("banner")}, email, phone, username FROM organizers ORDER BY id`
  );
  return NextResponse.json(rows.map(mapOrg), {
    headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=300" },
  });
}

export async function POST(req: NextRequest) {
  await ensureSchema();
  const pool = getPool();
  const { name, logo, description, banner, email, phone, username, password } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  await pool.query(
    `INSERT INTO organizers (name, logo, description, banner, email, phone, username, password)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       logo = IF(?, logo, VALUES(logo)), description = VALUES(description), banner = IF(?, banner, VALUES(banner)),
       email = VALUES(email), phone = VALUES(phone), username = VALUES(username),
       password = COALESCE(NULLIF(VALUES(password), ''), password)`,
    [name, logo ?? null, description ?? null, banner ?? null, email ?? null, phone ?? null, username ?? null, password ?? null, isInternalImg(logo) ? 1 : 0, isInternalImg(banner) ? 1 : 0]
  );
  const [rows] = await pool.query<any[]>(
    `SELECT id, name, ${imgMarker("logo")}, description, ${imgMarker("banner")}, email, phone, username FROM organizers WHERE name = ?`,
    [name]
  );
  return NextResponse.json(mapOrg(rows[0]), { status: 201 });
}

export async function DELETE(req: NextRequest) {
  await ensureSchema();
  const pool = getPool();
  const url = new URL(req.url);
  let name = url.searchParams.get("name");
  if (!name) {
    try { name = (await req.json()).name; } catch { /* ignore */ }
  }
  if (name) await pool.query("DELETE FROM organizers WHERE name = ?", [name]);
  return NextResponse.json({ ok: true });
}

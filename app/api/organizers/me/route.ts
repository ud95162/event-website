import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { ensureSchema } from "../../../lib/schema";
import { getAuth } from "../../../lib/auth";
import { imgUrl, keepImg, keepImgParams } from "../../../lib/images";
import { imgMarker } from "../../../lib/select";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SELECT = `SELECT id, name, ${imgMarker("logo")}, description, ${imgMarker("banner")}, email, phone, username FROM organizers WHERE id = ?`;
const mapOrg = (r: any) => ({
  ...r,
  logo: imgUrl("organizers", r.id, "logo", r.logo),
  banner: imgUrl("organizers", r.id, "banner", r.banner),
});

// The signed-in organizer's own record. Identity comes from the signed token (organizer id),
// not from a name sent by the browser, so a renamed organizer or a stale session can't mismatch.
async function currentOrganizer(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth || auth.role !== "organizer" || !auth.oid) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const [rows] = await getPool().query<any[]>(SELECT, [auth.oid]);
  if (rows.length === 0) return { error: NextResponse.json({ error: "Organizer not found" }, { status: 404 }) };
  return { id: auth.oid, row: rows[0] };
}

export async function GET(req: NextRequest) {
  await ensureSchema();
  const cur = await currentOrganizer(req);
  if (cur.error) return cur.error;
  return NextResponse.json(mapOrg(cur.row), { headers: { "Cache-Control": "no-store" } });
}

// Organizers may change their own logo, banner, description, email and phone.
// Name and username stay under the admin's control.
export async function PUT(req: NextRequest) {
  await ensureSchema();
  const cur = await currentOrganizer(req);
  if (cur.error) return cur.error;

  const b = await req.json().catch(() => ({}));
  const description = b.description ? String(b.description).slice(0, 4000) : null;
  const email = b.email ? String(b.email).trim() : null;
  const phone = b.phone ? String(b.phone).trim() : null;
  if (email && (!EMAIL_RE.test(email) || email.length > 255)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (phone && phone.length > 50) return NextResponse.json({ error: "Phone number is too long." }, { status: 400 });

  await getPool().query(
    `UPDATE organizers SET ${keepImg("logo")}, ${keepImg("banner")}, description = ?, email = ?, phone = ? WHERE id = ?`,
    [...keepImgParams(b.logo), ...keepImgParams(b.banner), description, email, phone, cur.id]
  );
  const [rows] = await getPool().query<any[]>(SELECT, [cur.id]);
  return NextResponse.json(mapOrg(rows[0]));
}

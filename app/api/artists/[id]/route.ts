import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { cols } from "../../../lib/select";
import { ensureSchema } from "../../../lib/schema";
import { mapArtistRow } from "../../../lib/mappers";
import { keepImg, keepImgParams } from "../../../lib/images";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSchema();
  const { id } = await params;
  const pool = getPool();
  // Full record including `members` (omitted from the list endpoint for payload size).
  const [rows] = await pool.query<any[]>(`SELECT ${await cols("artists")} FROM artists WHERE id = ?`, [id]);
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(mapArtistRow(rows[0]), {
    headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=300" },
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSchema();
  const { id } = await params;
  const pool = getPool();
  const a = await req.json();
  await pool.query(
    `UPDATE artists SET
       name=?, stage_name=?, real_name=?, role=?, ${keepImg("image")}, ${keepImg("banner_image")}, bio=?,
       genres=?, sub_genres=?, bpm_min=?, bpm_max=?, is_dj=?, city=?, touring_region=?,
       soundcloud_url=?, spotify_url=?, beatport_url=?, instagram_url=?, tiktok_url=?,
       youtube_url=?, booking_contact=?, similar_artists=?, rating=?,
       bpm=?, social_links=?, booking_email=?, booking_phone=?, level=?, featured=?, artist_type=?, members=?
     WHERE id=?`,
    [
      a.name, a.stageName ?? null, a.realName ?? null, a.role,
      ...keepImgParams(a.image), ...keepImgParams(a.bannerImage), a.bio,
      JSON.stringify(a.genres ?? []), JSON.stringify(a.subGenres ?? []),
      a.bpmMin ?? null, a.bpmMax ?? null, a.isDJ ? 1 : 0,
      a.city ?? null, a.touringRegion ?? null,
      a.soundcloudUrl ?? null, a.spotifyUrl ?? null, a.beatportUrl ?? null,
      a.instagramUrl ?? null, a.tiktokUrl ?? null, a.youtubeUrl ?? null,
      a.bookingContact ?? null, JSON.stringify(a.similarArtists ?? []),
      a.rating ?? null,
      a.bpm ?? null, JSON.stringify(a.socialLinks ?? []),
      a.bookingEmail ?? null, a.bookingPhone ?? null, a.level ?? null, a.featured ? 1 : 0,
      a.artistType ?? null, JSON.stringify(a.members ?? []), id,
    ]
  );
  const [rows] = await pool.query<any[]>(`SELECT ${await cols("artists")} FROM artists WHERE id = ?`, [id]);
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(mapArtistRow(rows[0]));
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSchema();
  const { id } = await params;
  const pool = getPool();
  await pool.query("DELETE FROM artists WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}

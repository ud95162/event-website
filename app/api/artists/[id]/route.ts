import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { ensureSchema } from "../../../lib/schema";
import { mapArtistRow } from "../../../lib/mappers";

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
       name=?, stage_name=?, real_name=?, role=?, image=?, banner_image=?, bio=?,
       genres=?, sub_genres=?, bpm_min=?, bpm_max=?, is_dj=?, city=?, touring_region=?,
       soundcloud_url=?, spotify_url=?, beatport_url=?, instagram_url=?, tiktok_url=?,
       youtube_url=?, booking_contact=?, similar_artists=?, rating=?
     WHERE id=?`,
    [
      a.name, a.stageName ?? null, a.realName ?? null, a.role,
      a.image, a.bannerImage ?? null, a.bio,
      JSON.stringify(a.genres ?? []), JSON.stringify(a.subGenres ?? []),
      a.bpmMin ?? null, a.bpmMax ?? null, a.isDJ ? 1 : 0,
      a.city ?? null, a.touringRegion ?? null,
      a.soundcloudUrl ?? null, a.spotifyUrl ?? null, a.beatportUrl ?? null,
      a.instagramUrl ?? null, a.tiktokUrl ?? null, a.youtubeUrl ?? null,
      a.bookingContact ?? null, JSON.stringify(a.similarArtists ?? []),
      a.rating ?? null, id,
    ]
  );
  const [rows] = await pool.query<any[]>("SELECT * FROM artists WHERE id = ?", [id]);
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

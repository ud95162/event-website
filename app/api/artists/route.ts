import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../lib/db";
import { cols } from "../../lib/select";
import { ensureSchema } from "../../lib/schema";
import { mapArtistRow } from "../../lib/mappers";

export async function GET() {
  await ensureSchema();
  const pool = getPool();
  // Exclude `members` from the list: it holds base64 band-member photos (the bulk of
  // the payload) that only the artist detail page uses. Dropping it keeps this shared
  // response small so the home "Featured Artists" section loads instantly. The detail
  // page fetches the full record (with members) from /api/artists/[id].
  const [rows] = await pool.query<any[]>(`SELECT ${await cols("artists")} FROM artists ORDER BY id`);
  const list = rows.map((r) => {
    const { members, ...rest } = mapArtistRow(r);
    void members;
    return rest;
  });
  return NextResponse.json(list, {
    headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=300" },
  });
}

export async function POST(req: NextRequest) {
  await ensureSchema();
  const pool = getPool();
  const a = await req.json();
  const [result] = await pool.query<any>(
    `INSERT INTO artists
       (name, stage_name, real_name, role, image, banner_image, bio, genres, sub_genres,
        bpm_min, bpm_max, is_dj, city, touring_region, soundcloud_url, spotify_url, beatport_url,
        instagram_url, tiktok_url, youtube_url, booking_contact, similar_artists, rating,
        bpm, social_links, booking_email, booking_phone, level, featured, artist_type, members)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      a.name, a.stageName ?? null, a.realName ?? null, a.role,
      a.image, a.bannerImage ?? null, a.bio,
      JSON.stringify(a.genres ?? []), JSON.stringify(a.subGenres ?? []),
      a.bpmMin ?? null, a.bpmMax ?? null, a.isDJ ? 1 : 0,
      a.city ?? null, a.touringRegion ?? null,
      a.soundcloudUrl ?? null, a.spotifyUrl ?? null, a.beatportUrl ?? null,
      a.instagramUrl ?? null, a.tiktokUrl ?? null, a.youtubeUrl ?? null,
      a.bookingContact ?? null, JSON.stringify(a.similarArtists ?? []),
      a.rating ?? null,
      a.bpm ?? null, JSON.stringify(a.socialLinks ?? []),
      a.bookingEmail ?? null, a.bookingPhone ?? null, a.level ?? null, a.featured ? 1 : 0,
      a.artistType ?? null, JSON.stringify(a.members ?? []),
    ]
  );
  const [rows] = await pool.query<any[]>(`SELECT ${await cols("artists")} FROM artists WHERE id = ?`, [result.insertId]);
  return NextResponse.json(mapArtistRow(rows[0]), { status: 201 });
}

// Maps snake_case DB rows to the camelCase shapes the frontend expects.

function parseJson(v: any, fallback: any) {
  if (v == null) return fallback;
  if (Array.isArray(v) || typeof v === "object") return v;
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
}

export function mapEventRow(r: any) {
  return {
    id: r.id,
    tag: r.tag,
    title: r.title,
    date: r.date,
    location: r.location,
    price: r.price,
    image: r.image,
    badge: r.badge ?? null,
    lat: r.lat,
    lon: r.lon,
    description: r.description,
    venue: r.venue,
    organizer: r.organizer,
    lineup: parseJson(r.lineup, []),
    genres: parseJson(r.genres, []),
    tickets: parseJson(r.tickets, []),
    status: r.status ?? "",
    startTime: r.start_time ?? "",
    endDate: r.end_date ?? "",
    endTime: r.end_time ?? "",
    ageRestriction: r.age_restriction ?? "",
    capacity: r.capacity ?? null,
    venueType: r.venue_type ?? "",
    coOrganizers: parseJson(r.co_organizers, []),
    videoTrailer: r.video_trailer ?? "",
    externalLink: r.external_link ?? "",
  };
}

export function mapArtistRow(r: any) {
  return {
    id: r.id,
    name: r.name,
    stageName: r.stage_name ?? undefined,
    realName: r.real_name ?? undefined,
    role: r.role,
    image: r.image,
    bannerImage: r.banner_image ?? undefined,
    bio: r.bio,
    genres: parseJson(r.genres, []),
    subGenres: parseJson(r.sub_genres, []),
    bpmMin: r.bpm_min ?? null,
    bpmMax: r.bpm_max ?? null,
    isDJ: !!r.is_dj,
    city: r.city ?? undefined,
    touringRegion: r.touring_region ?? undefined,
    soundcloudUrl: r.soundcloud_url ?? undefined,
    spotifyUrl: r.spotify_url ?? undefined,
    beatportUrl: r.beatport_url ?? undefined,
    instagramUrl: r.instagram_url ?? undefined,
    tiktokUrl: r.tiktok_url ?? undefined,
    youtubeUrl: r.youtube_url ?? undefined,
    bookingContact: r.booking_contact ?? undefined,
    similarArtists: parseJson(r.similar_artists, []),
    rating: r.rating ?? undefined,
    bpm: r.bpm ?? null,
    socialLinks: parseJson(r.social_links, []),
    bookingEmail: r.booking_email ?? undefined,
    bookingPhone: r.booking_phone ?? undefined,
    level: r.level ?? undefined,
  };
}

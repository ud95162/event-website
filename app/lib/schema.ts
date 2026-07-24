import { getPool } from "./db";
import { events as seedEvents } from "../data/events";
import { artists as seedArtists } from "../data/artists";

const SEED_ORGANIZERS = [
  "Rhythm Nation LK",
  "Colombo Live Events",
  "Stage One Entertainment",
  "Bass Nation LK",
  "Eventide Productions",
  "Sunset Events",
];

const SEED_GENRES = [
  "electronic", "sinhala", "tamil", "hindi", "acoustic",
  "pop", "rock", "indie", "classical", "fusion", "soul", "r&b",
];

const SEED_BADGES = ["HOT", "NEW", "COMING SOON"];

const SEED_BANNERS = [
  { id: 1, url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1600&q=80&fit=crop" },
  { id: 2, url: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1600&q=80&fit=crop" },
  { id: 3, url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=80&fit=crop" },
];

let initPromise: Promise<void> | null = null;

async function createAndSeed(): Promise<void> {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id INT PRIMARY KEY AUTO_INCREMENT,
      tag VARCHAR(255),
      title VARCHAR(255),
      date VARCHAR(255),
      location VARCHAR(255),
      price VARCHAR(255),
      image MEDIUMTEXT,
      badge VARCHAR(255) NULL,
      lat DOUBLE,
      lon DOUBLE,
      description TEXT,
      venue VARCHAR(255),
      organizer VARCHAR(255),
      lineup JSON,
      genres JSON,
      tickets JSON,
      status VARCHAR(50),
      start_time VARCHAR(20),
      end_date VARCHAR(255),
      end_time VARCHAR(20),
      age_restriction VARCHAR(50),
      capacity INT,
      venue_type VARCHAR(20),
      co_organizers JSON,
      video_trailer MEDIUMTEXT,
      external_link TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  // Migration: add columns to pre-existing events tables (idempotent).
  const addColumn = async (name: string, ddl: string) => {
    const [rows] = await pool.query<any[]>(
      "SELECT COUNT(*) AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'events' AND COLUMN_NAME = ?",
      [name]
    );
    if (rows[0].c === 0) await pool.query(`ALTER TABLE events ADD COLUMN ${ddl}`);
  };
  await addColumn("tickets", "tickets JSON");
  await addColumn("status", "status VARCHAR(50)");
  await addColumn("start_time", "start_time VARCHAR(20)");
  await addColumn("end_date", "end_date VARCHAR(255)");
  await addColumn("end_time", "end_time VARCHAR(20)");
  await addColumn("age_restriction", "age_restriction VARCHAR(50)");
  await addColumn("capacity", "capacity INT");
  await addColumn("venue_type", "venue_type VARCHAR(20)");
  await addColumn("co_organizers", "co_organizers JSON");
  await addColumn("video_trailer", "video_trailer MEDIUMTEXT");
  await addColumn("external_link", "external_link TEXT");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS artists (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255),
      stage_name VARCHAR(255),
      real_name VARCHAR(255),
      role VARCHAR(255),
      image MEDIUMTEXT,
      banner_image MEDIUMTEXT,
      bio TEXT,
      genres JSON,
      sub_genres JSON,
      bpm_min INT NULL,
      bpm_max INT NULL,
      is_dj BOOLEAN,
      city VARCHAR(255),
      touring_region VARCHAR(255),
      soundcloud_url VARCHAR(512),
      spotify_url VARCHAR(512),
      beatport_url VARCHAR(512),
      instagram_url VARCHAR(512),
      tiktok_url VARCHAR(512),
      youtube_url VARCHAR(512),
      booking_contact VARCHAR(255),
      similar_artists JSON,
      rating FLOAT,
      bpm INT NULL,
      social_links JSON,
      booking_email VARCHAR(255),
      booking_phone VARCHAR(255),
      level VARCHAR(50)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  // Migration: add new artist columns to pre-existing tables (idempotent).
  const addArtistCol = async (name: string, ddl: string) => {
    const [rows] = await pool.query<any[]>(
      "SELECT COUNT(*) AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'artists' AND COLUMN_NAME = ?",
      [name]
    );
    if (rows[0].c === 0) await pool.query(`ALTER TABLE artists ADD COLUMN ${ddl}`);
  };
  await addArtistCol("bpm", "bpm INT NULL");
  await addArtistCol("social_links", "social_links JSON");
  await addArtistCol("booking_email", "booking_email VARCHAR(255)");
  await addArtistCol("booking_phone", "booking_phone VARCHAR(255)");
  await addArtistCol("level", "level VARCHAR(50)");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS organizers (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) UNIQUE,
      logo MEDIUMTEXT,
      description TEXT,
      banner MEDIUMTEXT,
      email VARCHAR(255),
      phone VARCHAR(50)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  // Idempotent migration for pre-existing organizers tables (id + name only).
  // Works on both MySQL (no ADD COLUMN IF NOT EXISTS) and MariaDB: probe
  // information_schema first, then add any missing column.
  for (const [name, type] of [
    ["logo", "MEDIUMTEXT"],
    ["description", "TEXT"],
    ["banner", "MEDIUMTEXT"],
    ["email", "VARCHAR(255)"],
    ["phone", "VARCHAR(50)"],
  ] as const) {
    try {
      const [cols] = await pool.query<any[]>(
        `SELECT COUNT(*) AS c FROM information_schema.COLUMNS
           WHERE TABLE_SCHEMA = DATABASE()
             AND TABLE_NAME = 'organizers'
             AND COLUMN_NAME = ?`,
        [name]
      );
      if (cols[0].c === 0) {
        await pool.query(`ALTER TABLE organizers ADD COLUMN ${name} ${type}`);
      }
    } catch { /* ignore — column likely already exists */ }
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS genres (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) UNIQUE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS badges (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) UNIQUE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS banners (
      id INT PRIMARY KEY AUTO_INCREMENT,
      url MEDIUMTEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  // Analytics counters: page views + link clicks per event/organizer.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS analytics (
      id INT PRIMARY KEY AUTO_INCREMENT,
      entity_type VARCHAR(20),   -- 'event' | 'organizer'
      entity_id INT,
      metric VARCHAR(20),        -- 'view' | 'link_click'
      count INT DEFAULT 0,
      UNIQUE KEY uniq_metric (entity_type, entity_id, metric)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  // ---- Seed events ----
  const [evRows] = await pool.query<any[]>("SELECT COUNT(*) AS c FROM events");
  if (evRows[0].c === 0) {
    for (const e of seedEvents) {
      await pool.query(
        `INSERT INTO events
          (id, tag, title, date, location, price, image, badge, lat, lon, description, venue, organizer, lineup, genres)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          e.id, e.tag, e.title, e.date, e.location, e.price, e.image, e.badge,
          e.lat, e.lon, e.description, e.venue, e.organizer,
          JSON.stringify(e.lineup), JSON.stringify(e.genres),
        ]
      );
    }
  }

  // ---- Seed artists ----
  const [arRows] = await pool.query<any[]>("SELECT COUNT(*) AS c FROM artists");
  if (arRows[0].c === 0) {
    for (const a of seedArtists) {
      await pool.query(
        `INSERT INTO artists
          (id, name, stage_name, real_name, role, image, banner_image, bio, genres, sub_genres,
           bpm_min, bpm_max, is_dj, city, touring_region, soundcloud_url, spotify_url, beatport_url,
           instagram_url, tiktok_url, youtube_url, booking_contact, similar_artists, rating)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          a.id, a.name, a.stageName ?? null, a.realName ?? null, a.role,
          a.image, a.bannerImage ?? null, a.bio,
          JSON.stringify(a.genres ?? []), JSON.stringify(a.subGenres ?? []),
          a.bpmMin ?? null, a.bpmMax ?? null, a.isDJ ? 1 : 0,
          a.city ?? null, a.touringRegion ?? null,
          a.soundcloudUrl ?? null, a.spotifyUrl ?? null, a.beatportUrl ?? null,
          a.instagramUrl ?? null, a.tiktokUrl ?? null, a.youtubeUrl ?? null,
          a.bookingContact ?? null, JSON.stringify(a.similarArtists ?? []),
          a.rating ?? null,
        ]
      );
    }
  }

  // ---- Seed organizers ----
  const [orgRows] = await pool.query<any[]>("SELECT COUNT(*) AS c FROM organizers");
  if (orgRows[0].c === 0) {
    for (const name of SEED_ORGANIZERS) {
      await pool.query("INSERT IGNORE INTO organizers (name) VALUES (?)", [name]);
    }
  }

  // ---- Seed genres ----
  const [gnRows] = await pool.query<any[]>("SELECT COUNT(*) AS c FROM genres");
  if (gnRows[0].c === 0) {
    for (const name of SEED_GENRES) {
      await pool.query("INSERT IGNORE INTO genres (name) VALUES (?)", [name]);
    }
  }

  // ---- Seed badges ----
  const [bgRows] = await pool.query<any[]>("SELECT COUNT(*) AS c FROM badges");
  if (bgRows[0].c === 0) {
    for (const name of SEED_BADGES) {
      await pool.query("INSERT IGNORE INTO badges (name) VALUES (?)", [name]);
    }
  }

  // ---- Seed banners ----
  const [bnRows] = await pool.query<any[]>("SELECT COUNT(*) AS c FROM banners");
  if (bnRows[0].c === 0) {
    for (const b of SEED_BANNERS) {
      await pool.query("INSERT INTO banners (id, url) VALUES (?, ?)", [b.id, b.url]);
    }
  }
}

export async function ensureSchema(): Promise<void> {
  if (!initPromise) {
    initPromise = createAndSeed().catch((err) => {
      // Reset so a later request can retry after a transient failure.
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

export type SocialLink = {
  platform: string;   // e.g. "Facebook", "Instagram", "TikTok"
  url:      string;
};

export type Artist = {
  id:              number;
  name:            string;   // kept for backward compat (used as stageName fallback)
  stageName?:      string;
  realName?:       string;
  role:            string;
  image:           string;
  bannerImage?:    string;
  bio:             string;
  genres?:         string[];
  subGenres?:      string[];
  bpm?:            number | null;   // single BPM value (Beats Per Minute)
  isDJ?:           boolean;
  city?:           string;
  touringRegion?:  string;
  soundcloudUrl?:  string;
  spotifyUrl?:     string;
  beatportUrl?:    string;
  socialLinks?:    SocialLink[];    // dynamic, any-platform social links
  bookingEmail?:   string;
  bookingPhone?:   string;
  level?:          string;          // e.g. "Emerging", "Established", "Headliner" — drives recommendations
  rating?:         number;          // 0–5
  // ── deprecated (kept for backward compat with older stored data) ──
  bpmMin?:         number | null;
  bpmMax?:         number | null;
  instagramUrl?:   string;
  tiktokUrl?:      string;
  youtubeUrl?:     string;
  bookingContact?: string;
  similarArtists?: string[];
};

// Predefined, expandable genre list for the artist genre dropdown.
// Shared genre list — used by the artist and organizer-facing dropdowns.
// Easy to extend: add new genres to this array.
export const ARTIST_GENRES = [
  "Progressive House", "House", "Mainstream Electronic", "Techno", "Psytrance",
  "Tech House", "Afro House", "Disco House", "Big Room", "Drum & Bass (D&B)", "Dubstep",
  "Deep House", "Melodic House & Techno", "Minimal / Deep Tech", "Trance", "Hard Techno",
  "Future House", "Bass House", "Electro House", "Trap", "Hip-Hop / R&B", "Amapiano",
  "Commercial / Top 40", "Nu-Disco", "Funky / Groove", "Garage / UK Garage", "Hardstyle",
  "Ambient / Downtempo", "Live Band", "Acoustic", "Reggae / Dancehall",
];

// Artist levels (drives automatic recommendations alongside shared genres).
export const ARTIST_LEVELS = ["Emerging", "Established", "Headliner"];

export const artists: Artist[] = [
  {
    id: 1, name: "DJ Nova", stageName: "DJ Nova", realName: "Naveen Jayawardena",
    role: "EDM / HOUSE MUSIC",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=80&fit=crop",
    bio: "Known for electrifying performances and festival energy across Asia.",
    genres: ["House", "EDM", "Electronic"],
    subGenres: ["Progressive House", "Big Room"],
    isDJ: true, bpmMin: 126, bpmMax: 134,
    city: "Colombo", touringRegion: "South Asia",
    soundcloudUrl: "https://soundcloud.com/djnova",
    spotifyUrl: "https://open.spotify.com/artist/djnova",
    beatportUrl: "https://www.beatport.com/artist/dj-nova",
    instagramUrl: "https://instagram.com/djnova",
    tiktokUrl: "https://tiktok.com/@djnova",
    youtubeUrl: "https://youtube.com/@djnova",
    bookingContact: "bookings@djnova.lk",
    similarArtists: ["Martin Garrix", "Afrojack", "Hardwell"],
    rating: 4.8,
  },
  {
    id: 2, name: "Randhir Witana", stageName: "Randhir Witana", realName: "Randhir Witana",
    role: "SRI LANKAN MUSICAL ARTIST",
    image: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=600&q=80&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1600&q=80&fit=crop",
    bio: "Award-winning vocalist with soulful live performances.",
    genres: ["Pop", "Sinhala", "Soul"],
    subGenres: ["Contemporary Pop", "Baila"],
    isDJ: false,
    city: "Colombo", touringRegion: "South Asia",
    instagramUrl: "https://instagram.com/randhirwitana",
    youtubeUrl: "https://youtube.com/@randhirwitana",
    bookingContact: "randhir@stageoneentertainment.lk",
    similarArtists: ["Sanuka Wickramasinghe", "T.M. Jayarathna"],
    rating: 4.6,
  },
  {
    id: 3, name: "Maya Perera", stageName: "Maya Perera", realName: "Maya Dilhara Perera",
    role: "POP & ACOUSTIC ARTIST",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80&fit=crop",
    bio: "Enchanting voice and heartfelt songwriting loved by millions.",
    genres: ["Pop", "Acoustic", "Indie"],
    subGenres: ["Singer-Songwriter", "Folk Pop"],
    isDJ: false,
    city: "Kandy", touringRegion: "South Asia",
    spotifyUrl: "https://open.spotify.com/artist/mayaperera",
    instagramUrl: "https://instagram.com/mayaperera",
    youtubeUrl: "https://youtube.com/@mayaperera",
    bookingContact: "maya@rhythmnationlk.com",
    similarArtists: ["Yohani", "Shelan", "Bathiya & Santhush"],
    rating: 4.5,
  },
  {
    id: 4, name: "Ashanthi Dias", stageName: "Ashanthi Dias", realName: "Ashanthi Tharaka Dias",
    role: "SRI LANKAN MUSICAL ARTIST",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&q=80&fit=crop",
    bio: "An energetic fusion artist bringing modern and classic hits together.",
    genres: ["Fusion", "Pop", "Classical"],
    subGenres: ["Contemporary Fusion", "Traditional"],
    isDJ: false,
    city: "Colombo", touringRegion: "International",
    instagramUrl: "https://instagram.com/ashanthidias",
    youtubeUrl: "https://youtube.com/@ashanthidias",
    bookingContact: "booking@ashanthi.lk",
    similarArtists: ["Randhir Witana", "Bathiya & Santhush"],
    rating: 4.7,
  },
  {
    id: 5, name: "Kasun Silva", stageName: "Kasun Silva", realName: "Kasun Nilantha Silva",
    role: "ROCK & INDIE ARTIST",
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80&fit=crop",
    bio: "Raw guitar energy meets indie soul in every unforgettable set.",
    genres: ["Rock", "Indie", "Alternative"],
    subGenres: ["Indie Rock", "Garage Rock"],
    isDJ: false,
    city: "Galle", touringRegion: "South Asia",
    soundcloudUrl: "https://soundcloud.com/kasunsilva",
    instagramUrl: "https://instagram.com/kasunsilvamusic",
    youtubeUrl: "https://youtube.com/@kasunsilvamusic",
    bookingContact: "kasun@colomboliveevents.lk",
    similarArtists: ["Silhouette", "Dominos Band"],
    rating: 4.3,
  },
  {
    id: 6, name: "Nadia Fernando", stageName: "Nadia Fernando", realName: "Nadia Tharushka Fernando",
    role: "R&B / SOUL ARTIST",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80&fit=crop",
    bio: "Smooth R&B grooves and powerful vocals that move any crowd.",
    genres: ["R&B", "Soul", "Neo-Soul"],
    subGenres: ["Contemporary R&B", "Jazz-Soul"],
    isDJ: false,
    city: "Colombo", touringRegion: "International",
    spotifyUrl: "https://open.spotify.com/artist/nadiafernando",
    instagramUrl: "https://instagram.com/nadiafernandoofficial",
    tiktokUrl: "https://tiktok.com/@nadiafernando",
    youtubeUrl: "https://youtube.com/@nadiafernando",
    bookingContact: "nadia@sunsetevents.lk",
    similarArtists: ["Erykah Badu", "Jhené Aiko"],
    rating: 4.9,
  },
  {
    id: 7, name: "The Beat Crew", stageName: "The Beat Crew", realName: "The Beat Crew (Band)",
    role: "LIVE BAND",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80&fit=crop",
    bio: "A high-energy live band delivering non-stop rhythm and soul.",
    genres: ["Funk", "Pop", "Dance"],
    subGenres: ["Afrobeat Fusion", "Top 40 Covers"],
    isDJ: false,
    city: "Colombo", touringRegion: "South Asia",
    instagramUrl: "https://instagram.com/thebeatscrewlk",
    youtubeUrl: "https://youtube.com/@thebeatcrew",
    bookingContact: "bookings@thebeatcrew.lk",
    similarArtists: ["Flashback Band", "Mirage"],
    rating: 4.4,
  },
  {
    id: 8, name: "Hiruni De Silva", stageName: "Hiruni De Silva", realName: "Hiruni Chandani De Silva",
    role: "CLASSICAL FUSION ARTIST",
    image: "https://images.unsplash.com/photo-1574701148212-8518049f735f?w=600&q=80&fit=crop",
    bio: "Bridging classical heritage with contemporary sounds beautifully.",
    genres: ["Classical", "Fusion", "World"],
    subGenres: ["Carnatic Fusion", "Contemporary Classical"],
    isDJ: false,
    city: "Kandy", touringRegion: "International",
    youtubeUrl: "https://youtube.com/@hirunidesilva",
    spotifyUrl: "https://open.spotify.com/artist/hirunidesilva",
    bookingContact: "hiruni@eventideproductions.lk",
    similarArtists: ["A.R. Rahman", "Anoushka Shankar"],
    rating: 4.8,
  },
];

export const getArtistsByNames = (names: string[]): Artist[] =>
  names.map(name => artists.find(a => (a.stageName || a.name) === name || a.name === name)).filter(Boolean) as Artist[];

export const getArtistById = (id: number) => artists.find(a => a.id === id) ?? null;

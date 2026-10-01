"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Event } from "../data/events";
import { Artist } from "../data/artists";

export type { Event, Artist };

export type Banner = {
  id: number;
  url: string;
  eventId?: number | null;   // event the banner's "Explore Event" CTA links to (date/venue come from it)
  title?: string | null;     // banner's own headline
  description?: string | null; // banner's own description
  // Linked event's metadata, joined by the API so the Hero needs no full events list.
  eventTitle?: string | null;
  eventDescription?: string | null;
  eventDate?: string | null;
  eventVenue?: string | null;
  eventLocation?: string | null;
  eventTag?: string | null;
};

export type Brand = {
  id: number;
  name: string;
  logo: string;   // uploaded logo image (base64 / URL)
};

export type PopupSettings = {
  enabled: boolean;
  title: string;
  mode: "auto" | "manual";   // auto = events happening this week; manual = admin-selected
};

const DEFAULT_POPUP: PopupSettings = { enabled: true, title: "Happening This Week", mode: "auto" };

export type Organizer = {
  id: number;
  name: string;
  logo?: string;
  description?: string;
  banner?: string;
  email?: string;
  phone?: string;
  username?: string;   // organizer login username
  password?: string;   // write-only; never returned by the API (blank on edit = keep current)
};

type AdminDataContextType = {
  loading: boolean;
  events: Event[];
  artists: Artist[];
  // Small home-page subsets, loaded eagerly on every route (the full `events`/`artists`
  // lists are only fetched off the home page to keep the landing payload tiny).
  featuredEvents: Event[];
  featuredArtists: Artist[];
  organizers: Organizer[];
  genres: string[];
  badges: string[];
  banners: Banner[];
  brands: Brand[];
  popupSettings: PopupSettings;
  updatePopupSettings: (s: PopupSettings) => Promise<boolean>;

  // Events CRUD (add/update resolve true on success, false if the request failed)
  addEvent: (ev: Omit<Event, "id">) => Promise<boolean>;
  updateEvent: (ev: Event) => Promise<boolean>;
  deleteEvent: (id: number) => void;

  // Artists CRUD
  addArtist: (a: Omit<Artist, "id">) => Promise<boolean>;
  updateArtist: (a: Artist) => Promise<boolean>;
  deleteArtist: (id: number) => void;

  // Organizers CRUD
  addOrganizer: (o: Omit<Organizer, "id">) => Promise<boolean>;
  updateOrganizer: (o: Organizer) => Promise<boolean>;
  deleteOrganizer: (id: number) => void;

  // Genres CRUD
  addGenre: (name: string) => void;
  deleteGenre: (name: string) => void;

  // Badges
  addBadge: (name: string) => void;
  deleteBadge: (name: string) => void;

  // Banners CRUD
  addBanner: (data: Omit<Banner, "id">) => Promise<boolean>;
  updateBanner: (b: Banner) => Promise<boolean>;
  deleteBanner: (id: number) => void;

  // Brands CRUD
  addBrand: (data: Omit<Brand, "id">) => Promise<boolean>;
  deleteBrand: (id: number) => void;
};

const AdminDataContext = createContext<AdminDataContextType | null>(null);

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`Request failed: ${url} (${res.status})`);
  return res.json();
}

// Lightweight client cache so repeat visits render instantly, then update when the
// fresh data arrives. Guarded against SSR, private mode and quota limits.
const CACHE_PREFIX = "adx_cache_";
function readCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try { const s = localStorage.getItem(CACHE_PREFIX + key); return s ? (JSON.parse(s) as T) : null; }
  catch { return null; }
}
function writeCache(key: string, data: unknown) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data)); }
  catch { /* quota exceeded / private mode — fall back to network + HTTP cache */ }
}

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The full events list is the heavy one (base64 images). Skip it on the home page, the
  // /events listing (uses /api/events/category + /search + /all) and event detail (use
  // /api/events/by-slug). The small artists list is skipped only where it isn't needed
  // (home + /events listing) — event detail still loads it to resolve the lineup.
  // /calendar fetches its events per-month, but still needs the (small) artists list for
  // its artist filter options, so only events are skipped there.
  const skipEvents = pathname === "/" || pathname.startsWith("/events") || pathname === "/calendar";
  const skipArtists = pathname === "/" || pathname === "/events";

  const [events, setEvents] = useState<Event[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [featuredArtists, setFeaturedArtists] = useState<Artist[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [popupSettings, setPopupSettings] = useState<PopupSettings>(DEFAULT_POPUP);
  const [loading, setLoading] = useState(true);

  const lightStarted = useRef(false);
  const eventsStarted = useRef(false);
  const artistsStarted = useRef(false);

  // Hydrate instantly from the last-good cache (once), so repeat visits render immediately.
  useEffect(() => {
    const ce = readCache<Event[]>("events");     if (ce?.length) setEvents(ce);
    const ca = readCache<Artist[]>("artists");    if (ca?.length) setArtists(ca);
    const cfe = readCache<Event[]>("featuredEvents");   if (cfe?.length) setFeaturedEvents(cfe);
    const cfa = readCache<Artist[]>("featuredArtists");  if (cfa?.length) setFeaturedArtists(cfa);
    const cb = readCache<Banner[]>("banners");    if (cb) setBanners(cb);
    const cbr = readCache<Brand[]>("brands");     if (cbr) setBrands(cbr);
    const co = readCache<Organizer[]>("organizers"); if (co) setOrganizers(co);
    const cg = readCache<string[]>("genres");     if (cg) setGenres(cg);
    const cbd = readCache<string[]>("badges");    if (cbd) setBadges(cbd);
    const cp = readCache<PopupSettings>("popup"); if (cp) setPopupSettings({ ...DEFAULT_POPUP, ...cp });
  }, []);

  // Load data for the current view. Light collections + the small home subsets load on
  // every route; the FULL events/artists lists (heavy base64 images) load only once the
  // user is off the home page — so the landing page never pulls the whole events table.
  useEffect(() => {
    const jobs: Promise<unknown>[] = [];

    if (!lightStarted.current) {
      lightStarted.current = true;
      jobs.push(
        jsonFetch<Event[]>("/api/events/featured").then((d) => { setFeaturedEvents(d); writeCache("featuredEvents", d); }),
        jsonFetch<Artist[]>("/api/artists/featured").then((d) => { setFeaturedArtists(d); writeCache("featuredArtists", d); }),
        jsonFetch<Organizer[]>("/api/organizers").then((d) => { setOrganizers(d); writeCache("organizers", d); }),
        jsonFetch<string[]>("/api/genres").then((d) => { setGenres(d); writeCache("genres", d); }),
        jsonFetch<string[]>("/api/badges").then((d) => { setBadges(d); writeCache("badges", d); }),
        jsonFetch<Banner[]>("/api/banners").then((d) => { setBanners(d); writeCache("banners", d); }),
        jsonFetch<Brand[]>("/api/brands").then((d) => { setBrands(d); writeCache("brands", d); }),
        jsonFetch<PopupSettings | null>("/api/settings/popup").then((s) => { if (s) { setPopupSettings({ ...DEFAULT_POPUP, ...s }); writeCache("popup", s); } }),
      );
    }

    if (!skipEvents && !eventsStarted.current) {
      eventsStarted.current = true;
      jobs.push(jsonFetch<Event[]>("/api/events").then((d) => { setEvents(d); writeCache("events", d); }));
    }

    if (!skipArtists && !artistsStarted.current) {
      artistsStarted.current = true;
      jobs.push(jsonFetch<Artist[]>("/api/artists").then((d) => { setArtists(d); writeCache("artists", d); }));
    }

    if (jobs.length) {
      setLoading(true);
      let active = true;
      Promise.allSettled(jobs).finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }
  }, [skipEvents, skipArtists]);

  // Background prefetch: once the first view is interactive, quietly warm the browser's
  // HTTP cache for the endpoints other pages use, so navigating to them is instant.
  // Runs once per app load, after idle, so it never competes with the critical data.
  const prefetchStarted = useRef(false);
  useEffect(() => {
    if (prefetchStarted.current) return;
    prefetchStarted.current = true;

    const warm = () => {
      const now = new Date();
      const y = now.getFullYear(), m = now.getMonth();
      const urls = [
        // /events category rows + first "All Events" page
        "/api/events/category?type=hot",
        "/api/events/category?type=upcoming",
        "/api/events/category?type=coming-soon",
        "/api/events/category?type=dj",
        "/api/events/category?type=genre&value=electronic",
        "/api/events/category?type=genre&value=sinhala",
        "/api/events/category?type=city&value=Colombo",
        "/api/events/all?offset=0&limit=6",
        // /calendar (current month)
        `/api/events/month?year=${y}&month=${m}`,
        // artists list used by /artists and the detail pages
        "/api/artists",
      ];
      // Note: the full /api/events (heavy base64 images) is intentionally NOT prefetched
      // here — only the organizer/detail event-lists need it, and they load it on demand.
      urls.forEach((u) => { fetch(u).catch(() => {}); });
    };

    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    };
    if (typeof w.requestIdleCallback === "function") w.requestIdleCallback(warm, { timeout: 4000 });
    else setTimeout(warm, 2500);
  }, []);

  const updatePopupSettings = async (s: PopupSettings): Promise<boolean> => {
    setPopupSettings(s);
    try {
      const res = await fetch("/api/settings/popup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  // ---- Events ----
  const addEvent = async (ev: Omit<Event, "id">): Promise<boolean> => {
    try {
      const created = await jsonFetch<Event>("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ev),
      });
      setEvents((prev) => [...prev, created]);
      return true;
    } catch {
      return false;
    }
  };
  const updateEvent = async (ev: Event): Promise<boolean> => {
    setEvents((prev) => prev.map((e) => (e.id === ev.id ? ev : e)));
    try {
      const updated = await jsonFetch<Event>(`/api/events/${ev.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ev),
      });
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      return true;
    } catch {
      return false;
    }
  };
  const deleteEvent = (id: number) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    fetch(`/api/events/${id}`, { method: "DELETE" }).catch(() => {});
  };

  // ---- Artists ----
  const addArtist = async (a: Omit<Artist, "id">): Promise<boolean> => {
    try {
      const created = await jsonFetch<Artist>("/api/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(a),
      });
      setArtists((prev) => [...prev, created]);
      return true;
    } catch {
      return false;
    }
  };
  const updateArtist = async (a: Artist): Promise<boolean> => {
    setArtists((prev) => prev.map((x) => (x.id === a.id ? a : x)));
    try {
      const updated = await jsonFetch<Artist>(`/api/artists/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(a),
      });
      setArtists((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      return true;
    } catch {
      return false;
    }
  };
  const deleteArtist = (id: number) => {
    setArtists((prev) => prev.filter((x) => x.id !== id));
    fetch(`/api/artists/${id}`, { method: "DELETE" }).catch(() => {});
  };

  // ---- Organizers ----
  const addOrganizer = async (o: Omit<Organizer, "id">): Promise<boolean> => {
    if (!o.name) return false;
    try {
      const created = await jsonFetch<Organizer>("/api/organizers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(o),
      });
      setOrganizers((prev) =>
        prev.some((x) => x.id === created.id)
          ? prev.map((x) => (x.id === created.id ? created : x))
          : [...prev, created]
      );
      return true;
    } catch {
      return false;
    }
  };
  const updateOrganizer = async (o: Organizer): Promise<boolean> => {
    setOrganizers((prev) => prev.map((x) => (x.id === o.id ? o : x)));
    try {
      const updated = await jsonFetch<Organizer>(`/api/organizers/${o.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(o),
      });
      setOrganizers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      return true;
    } catch {
      return false;
    }
  };
  const deleteOrganizer = (id: number) => {
    setOrganizers((prev) => prev.filter((o) => o.id !== id));
    fetch(`/api/organizers/${id}`, { method: "DELETE" }).catch(() => {});
  };

  // ---- Genres ----
  const addGenre = (name: string) => {
    const v = name.trim();
    if (!v || genres.some((g) => g.toLowerCase() === v.toLowerCase())) return;
    setGenres((prev) => [...prev, v]);
    fetch("/api/genres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: v }),
    }).catch(() => {});
  };
  const deleteGenre = (name: string) => {
    setGenres((prev) => prev.filter((g) => g !== name));
    fetch(`/api/genres?name=${encodeURIComponent(name)}`, { method: "DELETE" }).catch(() => {});
  };

  // ---- Badges ----
  const addBadge = (name: string) => {
    const v = name.trim().toUpperCase();
    if (!v || badges.some((b) => b.toUpperCase() === v)) return;
    setBadges((prev) => [...prev, v]);
    fetch("/api/badges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: v }),
    }).catch(() => {});
  };
  const deleteBadge = (name: string) => {
    setBadges((prev) => prev.filter((b) => b !== name));
    fetch(`/api/badges?name=${encodeURIComponent(name)}`, { method: "DELETE" }).catch(() => {});
  };

  // ---- Banners ----
  const addBanner = async (data: Omit<Banner, "id">): Promise<boolean> => {
    try {
      const created = await jsonFetch<Banner>("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setBanners((prev) => [...prev, created]);
      return true;
    } catch {
      return false;
    }
  };
  const updateBanner = async (b: Banner): Promise<boolean> => {
    setBanners((prev) => prev.map((x) => (x.id === b.id ? b : x)));
    try {
      const updated = await jsonFetch<Banner>(`/api/banners/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: b.url, eventId: b.eventId ?? null, title: b.title ?? null, description: b.description ?? null }),
      });
      setBanners((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      return true;
    } catch {
      return false;
    }
  };
  const deleteBanner = (id: number) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    fetch(`/api/banners/${id}`, { method: "DELETE" }).catch(() => {});
  };

  // ---- Brands ----
  const addBrand = async (data: Omit<Brand, "id">): Promise<boolean> => {
    try {
      const created = await jsonFetch<Brand>("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setBrands((prev) => [...prev, created]);
      return true;
    } catch {
      return false;
    }
  };
  const deleteBrand = (id: number) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
    fetch(`/api/brands/${id}`, { method: "DELETE" }).catch(() => {});
  };

  return (
    <AdminDataContext.Provider value={{
      loading,
      events, artists, featuredEvents, featuredArtists,
      organizers, genres, badges, banners, brands,
      popupSettings, updatePopupSettings,
      addEvent, updateEvent, deleteEvent,
      addArtist, updateArtist, deleteArtist,
      addOrganizer, updateOrganizer, deleteOrganizer,
      addGenre, deleteGenre,
      addBadge, deleteBadge,
      addBanner, updateBanner, deleteBanner,
      addBrand, deleteBrand,
    }}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used within AdminDataProvider");
  return ctx;
}

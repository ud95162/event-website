"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Event } from "../data/events";
import { Artist } from "../data/artists";

export type { Event, Artist };

export type Banner = {
  id: number;
  url: string;
  eventId?: number | null;   // event the banner's "Explore Event" CTA links to (date/venue come from it)
  title?: string | null;     // banner's own headline
  description?: string | null; // banner's own description
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
  organizers: Organizer[];
  genres: string[];
  badges: string[];
  banners: Banner[];
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
};

const AdminDataContext = createContext<AdminDataContextType | null>(null);

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`Request failed: ${url} (${res.status})`);
  return res.json();
}

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [popupSettings, setPopupSettings] = useState<PopupSettings>(DEFAULT_POPUP);
  const [loading, setLoading] = useState(true);

  // Initial load from the API.
  useEffect(() => {
    Promise.allSettled([
      jsonFetch<Event[]>("/api/events").then(setEvents),
      jsonFetch<Artist[]>("/api/artists").then(setArtists),
      jsonFetch<Organizer[]>("/api/organizers").then(setOrganizers),
      jsonFetch<string[]>("/api/genres").then(setGenres),
      jsonFetch<string[]>("/api/badges").then(setBadges),
      jsonFetch<Banner[]>("/api/banners").then(setBanners),
      jsonFetch<PopupSettings | null>("/api/settings/popup").then((s) => { if (s) setPopupSettings({ ...DEFAULT_POPUP, ...s }); }),
    ]).finally(() => setLoading(false));
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

  return (
    <AdminDataContext.Provider value={{
      loading,
      events, artists, organizers, genres, badges, banners,
      popupSettings, updatePopupSettings,
      addEvent, updateEvent, deleteEvent,
      addArtist, updateArtist, deleteArtist,
      addOrganizer, updateOrganizer, deleteOrganizer,
      addGenre, deleteGenre,
      addBadge, deleteBadge,
      addBanner, updateBanner, deleteBanner,
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

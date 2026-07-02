"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Event } from "../data/events";
import { Artist } from "../data/artists";

export type { Event, Artist };

export type Banner = {
  id: number;
  url: string;
};

export type Organizer = {
  id: number;
  name: string;
  logo?: string;
  description?: string;
  banner?: string;
};

type AdminDataContextType = {
  events: Event[];
  artists: Artist[];
  organizers: Organizer[];
  genres: string[];
  badges: string[];
  banners: Banner[];

  // Events CRUD
  addEvent: (ev: Omit<Event, "id">) => void;
  updateEvent: (ev: Event) => void;
  deleteEvent: (id: number) => void;

  // Artists CRUD
  addArtist: (a: Omit<Artist, "id">) => void;
  updateArtist: (a: Artist) => void;
  deleteArtist: (id: number) => void;

  // Organizers CRUD
  addOrganizer: (o: Omit<Organizer, "id">) => void;
  updateOrganizer: (o: Organizer) => void;
  deleteOrganizer: (id: number) => void;

  // Genres CRUD
  addGenre: (name: string) => void;
  deleteGenre: (name: string) => void;

  // Badges
  addBadge: (name: string) => void;
  deleteBadge: (name: string) => void;

  // Banners CRUD
  addBanner: (url: string) => void;
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

  // Initial load from the API.
  useEffect(() => {
    jsonFetch<Event[]>("/api/events").then(setEvents).catch(() => {});
    jsonFetch<Artist[]>("/api/artists").then(setArtists).catch(() => {});
    jsonFetch<Organizer[]>("/api/organizers").then(setOrganizers).catch(() => {});
    jsonFetch<string[]>("/api/genres").then(setGenres).catch(() => {});
    jsonFetch<string[]>("/api/badges").then(setBadges).catch(() => {});
    jsonFetch<Banner[]>("/api/banners").then(setBanners).catch(() => {});
  }, []);

  // ---- Events ----
  const addEvent = (ev: Omit<Event, "id">) => {
    jsonFetch<Event>("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ev),
    })
      .then((created) => setEvents((prev) => [...prev, created]))
      .catch(() => {});
  };
  const updateEvent = (ev: Event) => {
    setEvents((prev) => prev.map((e) => (e.id === ev.id ? ev : e)));
    jsonFetch<Event>(`/api/events/${ev.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ev),
    })
      .then((updated) => setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e))))
      .catch(() => {});
  };
  const deleteEvent = (id: number) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    fetch(`/api/events/${id}`, { method: "DELETE" }).catch(() => {});
  };

  // ---- Artists ----
  const addArtist = (a: Omit<Artist, "id">) => {
    jsonFetch<Artist>("/api/artists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(a),
    })
      .then((created) => setArtists((prev) => [...prev, created]))
      .catch(() => {});
  };
  const updateArtist = (a: Artist) => {
    setArtists((prev) => prev.map((x) => (x.id === a.id ? a : x)));
    jsonFetch<Artist>(`/api/artists/${a.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(a),
    })
      .then((updated) => setArtists((prev) => prev.map((x) => (x.id === updated.id ? updated : x))))
      .catch(() => {});
  };
  const deleteArtist = (id: number) => {
    setArtists((prev) => prev.filter((x) => x.id !== id));
    fetch(`/api/artists/${id}`, { method: "DELETE" }).catch(() => {});
  };

  // ---- Organizers ----
  const addOrganizer = (o: Omit<Organizer, "id">) => {
    if (!o.name) return;
    jsonFetch<Organizer>("/api/organizers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(o),
    })
      .then((created) =>
        setOrganizers((prev) =>
          prev.some((x) => x.id === created.id)
            ? prev.map((x) => (x.id === created.id ? created : x))
            : [...prev, created]
        )
      )
      .catch(() => {});
  };
  const updateOrganizer = (o: Organizer) => {
    setOrganizers((prev) => prev.map((x) => (x.id === o.id ? o : x)));
    jsonFetch<Organizer>(`/api/organizers/${o.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(o),
    })
      .then((updated) => setOrganizers((prev) => prev.map((x) => (x.id === updated.id ? updated : x))))
      .catch(() => {});
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
  const addBanner = (url: string) => {
    jsonFetch<Banner>("/api/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then((created) => setBanners((prev) => [...prev, created]))
      .catch(() => {});
  };
  const deleteBanner = (id: number) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    fetch(`/api/banners/${id}`, { method: "DELETE" }).catch(() => {});
  };

  return (
    <AdminDataContext.Provider value={{
      events, artists, organizers, genres, badges, banners,
      addEvent, updateEvent, deleteEvent,
      addArtist, updateArtist, deleteArtist,
      addOrganizer, updateOrganizer, deleteOrganizer,
      addGenre, deleteGenre,
      addBadge, deleteBadge,
      addBanner, deleteBanner,
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

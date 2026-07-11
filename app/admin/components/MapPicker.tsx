"use client";

import { useEffect, useRef, useState } from "react";
import { Search, MapPin, X } from "lucide-react";

type Props = {
  lat: number;
  lon: number;
  onChange: (lat: number, lon: number) => void;
};

// Leaflet is loaded from CDN at runtime (client only).
declare global { interface Window { L?: any } }

const DEFAULT_CENTER: [number, number] = [6.9271, 79.8612]; // Colombo

function loadLeaflet(): Promise<any> {
  return new Promise((resolve) => {
    if (window.L) { resolve(window.L); return; }
    // CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    // JS
    const existing = document.getElementById("leaflet-js") as HTMLScriptElement | null;
    if (existing) { existing.addEventListener("load", () => resolve(window.L)); return; }
    const script = document.createElement("script");
    script.id = "leaflet-js";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve(window.L);
    document.body.appendChild(script);
  });
}

export default function MapPicker({ lat, lon, onChange }: Props) {
  const mapEl   = useRef<HTMLDivElement>(null);
  const mapRef  = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [ready, setReady]   = useState(false);
  const [query, setQuery]   = useState("");
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState("");

  const hasCoords = !!(lat && lon);

  // Init map once Leaflet is loaded
  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !mapEl.current || mapRef.current) return;
      const center: [number, number] = hasCoords ? [lat, lon] : DEFAULT_CENTER;
      const map = L.map(mapEl.current).setView(center, hasCoords ? 14 : 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      if (hasCoords) {
        markerRef.current = L.marker([lat, lon]).addTo(map);
      }

      map.on("click", (e: any) => {
        const { lat: la, lng: lo } = e.latlng;
        setMarker(L, map, la, lo);
        onChange(Number(la.toFixed(6)), Number(lo.toFixed(6)));
      });

      mapRef.current = map;
      setReady(true);
      // Fix tile rendering inside flex/hidden containers
      setTimeout(() => map.invalidateSize(), 200);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setMarker = (L: any, map: any, la: number, lo: number) => {
    if (markerRef.current) markerRef.current.setLatLng([la, lo]);
    else markerRef.current = L.marker([la, lo]).addTo(map);
  };

  // Keep marker in sync when lat/lon change externally (e.g. edit load)
  useEffect(() => {
    if (!ready || !window.L || !mapRef.current) return;
    if (hasCoords) {
      setMarker(window.L, mapRef.current, lat, lon);
      mapRef.current.setView([lat, lon], Math.max(mapRef.current.getZoom(), 13));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lon, ready]);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchErr("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data.length) {
        const la = Number(parseFloat(data[0].lat).toFixed(6));
        const lo = Number(parseFloat(data[0].lon).toFixed(6));
        onChange(la, lo);
        if (mapRef.current && window.L) {
          setMarker(window.L, mapRef.current, la, lo);
          mapRef.current.setView([la, lo], 15);
        }
      } else {
        setSearchErr("No location found. Try a different search.");
      }
    } catch {
      setSearchErr("Search failed. Check your connection.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div>
      {/* Search bar */}
      <form onSubmit={search} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search a place, venue or address…"
            style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
          />
          {query && <button type="button" onClick={() => setQuery("")} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", display: "flex" }}><X size={12} /></button>}
        </div>
        <button type="submit" disabled={searching} style={{ padding: "9px 16px", borderRadius: 8, background: "#39BD69", border: "none", color: "#000", fontSize: 12, fontWeight: 700, cursor: searching ? "default" : "pointer", opacity: searching ? 0.6 : 1 }}>
          {searching ? "…" : "Find"}
        </button>
      </form>
      {searchErr && <p style={{ fontSize: 11, color: "#ef4444", marginBottom: 8 }}>{searchErr}</p>}

      {/* Map */}
      <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
        <div ref={mapEl} style={{ height: 320, width: "100%", background: "#111" }} />
        {!ready && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", fontSize: 13, pointerEvents: "none" }}>
            Loading map…
          </div>
        )}
      </div>

      {/* Coordinate readout */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
        <MapPin size={13} style={{ color: "#39BD69", flexShrink: 0 }} />
        {hasCoords ? (
          <span>Pinned at <strong style={{ color: "#fff" }}>{lat.toFixed(5)}, {lon.toFixed(5)}</strong> — click the map to move the pin.</span>
        ) : (
          <span>Click anywhere on the map or search above to drop a pin.</span>
        )}
      </div>
    </div>
  );
}

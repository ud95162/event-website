"use client";

import { useEffect, useRef, useState } from "react";
import { Search, MapPin, X } from "lucide-react";

type Props = {
  lat: number;
  lon: number;
  // place is the reverse-geocoded address; supplied whenever a pin is placed.
  onChange: (lat: number, lon: number, place?: { venue: string; location: string }) => void;
};

// Reverse-geocode coordinates → { venue (full address), location (city/town) }
async function reverseGeocode(lat: number, lon: number): Promise<{ venue: string; location: string } | undefined> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lon}`,
      { headers: { "Accept-Language": "en" } }
    );
    const d = await res.json();
    const a = d.address ?? {};
    const location = a.city || a.town || a.village || a.suburb || a.county || a.state || "";
    const venue = d.name || d.display_name || "";
    return { venue, location };
  } catch {
    return undefined;
  }
}

// Leaflet is loaded from CDN at runtime (client only).
declare global { interface Window { L?: any } }

const DEFAULT_CENTER: [number, number] = [6.9271, 79.8612]; // Colombo

// Brand-green pulsing pin, drawn as an HTML divIcon.
function pinIcon(L: any) {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:34px;height:34px;">
        <span style="position:absolute;left:50%;top:50%;width:34px;height:34px;transform:translate(-50%,-50%);border-radius:50%;background:rgba(57,189,105,0.3);animation:mp-ping 1.8s ease-out infinite;"></span>
        <span style="position:absolute;left:50%;top:50%;width:16px;height:16px;transform:translate(-50%,-50%);border-radius:50%;background:#39BD69;border:3px solid #0b0b10;box-shadow:0 0 0 2px rgba(57,189,105,0.6),0 4px 12px rgba(0,0,0,0.5);"></span>
      </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

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
  const [suggestions, setSuggestions] = useState<{ label: string; lat: number; lon: number; venue: string; location: string }[]>([]);
  const [showSug, setShowSug] = useState(false);
  const suppressRef = useRef(false); // skip fetch right after a pick

  const hasCoords = !!(lat && lon);

  // Debounced autocomplete suggestions from Nominatim
  useEffect(() => {
    if (suppressRef.current) { suppressRef.current = false; return; }
    const q = query.trim();
    if (q.length < 3) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=6&addressdetails=1&q=${encodeURIComponent(q)}`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        setSuggestions(
          data.map((d: any) => {
            const a = d.address ?? {};
            const place = d.name || a.attraction || a.building || a.road || (d.display_name || "").split(",")[0];
            const town  = a.city || a.town || a.village || a.suburb || a.county || a.state;
            const label = [place, town, a.country].filter(Boolean).filter((v, i, arr) => arr.indexOf(v) === i).join(", ");
            return {
              label: label || d.display_name,
              lat: Number(parseFloat(d.lat).toFixed(6)),
              lon: Number(parseFloat(d.lon).toFixed(6)),
              venue: d.display_name || place || "",
              location: town || "",
            };
          })
        );
        setShowSug(true);
      } catch { /* ignore */ }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const pickSuggestion = (s: { label: string; lat: number; lon: number; venue: string; location: string }) => {
    suppressRef.current = true;
    setQuery(s.label.split(",")[0]);
    setShowSug(false);
    setSuggestions([]);
    setSearchErr("");
    onChange(s.lat, s.lon, { venue: s.venue, location: s.location });
    if (mapRef.current && window.L) {
      setMarker(window.L, mapRef.current, s.lat, s.lon);
      mapRef.current.setView([s.lat, s.lon], 15);
    }
  };

  // Init map once Leaflet is loaded
  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !mapEl.current || mapRef.current) return;
      const center: [number, number] = hasCoords ? [lat, lon] : DEFAULT_CENTER;
      const map = L.map(mapEl.current, { zoomControl: false, attributionControl: false })
        .setView(center, hasCoords ? 14 : 11);
      // Standard OpenStreetMap tiles.
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);

      if (hasCoords) {
        markerRef.current = L.marker([lat, lon], { icon: pinIcon(L) }).addTo(map);
      }

      map.on("click", async (e: any) => {
        const la = Number(e.latlng.lat.toFixed(6));
        const lo = Number(e.latlng.lng.toFixed(6));
        setMarker(L, map, la, lo);
        onChange(la, lo);
        const place = await reverseGeocode(la, lo);
        if (place) onChange(la, lo, place);
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
    else markerRef.current = L.marker([la, lo], { icon: pinIcon(L) }).addTo(map);
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
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(query)}`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data.length) {
        const la = Number(parseFloat(data[0].lat).toFixed(6));
        const lo = Number(parseFloat(data[0].lon).toFixed(6));
        const a = data[0].address ?? {};
        const location = a.city || a.town || a.village || a.suburb || a.county || a.state || "";
        onChange(la, lo, { venue: data[0].display_name || "", location });
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
            onFocus={() => suggestions.length > 0 && setShowSug(true)}
            onBlur={() => setTimeout(() => setShowSug(false), 150)}
            placeholder="Search a place, venue or address…"
            autoComplete="off"
            style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
          />
          {query && <button type="button" onClick={() => { setQuery(""); setSuggestions([]); }} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", display: "flex" }}><X size={12} /></button>}

          {/* Autocomplete suggestions */}
          {showSug && suggestions.length > 0 && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 1000,
              background: "rgba(12,12,18,0.98)", backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, overflow: "hidden",
              boxShadow: "0 16px 40px rgba(0,0,0,0.6)", maxHeight: 240, overflowY: "auto",
            }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={e => { e.preventDefault(); pickSuggestion(s); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "flex-start", gap: 8,
                    padding: "9px 12px", background: "none", border: "none", cursor: "pointer",
                    textAlign: "left", borderBottom: i < suggestions.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  <MapPin size={12} style={{ color: "#39BD69", flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.35 }}>{s.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="submit" disabled={searching} style={{ padding: "9px 16px", borderRadius: 8, background: "#39BD69", border: "none", color: "#000", fontSize: 12, fontWeight: 700, cursor: searching ? "default" : "pointer", opacity: searching ? 0.6 : 1 }}>
          {searching ? "…" : "Find"}
        </button>
      </form>
      {searchErr && <p style={{ fontSize: 11, color: "#ef4444", marginBottom: 8 }}>{searchErr}</p>}

      {/* Map */}
      <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 12px 40px rgba(0,0,0,0.35)" }}>
        <div ref={mapEl} style={{ height: 360, width: "100%", background: "#0b0b10" }} />

        {/* Inner vignette for depth (doesn't block map clicks) */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: "inset 0 0 60px rgba(0,0,0,0.45)", borderRadius: 14 }} />

        {/* Coordinate chip — floating bottom-left */}
        {hasCoords && (
          <div style={{
            position: "absolute", left: 12, bottom: 12, zIndex: 500,
            display: "flex", alignItems: "center", gap: 7,
            padding: "7px 12px", borderRadius: 999,
            background: "rgba(11,11,16,0.82)", border: "1px solid rgba(57,189,105,0.35)",
            backdropFilter: "blur(8px)", fontSize: 11, fontWeight: 600, color: "#fff",
            fontVariantNumeric: "tabular-nums", boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
          }}>
            <MapPin size={12} style={{ color: "#39BD69" }} />
            {lat.toFixed(5)}, {lon.toFixed(5)}
          </div>
        )}

        {/* Hint pill — floating top-left */}
        <div style={{
          position: "absolute", left: 12, top: 12, zIndex: 500,
          padding: "6px 11px", borderRadius: 999,
          background: "rgba(11,11,16,0.75)", border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(8px)", fontSize: 10, fontWeight: 600, letterSpacing: "0.03em",
          color: "rgba(255,255,255,0.65)", pointerEvents: "none",
        }}>
          {hasCoords ? "Click the map to move the pin" : "Click the map or search to drop a pin"}
        </div>

        {!ready && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "rgba(255,255,255,0.4)", fontSize: 12, pointerEvents: "none", background: "#0b0b10", zIndex: 600 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.12)", borderTopColor: "#39BD69", animation: "mp-spin 0.8s linear infinite" }} />
            Loading map…
          </div>
        )}
      </div>

      {/* Map styling — pin pulse, spinner, dark Leaflet controls */}
      <style>{`
        @keyframes mp-ping { 0% { transform: translate(-50%,-50%) scale(0.6); opacity: 0.7 } 100% { transform: translate(-50%,-50%) scale(1.6); opacity: 0 } }
        @keyframes mp-spin { to { transform: rotate(360deg) } }
        .leaflet-control-zoom a {
          background: rgba(11,11,16,0.85) !important;
          color: #fff !important;
          border: 1px solid rgba(255,255,255,0.14) !important;
          backdrop-filter: blur(8px);
        }
        .leaflet-control-zoom a:hover { background: #39BD69 !important; color: #000 !important; }
        .leaflet-control-zoom { border: none !important; box-shadow: 0 6px 18px rgba(0,0,0,0.4); border-radius: 8px; overflow: hidden; margin: 12px !important; }
        .leaflet-container { font-family: inherit; }
      `}</style>
    </div>
  );
}

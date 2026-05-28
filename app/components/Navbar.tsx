"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, X, User, Music2, MapPin, Navigation, Search, ChevronDown } from "lucide-react";
import { useUserLocation, type UserLocation } from "../context/LocationContext";

const navLinks = [
  { label: "Home",     href: "#",        active: true  },
  { label: "Events",   href: "#events",  active: false },
  { label: "Artists",  href: "#artists", active: false },
  { label: "About Us", href: "#about",   active: false },
];

const POPULAR_CITIES: UserLocation[] = [
  { city: "Colombo",   country: "Sri Lanka",  lat:  6.9271,   lon:  79.8612 },
  { city: "Kandy",     country: "Sri Lanka",  lat:  7.2906,   lon:  80.6337 },
  { city: "Galle",     country: "Sri Lanka",  lat:  6.0329,   lon:  80.2168 },
  { city: "Negombo",   country: "Sri Lanka",  lat:  7.2094,   lon:  79.8385 },
  { city: "Jaffna",    country: "Sri Lanka",  lat:  9.6615,   lon:  80.0255 },
  { city: "Matara",    country: "Sri Lanka",  lat:  5.9485,   lon:  80.5353 },
  { city: "Dubai",     country: "UAE",        lat: 25.2048,   lon:  55.2708 },
  { city: "London",    country: "UK",         lat: 51.5074,   lon:  -0.1278 },
  { city: "Sydney",    country: "Australia",  lat:-33.8688,   lon: 151.2093 },
  { city: "Singapore", country: "Singapore",  lat:  1.3521,   lon: 103.8198 },
  { city: "Toronto",   country: "Canada",     lat: 43.6532,   lon: -79.3832 },
  { city: "Mumbai",    country: "India",      lat: 19.0760,   lon:  72.8777 },
];

/* ── Location Pill ─────────────────────────────────────────────────── */
function LocationPill() {
  const { userLocation, setUserLocation } = useUserLocation();
  const [detecting, setDetecting] = useState(false);
  const [open,      setOpen]      = useState(false);
  const [search,    setSearch]    = useState("");
  const [error,     setError]     = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const detect = () => {
    if (!navigator.geolocation) { setError("Geolocation not supported"); return; }
    setDetecting(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const city    = data.address?.city || data.address?.town || data.address?.village || "Unknown";
          const country = data.address?.country || "";
          setUserLocation({ city, country, lat, lon });
          setOpen(false);
          setSearch("");
        } catch {
          setError("Could not fetch location");
        } finally {
          setDetecting(false);
        }
      },
      () => { setError("Location access denied"); setDetecting(false); }
    );
  };

  const pick = (loc: UserLocation) => { setUserLocation(loc); setOpen(false); setSearch(""); setError(null); };

  const filtered = POPULAR_CITIES.filter(({ city, country }) =>
    `${city} ${country}`.toLowerCase().includes(search.toLowerCase())
  );

  const isSet = !!userLocation && !detecting;
  const label = userLocation ? `${userLocation.city}, ${userLocation.country}` : "Select City";

  return (
    <div ref={dropRef} className="relative">
      {/* ── Pill button ── */}
      <button
        onClick={() => { setOpen(o => !o); setSearch(""); setError(null); }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase transition-all duration-300"
        style={{
          border: isSet
            ? "1px solid rgba(57,189,105,0.6)"
            : "1px solid rgba(255,255,255,0.18)",
          background: isSet
            ? "rgba(57,189,105,0.08)"
            : "rgba(255,255,255,0.04)",
          color: isSet ? "#39BD69" : "rgba(255,255,255,0.6)",
          boxShadow: isSet ? "0 0 14px rgba(57,189,105,0.25)" : "none",
        }}
      >
        {detecting ? (
          /* Pulsing dot while detecting */
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39BD69] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#39BD69]" />
          </span>
        ) : (
          <MapPin size={11} strokeWidth={2.5} />
        )}
        <span>{detecting ? "Detecting…" : label}</span>
        <ChevronDown
          size={11}
          strokeWidth={2.5}
          className="transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div
          className="absolute top-full mt-2 right-0 w-72 rounded-2xl border border-white/10 overflow-hidden"
          style={{
            background: "rgba(10,10,20,0.97)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
            zIndex: 400,
          }}
        >
          {/* Auto-detect */}
          <button
            onClick={detect}
            disabled={detecting}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-white/08 hover:bg-white/05 transition-colors group"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(57,189,105,0.15)", border: "1px solid rgba(57,189,105,0.3)" }}
            >
              <Navigation size={12} className="text-[#39BD69]" />
            </div>
            <div className="text-left">
              <p className="text-white text-xs font-semibold tracking-wide">
                {detecting ? "Detecting your location…" : "Use my current location"}
              </p>
              <p className="text-white/35 text-[10px] mt-0.5">Via browser GPS</p>
            </div>
          </button>

          {error && (
            <p className="px-4 py-2 text-[10px] text-red-400">{error}</p>
          )}

          {/* Search */}
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}>
              <Search size={12} className="text-white/30 flex-shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search city…"
                className="bg-transparent text-white text-xs w-full outline-none placeholder:text-white/25 tracking-wide"
              />
            </div>
          </div>

          {/* City chips */}
          <div className="px-3 pb-3">
            <p className="text-white/25 text-[9px] font-bold tracking-[0.3em] uppercase mb-2 px-1">
              Popular Cities
            </p>
            <div className="flex flex-wrap gap-1.5">
              {filtered.map(({ city, country, lat, lon }) => {
                const isActive = userLocation?.city === city && userLocation?.country === country;
                return (
                  <button
                    key={`${city}-${country}`}
                    onClick={() => pick({ city, country, lat, lon })}
                    className="flex flex-col items-start px-3 py-1.5 rounded-xl text-left transition-all duration-200"
                    style={{
                      background: isActive ? "rgba(57,189,105,0.15)" : "rgba(255,255,255,0.05)",
                      border: isActive ? "1px solid rgba(57,189,105,0.45)" : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <span
                      className="text-[10px] font-semibold leading-tight"
                      style={{ color: isActive ? "#39BD69" : "rgba(255,255,255,0.8)" }}
                    >
                      {city}
                    </span>
                    <span className="text-[9px] leading-tight" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {country}
                    </span>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-white/25 text-[10px] px-1">No cities found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Navbar ─────────────────────────────────────────────────────────── */
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[300] bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
              <Music2 size={15} className="text-white" />
            </div>
            <div className="leading-none">
              <span className="text-white font-black text-sm tracking-[0.2em] uppercase">EVENTS</span>
              <br />
              <span className="text-white/40 text-[9px] tracking-[0.3em] uppercase">COMPANY</span>
            </div>
          </a>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href}
                className={`text-xs tracking-widest uppercase font-medium transition-colors duration-300 relative pb-1 ${
                  l.active
                    ? "text-white/55 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#e91e8c]"
                    : "text-white/55 hover:text-[#e91e8c]"
                }`}>
                {l.label}
              </a>
            ))}
          </div>

          {/* Right — Location pill + user + CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <LocationPill />
            <button className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-white/60 transition-colors">
              <User size={15} className="text-white/60" />
            </button>
            <button className="btn-outline text-xs px-6 py-2.5 rounded-full">
              GET UPDATES
            </button>
          </div>

          {/* Mobile toggle */}
          <button className="lg:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-black/95 border-t border-white/10 px-4 py-4">
          <div className="flex flex-col gap-3">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href}
                className="text-white/60 hover:text-white py-2 border-b border-white/5 text-sm tracking-widest uppercase transition-colors"
                onClick={() => setMobileOpen(false)}>
                {l.label}
              </a>
            ))}
            <div className="pt-1">
              <LocationPill />
            </div>
            <button className="btn-primary text-xs px-6 py-2.5 rounded-full mt-2 w-full">
              GET UPDATES
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

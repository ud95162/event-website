"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, X, User, Music2, MapPin, Navigation, Search, ChevronDown, Calendar } from "lucide-react";
import { useUserLocation, type UserLocation } from "../context/LocationContext";

const navLinks = [
  { label: "Home",     href: "/"          },
  { label: "Events",   href: "/events"    },
  { label: "Artists",  href: "/artists"   },
  { label: "About Us", href: "/about"     },
];

const POPULAR_CITIES: UserLocation[] = [
  { city: "Nugegoda",   country: "Sri Lanka", lat:  6.8728, lon:  79.8878 },
  { city: "Colombo",    country: "Sri Lanka", lat:  6.9271, lon:  79.8612 },
  { city: "Maharagama", country: "Sri Lanka", lat:  6.8478, lon:  79.9256 },
  { city: "Kandy",      country: "Sri Lanka", lat:  7.2906, lon:  80.6337 },
  { city: "Galle",      country: "Sri Lanka", lat:  6.0329, lon:  80.2168 },
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
      const target = e.target as Node;
      const inPill = dropRef.current?.contains(target);
      const inPortal = (target as Element)?.closest?.('[data-city-dropdown]');
      if (!inPill && !inPortal) { setOpen(false); setSearch(""); }
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

  const inputRef = useRef<HTMLInputElement>(null);
  const pillRef  = useRef<HTMLDivElement>(null);
  const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    if (open && pillRef.current) {
      const r = pillRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 8, left: r.left, width: Math.max(r.width, 288) });
    }
  }, [open]);

  return (
    <div ref={dropRef} className="relative">
      {/* ── Inline search pill ── */}
      <div
        ref={pillRef}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-300"
        style={{
          border: isSet ? "1px solid rgba(57,189,105,0.6)" : "1px solid rgba(255,255,255,0.18)",
          background: isSet ? "rgba(57,189,105,0.08)" : "rgba(255,255,255,0.04)",
          boxShadow: isSet ? "0 0 14px rgba(57,189,105,0.25)" : "none",
          minWidth: 360,
        }}
      >
        {detecting ? (
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39BD69] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#39BD69]" />
          </span>
        ) : (
          <MapPin size={13} strokeWidth={2.5} className="flex-shrink-0" style={{ color: isSet ? "#39BD69" : "rgba(255,255,255,0.4)" }} />
        )}
        <input
          ref={inputRef}
          value={isSet && !open ? label : search}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => { setOpen(true); if (isSet) setSearch(""); }}
          placeholder="SELECT CITY..."
          className="bg-transparent text-base font-bold tracking-widest uppercase w-full outline-none placeholder:text-white/35"
          style={{ color: isSet ? "#39BD69" : "rgba(255,255,255,0.7)" }}
        />
        {isSet && (
          <button
            onClick={e => { e.stopPropagation(); setUserLocation(null); setSearch(""); setOpen(false); }}
            className="flex-shrink-0 text-white/30 hover:text-white/70 transition-colors"
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* ── Dropdown suggestions — portalled to body ── */}
      {open && dropPos && typeof document !== "undefined" && createPortal(
        <div
          data-city-dropdown=""
          className="rounded-2xl border border-white/10 overflow-hidden"
          style={{
            position: "fixed",
            top: dropPos.top,
            left: dropPos.left,
            width: dropPos.width,
            background: "rgba(10,10,20,0.97)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
            zIndex: 9999,
          }}
        >
          {/* Auto-detect */}
          <button
            onClick={detect}
            disabled={detecting}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-white/08 hover:bg-white/05 transition-colors"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(57,189,105,0.15)", border: "1px solid rgba(57,189,105,0.3)" }}
            >
              <Navigation size={12} className="text-[#39BD69]" />
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-semibold tracking-wide">
                {detecting ? "Detecting your location…" : "Use my current location"}
              </p>
              <p className="text-white/35 text-[12px] mt-0.5">Via browser GPS</p>
            </div>
          </button>

          {error && <p className="px-4 py-2 text-[12px] text-red-400">{error}</p>}

          {/* City chips */}
          <div className="px-3 py-3">
            <p className="text-white/25 text-[11px] font-bold tracking-[0.3em] uppercase mb-2 px-1">Popular Cities</p>
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
                    <span className="text-[12px] font-semibold leading-tight" style={{ color: isActive ? "#39BD69" : "rgba(255,255,255,0.8)" }}>
                      {city}
                    </span>
                    <span className="text-[11px] leading-tight" style={{ color: "rgba(255,255,255,0.3)" }}>{country}</span>
                  </button>
                );
              })}
              {filtered.length === 0 && <p className="text-white/25 text-[12px] px-1">No cities found</p>}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ── Calendar Picker ────────────────────────────────────────────────── */
function CalendarPicker() {
  const pathname = usePathname();
  const isActive = pathname === "/calendar";
  return (
    <Link
      href="/calendar"
      title="Events Calendar"
      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
      style={{
        background: isActive ? "rgba(57,189,105,0.12)" : "rgba(255,255,255,0.04)",
        border: isActive ? "1px solid rgba(57,189,105,0.5)" : "1px solid rgba(255,255,255,0.15)",
        boxShadow: isActive ? "0 0 12px rgba(57,189,105,0.2)" : "none",
        color: isActive ? "#39BD69" : "rgba(255,255,255,0.6)",
      }}
    >
      <Calendar size={15} />
    </Link>
  );
}

/* ── Navbar ─────────────────────────────────────────────────────────── */
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/events")  return pathname === "/events"  || pathname.startsWith("/events/");
    if (href === "/artists") return pathname === "/artists" || pathname.startsWith("/artists/");
    if (href === "/about")   return pathname === "/about";
    if (href === "/")        return pathname === "/";
    return false;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[300] bg-black/80 backdrop-blur-md border-b border-white/10">
      <style>{`
        @keyframes nav-spin {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .nav-active-border {
          position: relative;
          padding: 2px;
          border-radius: 0.75rem;
          display: inline-flex;
          overflow: hidden;
          box-shadow: 0 0 14px rgba(57,189,105,0.2);
        }
        .nav-border-spinner {
          position: absolute;
          width: 200%;
          height: 500%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: conic-gradient(#39BD69, #e91e8c, #39BD69);
          animation: nav-spin 2.5s linear infinite;
          z-index: 0;
        }
        .nav-active-inner {
          position: relative;
          z-index: 1;
          background: #080808;
          border-radius: calc(0.75rem - 2px);
          width: 100%;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <div className="leading-none flex items-baseline gap-0.5">
              <span className="text-white font-black text-2xl tracking-[0.2em] uppercase">EVENTS</span>
              <span className="text-white/40 text-base tracking-[0.15em] uppercase">.LK</span>
            </div>
          </Link>

          {/* All nav items — equal gap between every item */}
          <div className="hidden lg:flex items-center justify-between flex-1 ml-24">
            {navLinks.map((l) => (
              isActive(l.href) ? (
                <div key={l.label} className="nav-active-border">
                  <div className="nav-border-spinner" />
                  <Link href={l.href} className="nav-active-inner text-base tracking-widest uppercase font-bold px-4 py-1.5">
                    <span style={{ color: "#ffffff" }}>{l.label}</span>
                  </Link>
                </div>
              ) : (
                <Link key={l.label} href={l.href}
                  className="text-base tracking-widest uppercase font-bold transition-all duration-300 px-4 py-1.5 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.6)",
                  }}>
                  {l.label}
                </Link>
              )
            ))}
            <LocationPill />
            <CalendarPicker />
            <button className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-white/60 transition-colors">
              <User size={15} className="text-white/60" />
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
              <Link key={l.label} href={l.href}
                className="text-white/60 hover:text-white py-2 border-b border-white/5 text-base tracking-widest uppercase transition-colors"
                onClick={() => setMobileOpen(false)}>
                {l.label}
              </Link>
            ))}
            <div className="pt-1">
              <LocationPill />
            </div>
            <CalendarPicker />
          </div>
        </div>
      )}
    </nav>
  );
}

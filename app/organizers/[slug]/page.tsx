"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, MapPin, Calendar, Music2, ArrowRight, Building2 } from "lucide-react";
import { useAdminData } from "../../context/AdminDataContext";
import { useUserLocation, haversineKm, formatDistance } from "../../context/LocationContext";
import { eventSlug, organizerSlug } from "../../lib/slug";
import { fromPrice } from "../../lib/price";
import Navbar from "../../components/Navbar";
import StickySearchFilters from "../../components/StickySearchFilters";
import ParticleField from "../../components/ParticleField";

export default function OrganizerDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const slug    = String(params.slug);
  const { organizers, events, loading } = useAdminData();
  const { userLocation } = useUserLocation();
  const organizer = organizers.find(o => organizerSlug(o) === slug) ?? null;

  const [imgError, setImgError] = useState(false);

  if (loading && !organizer) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#080808]">
        <div className="w-8 h-8 rounded-full border-2 border-white/15 border-t-[#39BD69] animate-spin mb-4" />
        <p className="text-white/30 text-xs tracking-widest uppercase">Loading organizer…</p>
      </main>
    );
  }

  if (!organizer) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#080808]">
        <p className="text-white/40 text-sm mb-4">Organizer not found.</p>
        <button onClick={() => router.push("/events")} className="btn-outline text-xs px-8 py-3 rounded-full">
          BROWSE EVENTS
        </button>
      </main>
    );
  }

  const orgEvents = events.filter(ev => ev.organizer === organizer.name);
  const hasBanner = !!organizer.banner;

  return (
    <main className="bg-[#080808] relative" style={{ height: "100dvh", overflowY: "auto" }}>
      <ParticleField />
      <Navbar />

      <div className="pt-16 relative z-10">
        <StickySearchFilters />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Back */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/45 text-xs tracking-widest uppercase mb-8 hover:text-white transition-colors group"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>

          {/* Hero — banner background with logo + name */}
          <div
            className="w-full rounded-3xl overflow-hidden relative mb-10"
            style={{ minHeight: 300, border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}
          >
            {hasBanner ? (
              <img src={organizer.banner} alt={`${organizer.name} banner`} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(57,189,105,0.15) 0%, rgba(8,8,8,1) 70%)" }} />
            )}
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,8,8,0.97) 0%, rgba(8,8,8,0.55) 45%, rgba(8,8,8,0.3) 100%)" }} />

            <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end gap-5">
              {/* Logo */}
              <div
                className="flex-shrink-0 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{ width: 110, height: 110, border: "3px solid rgba(255,255,255,0.9)", background: "#0a0a0a", boxShadow: "0 12px 40px rgba(0,0,0,0.6)" }}
              >
                {organizer.logo && !imgError ? (
                  <img src={organizer.logo} alt={organizer.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
                ) : (
                  <span style={{ fontSize: 44, fontWeight: 900, color: "#39BD69" }}>{organizer.name.charAt(0)}</span>
                )}
              </div>

              <div className="min-w-0 pb-1">
                <p className="text-white/35 text-[10px] font-bold tracking-[0.45em] uppercase mb-2 flex items-center gap-1.5">
                  <Building2 size={11} /> Event Organizer
                </p>
                <h1 className="text-white font-black text-4xl lg:text-5xl uppercase tracking-tight leading-none">
                  {organizer.name}
                </h1>
                <p className="text-white/40 text-xs mt-2">
                  {orgEvents.length} event{orgEvents.length !== 1 ? "s" : ""} organized
                </p>
              </div>
            </div>
          </div>

          {/* About */}
          {organizer.description && (
            <div className="mb-10">
              <p className="text-white/30 text-[10px] font-bold tracking-[0.35em] uppercase mb-3">About</p>
              <p className="text-white/65 text-sm leading-relaxed max-w-3xl">{organizer.description}</p>
            </div>
          )}

          {/* Events by this organizer */}
          <div className="pb-20">
            <p className="text-white/30 text-[10px] font-bold tracking-[0.35em] uppercase mb-4">Events by {organizer.name}</p>
            {orgEvents.length > 0 ? (
              <div className="flex flex-col gap-3">
                {orgEvents.map(event => {
                  const distance = userLocation
                    ? haversineKm(userLocation.lat, userLocation.lon, event.lat, event.lon)
                    : null;
                  return (
                    <div
                      key={event.id}
                      onClick={() => router.push(`/events/${eventSlug(event)}`)}
                      className="flex items-center gap-4 rounded-2xl p-4 cursor-pointer group transition-all duration-200"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(57,189,105,0.05)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(57,189,105,0.2)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)"; }}
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover object-top" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#39BD69] text-[8px] font-bold tracking-[0.3em] uppercase mb-0.5">{event.tag}</p>
                        <h3 className="text-white font-black text-sm uppercase tracking-wide leading-tight mb-1 truncate">{event.title}</h3>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1 text-white/35 text-[10px]"><Calendar size={9} className="text-white/25" /> {event.date}</div>
                          <div className="flex items-center gap-1 text-white/35 text-[10px]"><MapPin size={9} className="text-white/25" /> {event.location}</div>
                          {distance !== null && <span className="text-[#39BD69] text-[10px] font-semibold">{formatDistance(distance)}</span>}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-white/50 text-[11px] font-semibold mb-1">{fromPrice(event.tickets, event.price)}</p>
                        <ArrowRight size={14} className="text-white/25 group-hover:text-[#39BD69] group-hover:translate-x-0.5 transition-all duration-200 ml-auto" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <Music2 size={20} className="text-white/15 mx-auto mb-2" />
                <p className="text-white/25 text-sm">No events from this organizer yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

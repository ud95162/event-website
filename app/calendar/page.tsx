"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { events } from "../data/events";
import Navbar from "../components/Navbar";
import StickySearchFilters from "../components/StickySearchFilters";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

/* Parse "27 August 2025" → Date */
function parseEventDate(str: string): Date | null {
  try {
    return new Date(str);
  } catch {
    return null;
  }
}

export default function CalendarPage() {
  const router = useRouter();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  /* Group events by day for this month/year */
  const eventsByDay: Record<number, typeof events> = {};
  events.forEach(ev => {
    const d = parseEventDate(ev.date);
    if (d && d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(ev);
    }
  });

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday   = () => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));

  return (
    <div style={{ height: "100dvh", overflow: "hidden", background: "#080808", color: "#fff", display: "flex", flexDirection: "column" }}>
      <Navbar />

      {/* Calendar area — same horizontal margin as navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full" style={{ flex: 1, marginTop: 64, overflow: "hidden", display: "flex", flexDirection: "column", paddingTop: "clamp(12px, 2vh, 28px)", paddingBottom: "clamp(12px, 2vh, 28px)" }}>

        {/* Search bar — same as home page */}
        <StickySearchFilters />

        {/* Month nav + Today */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "clamp(8px, 1.5vh, 20px) 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={prevMonth} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronLeft size={16} />
            </button>
            <h1 style={{ fontSize: "clamp(1.2rem, 2.5vw, 2rem)", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {MONTHS[month]} <span style={{ color: "rgba(255,255,255,0.35)" }}>{year}</span>
            </h1>
            <button onClick={nextMonth} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronRight size={16} />
            </button>
          </div>
          <button onClick={goToday} style={{ padding: "6px 16px", borderRadius: 999, border: "1px solid rgba(57,189,105,0.5)", background: "rgba(57,189,105,0.08)", color: "#39BD69", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}>
            Today
          </button>
        </div>

        {/* Day labels */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "clamp(2px, 0.5vw, 6px)", marginBottom: "clamp(4px, 0.8vh, 10px)" }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: "clamp(9px, 1vw, 12px)", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", padding: "4px 0" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gridTemplateRows: `repeat(${cells.length / 7}, 1fr)`, gap: "clamp(2px, 0.5vw, 6px)", minHeight: 0 }}>
          {cells.map((day, i) => {
            const dayEvents = day ? (eventsByDay[day] ?? []) : [];
            const today_    = day ? isToday(day) : false;

            return (
              <div
                key={i}
                style={{
                  borderRadius: 10,
                  border: today_ ? "1px solid rgba(57,189,105,0.5)" : "1px solid rgba(255,255,255,0.06)",
                  background: today_ ? "rgba(57,189,105,0.06)" : day ? "rgba(255,255,255,0.02)" : "transparent",
                  padding: "clamp(4px, 0.6vh, 10px) clamp(4px, 0.5vw, 10px)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                  overflow: "hidden",
                  minHeight: 0,
                }}
              >
                {day && (
                  <>
                    {/* Day number */}
                    <span style={{
                      fontSize: "clamp(10px, 1.2vw, 14px)",
                      fontWeight: 700,
                      color: today_ ? "#39BD69" : "rgba(255,255,255,0.5)",
                      lineHeight: 1,
                      flexShrink: 0,
                      marginBottom: "clamp(2px, 0.4vh, 5px)",
                    }}>
                      {day}
                    </span>

                    {/* Scrollable events list */}
                    <div style={{
                      flex: 1,
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: "clamp(2px, 0.3vh, 4px)",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}>
                    {dayEvents.map(ev => (
                      <button
                        key={ev.id}
                        onClick={() => router.push(`/events/${ev.id}`)}
                        style={{
                          background: "linear-gradient(135deg, rgba(57,189,105,0.18), rgba(57,189,105,0.08))",
                          border: "1px solid rgba(57,189,105,0.35)",
                          borderRadius: 6,
                          padding: "clamp(1px, 0.3vh, 4px) clamp(2px, 0.3vw, 5px)",
                          textAlign: "left",
                          cursor: "pointer",
                          width: "100%",
                          flexShrink: 0,
                          overflow: "hidden",
                        }}
                      >
                        <p style={{ fontSize: "clamp(6px, 0.65vw, 9px)", fontWeight: 700, color: "#39BD69", letterSpacing: "0.04em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.2 }}>
                          {ev.title}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 1 }}>
                          <MapPin size={6} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
                          <p style={{ fontSize: "clamp(5px, 0.55vw, 8px)", color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1 }}>
                            {ev.location}
                          </p>
                        </div>
                      </button>
                    ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: "clamp(6px, 1vh, 14px)", paddingTop: "clamp(6px, 1vh, 12px)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(57,189,105,0.18)", border: "1px solid rgba(57,189,105,0.35)" }} />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Event</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, border: "1px solid rgba(57,189,105,0.5)", background: "rgba(57,189,105,0.06)" }} />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Today</span>
          </div>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em", textTransform: "uppercase", marginLeft: "auto" }}>
            Click an event to view details
          </span>
        </div>
      </div>
    </div>
  );
}

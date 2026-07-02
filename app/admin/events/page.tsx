"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAdminData, Event } from "../../context/AdminDataContext";
import { Plus, Pencil, Trash2, X, Check, Search, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

const selectStyle: React.CSSProperties = {
  padding: "9px 12px", borderRadius: 8,
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff", fontSize: 13, outline: "none", cursor: "pointer", fontFamily: "inherit",
  minWidth: 150,
};

export default function EventsAdminPage() {
  const router = useRouter();
  const { events, deleteEvent } = useAdminData();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [dateSort, setDateSort] = useState<"asc" | "desc" | null>(null);

  const cycleDateSort = () =>
    setDateSort(s => (s === null ? "asc" : s === "asc" ? "desc" : null));

  // Unique options for dropdowns
  const locations = useMemo(
    () => Array.from(new Set(events.map(e => e.location).filter(Boolean))).sort(),
    [events]
  );
  // dateFilter holds an ISO yyyy-mm-dd string from the calendar input
  const toISO = (d: string) => {
    const t = new Date(d);
    return isNaN(t.getTime()) ? "" : t.toISOString().slice(0, 10);
  };

  const filtered = useMemo(() => {
    const list = events.filter(ev => {
      if (search && !ev.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (locationFilter && ev.location !== locationFilter) return false;
      if (dateFilter && toISO(ev.date) !== dateFilter) return false;
      return true;
    });
    if (dateSort) {
      list.sort((a, b) => {
        const ta = new Date(a.date).getTime() || 0;
        const tb = new Date(b.date).getTime() || 0;
        return dateSort === "asc" ? ta - tb : tb - ta;
      });
    }
    return list;
  }, [events, search, locationFilter, dateFilter, dateSort]);

  const hasFilters = !!search || !!locationFilter || !!dateFilter;
  const clearFilters = () => { setSearch(""); setLocationFilter(""); setDateFilter(""); };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 10, color: "#39BD69", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>Manage</p>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em" }}>Events</h1>
        </div>
        <button
          onClick={() => router.push("/admin/events/new")}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 8, background: "#39BD69", border: "none", color: "#000", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
        >
          <Plus size={14} /> Add Event
        </button>
      </div>

      {/* Filter toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by event name…"
            style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
          />
        </div>
        <select style={selectStyle} value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
          <option value="">All Locations</option>
          {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          style={{ ...selectStyle, colorScheme: "dark" }}
        />
        {hasFilters && (
          <button
            onClick={clearFilters}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "9px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            <X size={12} /> Clear
          </button>
        )}
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>
          {filtered.length} of {events.length}
        </span>
      </div>

      {/* Table */}
      <div style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Image", "Title", "Date", "Location", "Organizer", "Badge", "Actions"].map(h => (
                  h === "Date" ? (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left" }}>
                      <button
                        onClick={cycleDateSort}
                        style={{
                          display: "flex", alignItems: "center", gap: 5,
                          background: "none", border: "none", cursor: "pointer", padding: 0,
                          fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
                          color: dateSort ? "#39BD69" : "rgba(255,255,255,0.35)",
                        }}
                      >
                        Date
                        {dateSort === "asc" ? <ArrowUp size={12} /> : dateSort === "desc" ? <ArrowDown size={12} /> : <ArrowUpDown size={12} style={{ opacity: 0.5 }} />}
                      </button>
                    </th>
                  ) : (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase" }}>{h}</th>
                  )
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev: Event, i: number) => (
                <tr
                  key={ev.id}
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <img src={ev.image} alt={ev.title} style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover" }} />
                  </td>
                  <td style={{ padding: "12px 16px", color: "#fff", fontWeight: 600 }}>{ev.title}</td>
                  <td style={{ padding: "12px 16px", color: "rgba(255,255,255,0.4)" }}>{ev.date}</td>
                  <td style={{ padding: "12px 16px", color: "rgba(255,255,255,0.4)" }}>{ev.location}</td>
                  <td style={{ padding: "12px 16px", color: "rgba(255,255,255,0.4)" }}>{ev.organizer || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {ev.badge ? (
                      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 999, background: "rgba(57,189,105,0.12)", color: "#39BD69", border: "1px solid rgba(57,189,105,0.2)" }}>
                        {ev.badge}
                      </span>
                    ) : <span style={{ color: "rgba(255,255,255,0.15)" }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => router.push(`/admin/events/new?id=${ev.id}`)}
                        style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", color: "#60a5fa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Pencil size={12} />
                      </button>
                      {confirmDelete === ev.id ? (
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => { deleteEvent(ev.id); setConfirmDelete(null); }} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Check size={12} />
                          </button>
                          <button onClick={() => setConfirmDelete(null)} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(ev.id)}
                          style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "32px 16px", textAlign: "center", color: "rgba(255,255,255,0.25)" }}>
                    {hasFilters ? (
                      <>No events match your filters. <button onClick={clearFilters} style={{ color: "#39BD69", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Clear filters</button></>
                    ) : (
                      <>No events yet. <button onClick={() => router.push("/admin/events/new")} style={{ color: "#39BD69", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Add the first one →</button></>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

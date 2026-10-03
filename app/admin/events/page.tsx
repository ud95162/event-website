"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useAdminData, Event } from "../../context/AdminDataContext";
import { Plus, Pencil, Trash2, X, Check, Search, ArrowUp, ArrowDown, ArrowUpDown, List, LayoutGrid, MapPin, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

const selectStyle: React.CSSProperties = {
  padding: "9px 12px", borderRadius: 8,
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff", fontSize: 13, outline: "none", cursor: "pointer", fontFamily: "inherit",
  minWidth: 150,
};

export default function EventsAdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { deleteEvent } = useAdminData();

  // Events management is admin-only; organizers are sent to their analytics.
  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/admin/analytics");
  }, [user, router]);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [view, setView] = useState<"list" | "grid">("grid");

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");        // exact day: yyyy-mm-dd
  const [monthFilter, setMonthFilter] = useState("");      // specific month: yyyy-mm
  const [period, setPeriod] = useState<"" | "today" | "week" | "month">(""); // relative
  const [dateSort, setDateSort] = useState<"asc" | "desc" | null>(null);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const cycleDateSort = () =>
    setDateSort(s => (s === null ? "asc" : s === "asc" ? "desc" : null));

  // Events are paged on the server (/api/events/admin): only the current page is downloaded.
  const [data, setData] = useState<{ events: Event[]; total: number; page: number; totalPages: number; locations: string[] }>(
    { events: [], total: 0, page: 1, totalPages: 1, locations: [] }
  );
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const reqId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchPage = useCallback(async () => {
    const id = ++reqId.current;
    const params = new URLSearchParams({ page: String(page), limit: String(perPage) });
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (locationFilter) params.set("location", locationFilter);
    if (dateFilter) params.set("date", dateFilter);
    if (monthFilter) params.set("month", monthFilter);
    if (period) params.set("period", period);
    if (dateSort) params.set("sort", dateSort);
    try {
      const res = await fetch(`/api/events/admin?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const d = await res.json();
      if (id === reqId.current) { setData(d); setLoading(false); }
    } catch {
      if (id === reqId.current) setLoading(false);
    }
  }, [page, perPage, debouncedSearch, locationFilter, dateFilter, monthFilter, period, dateSort]);

  useEffect(() => { fetchPage(); }, [fetchPage, refreshKey]);

  const paged = data.events;
  const locations = data.locations;
  const total = data.total;

  const hasFilters = !!search || !!locationFilter || !!dateFilter || !!monthFilter || !!period;
  const clearFilters = () => { setSearch(""); setLocationFilter(""); setDateFilter(""); setMonthFilter(""); setPeriod(""); };

  // Pagination — the server clamps the page, so trust the page it returns.
  const totalPages = data.totalPages;
  const currentPage = data.page;
  useEffect(() => { setPage(1); }, [debouncedSearch, locationFilter, dateFilter, monthFilter, period, dateSort, perPage]);

  // Delete on the server first, then refresh the current page (stepping back if it emptied).
  const handleDelete = async (id: number) => {
    setConfirmDelete(null);
    try { await fetch(`/api/events/${id}`, { method: "DELETE" }); } catch { /* refetch below shows the truth */ }
    deleteEvent(id); // keep the shared admin data in sync (idempotent DELETE)
    if (paged.length === 1 && page > 1) setPage(page - 1); else setRefreshKey(k => k + 1);
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 10, color: "#E8DCC0", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>Manage</p>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em" }}>Events</h1>
        </div>
        <button
          onClick={() => router.push("/admin/events/new")}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 8, background: "#2B2E36", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
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
        {hasFilters && (
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>
            {total} match{total !== 1 ? "es" : ""}
          </span>
        )}
        {/* Per-page selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Show</span>
          <select
            value={perPage}
            onChange={e => setPerPage(Number(e.target.value))}
            style={{ ...selectStyle, minWidth: 0, padding: "8px 10px" }}
          >
            {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        {/* View toggle */}
        <div style={{ display: "flex", gap: 2, padding: 3, borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
          {([["list", List], ["grid", LayoutGrid]] as const).map(([mode, Icon]) => (
            <button
              key={mode}
              onClick={() => setView(mode)}
              title={mode === "list" ? "List view" : "Grid view"}
              style={{
                width: 30, height: 28, borderRadius: 6, cursor: "pointer", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: view === mode ? "rgba(232,220,192,0.15)" : "transparent",
                color: view === mode ? "#E8DCC0" : "rgba(255,255,255,0.4)",
                transition: "all 0.15s",
              }}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
      </div>

      {/* Internal management: filter by period */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap", padding: "12px 14px", background: "rgba(232,220,192,0.04)", border: "1px solid rgba(232,220,192,0.15)", borderRadius: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(232,220,192,0.9)" }}>Manage by period</span>
        {/* Relative period segmented control */}
        <div style={{ display: "flex", gap: 2, padding: 3, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
          {([["", "All"], ["today", "Today"], ["week", "This Week"], ["month", "This Month"]] as const).map(([val, lbl]) => (
            <button
              key={val || "all"}
              onClick={() => { setPeriod(val); if (val) { setMonthFilter(""); setDateFilter(""); } }}
              style={{
                padding: "6px 12px", borderRadius: 6, cursor: "pointer", border: "none",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.03em",
                background: period === val ? "rgba(232,220,192,0.18)" : "transparent",
                color: period === val ? "#E8DCC0" : "rgba(255,255,255,0.45)",
                transition: "all 0.15s",
              }}
            >
              {lbl}
            </button>
          ))}
        </div>
        {/* Specific month */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Month:</span>
          <input
            type="month"
            value={monthFilter}
            onChange={e => { setMonthFilter(e.target.value); if (e.target.value) { setPeriod(""); setDateFilter(""); } }}
            style={{ padding: "7px 10px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 12, outline: "none", colorScheme: "dark", fontFamily: "inherit" }}
          />
        </div>
        {(period || monthFilter) && (
          <button
            onClick={() => { setPeriod(""); setMonthFilter(""); }}
            style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
          >
            <X size={11} /> Reset period
          </button>
        )}
      </div>

      {/* Grid view */}
      {view === "grid" && (
        total === 0 ? (
          <div style={{ padding: "40px 16px", textAlign: "center", color: "rgba(255,255,255,0.25)", background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12 }}>
            {loading ? (
              <>Loading events…</>
            ) : hasFilters ? (
              <>No events match your filters. <button onClick={clearFilters} style={{ color: "#E8DCC0", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Clear filters</button></>
            ) : (
              <>No events yet. <button onClick={() => router.push("/admin/events/new")} style={{ color: "#E8DCC0", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Add the first one →</button></>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 16 }}>
            {paged.map((ev: Event) => (
              <div key={ev.id} style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ position: "relative", height: 130 }}>
                  <img src={ev.image} alt={ev.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,13,13,0.9) 0%, transparent 60%)" }} />
                  {ev.badge && (
                    <span style={{ position: "absolute", top: 8, left: 8, fontSize: 8, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 999, background: "rgba(232,220,192,0.9)", color: "#000" }}>{ev.badge}</span>
                  )}
                </div>
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{ev.title}</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                      <Calendar size={11} /> {ev.date}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                      <MapPin size={11} /> {ev.location}
                    </div>
                    {ev.organizer && <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>By {ev.organizer}</p>}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <button
                      onClick={() => router.push(`/admin/events/new?id=${ev.id}`)}
                      style={{ flex: 1, height: 32, borderRadius: 6, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", color: "#60a5fa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 11, fontWeight: 600 }}
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    {confirmDelete === ev.id ? (
                      <>
                        <button onClick={() => handleDelete(ev.id)} style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={12} /></button>
                        <button onClick={() => setConfirmDelete(null)} style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={12} /></button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmDelete(ev.id)} style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={12} /></button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Table (list view) */}
      {view === "list" && (
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
                          color: dateSort ? "#E8DCC0" : "rgba(255,255,255,0.35)",
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
              {paged.map((ev: Event, i: number) => (
                <tr
                  key={ev.id}
                  style={{ borderBottom: i < paged.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
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
                      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 999, background: "rgba(232,220,192,0.12)", color: "#E8DCC0", border: "1px solid rgba(232,220,192,0.2)" }}>
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
                          <button onClick={() => handleDelete(ev.id)} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
              {total === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "32px 16px", textAlign: "center", color: "rgba(255,255,255,0.25)" }}>
                    {loading ? (
              <>Loading events…</>
            ) : hasFilters ? (
                      <>No events match your filters. <button onClick={clearFilters} style={{ color: "#E8DCC0", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Clear filters</button></>
                    ) : (
                      <>No events yet. <button onClick={() => router.push("/admin/events/new")} style={{ color: "#E8DCC0", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Add the first one →</button></>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Pagination */}
      {total > perPage && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18, gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
            Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, total)} of {total}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: currentPage === 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, cursor: currentPage === 1 ? "default" : "pointer" }}
            >
              <ChevronLeft size={13} /> Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((p, idx, arr) => (
                <span key={p} style={{ display: "flex", alignItems: "center" }}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ color: "rgba(255,255,255,0.25)", padding: "0 4px" }}>…</span>}
                  <button
                    onClick={() => setPage(p)}
                    style={{
                      minWidth: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
                      background: p === currentPage ? "rgba(232,220,192,0.15)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${p === currentPage ? "rgba(232,220,192,0.4)" : "rgba(255,255,255,0.1)"}`,
                      color: p === currentPage ? "#E8DCC0" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: currentPage === totalPages ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, cursor: currentPage === totalPages ? "default" : "pointer" }}
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

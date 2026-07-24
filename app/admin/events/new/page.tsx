"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminData, Event } from "../../../context/AdminDataContext";
import { EVENT_STATUSES } from "../../../data/events";
import { ChevronLeft, Check, Plus, Trash2 } from "lucide-react";
import ImageUpload from "../../components/ImageUpload";
import LineupSelector from "../../components/LineupSelector";
import CreatableSelect from "../../components/CreatableSelect";
import MapPicker from "../../components/MapPicker";

const EMPTY: Omit<Event, "id"> = {
  tag: "", title: "", date: "", location: "", venue: "",
  price: "", image: "", badge: null, genres: [], lineup: [],
  organizer: "", description: "", lat: 0, lon: 0, tickets: [], status: "Confirmed",
  startTime: "", endDate: "", endTime: "", ageRestriction: "", capacity: null,
  venueType: "", coOrganizers: [], videoTrailer: "", externalLink: "",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 700,
  color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em",
  textTransform: "uppercase", marginBottom: 6,
};

const sectionHeadStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 800, color: "#39BD69", letterSpacing: "0.3em",
  textTransform: "uppercase", paddingBottom: 8, marginBottom: 16,
  borderBottom: "1px solid rgba(57,189,105,0.2)",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={labelStyle}>{label}</label>{children}</div>;
}

// Keep only digits, then group into thousands: "5000" -> "5,000"
const formatPrice = (raw: string): string => {
  const digits = (raw || "").replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString("en-US") : "";
};

const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// "21 June 2026" -> "2026-06-21"  (for the calendar input)
const toISODate = (display: string): string => {
  const t = new Date(display);
  if (isNaN(t.getTime())) return "";
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// "2026-06-21" -> "21 June 2026"  (for storage/display)
const fromISODate = (iso: string): string => {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "";
  return `${d} ${MONTHS_FULL[m - 1]} ${y}`;
};

function EventFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { events, organizers, artists, genres: GENRES, badges, addEvent, updateEvent, addBadge } = useAdminData();

  const editId = searchParams.get("id") ? Number(searchParams.get("id")) : null;
  const editing = editId ? events.find(e => e.id === editId) ?? null : null;

  const [form, setForm] = useState<Omit<Event, "id">>(EMPTY);
  const [coordMode, setCoordMode] = useState<"map" | "manual">("map");

  useEffect(() => {
    if (editing) setForm({ ...editing });
  }, [editing]);

  const set = (key: keyof typeof EMPTY, val: unknown) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const toggleGenre = (g: string) =>
    set("genres", form.genres.includes(g) ? form.genres.filter(x => x !== g) : [...form.genres, g]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form };
    if (editing) updateEvent({ ...data, id: editing.id });
    else addEvent(data);
    router.push("/admin/events");
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <button
          onClick={() => router.push("/admin/events")}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
        >
          <ChevronLeft size={14} /> Back to Events
        </button>
        <div>
          <p style={{ fontSize: 10, color: "#39BD69", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 4 }}>
            {editing ? "Edit Event" : "New Event"}
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>
            {editing ? editing.title : "Add Event"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* BASIC INFO */}
          <section style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24 }}>
            <p style={sectionHeadStyle}>Basic Info</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              <Field label="Event Title *">
                <input style={inputStyle} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Bass Nation Colombo" required />
              </Field>
              <Field label="Tag *">
                <input style={inputStyle} value={form.tag} onChange={e => set("tag", e.target.value)} placeholder="e.g. EDM NIGHT" required />
              </Field>
              <Field label="Badge">
                <CreatableSelect
                  value={form.badge ?? ""}
                  options={badges}
                  onChange={val => set("badge", val || null)}
                  onCreate={addBadge}
                  placeholder="None"
                />
              </Field>
              <Field label="Status">
                <select style={{ ...inputStyle, cursor: "pointer" }} value={form.status ?? ""} onChange={e => set("status", e.target.value)}>
                  <option value="">No status</option>
                  {EVENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.value}</option>)}
                </select>
              </Field>
              <Field label="Start Date *">
                <input
                  type="date"
                  style={{ ...inputStyle, colorScheme: "dark", cursor: "pointer" }}
                  value={toISODate(form.date)}
                  onChange={e => set("date", fromISODate(e.target.value))}
                  required
                />
              </Field>
              <Field label="Start Time">
                <input
                  type="time"
                  style={{ ...inputStyle, colorScheme: "dark", cursor: "pointer" }}
                  value={form.startTime ?? ""}
                  onChange={e => set("startTime", e.target.value)}
                />
              </Field>
              <Field label="End Date (multi-day)">
                <input
                  type="date"
                  style={{ ...inputStyle, colorScheme: "dark", cursor: "pointer" }}
                  value={toISODate(form.endDate ?? "")}
                  onChange={e => set("endDate", fromISODate(e.target.value))}
                />
              </Field>
              <Field label="End Time">
                <input
                  type="time"
                  style={{ ...inputStyle, colorScheme: "dark", cursor: "pointer" }}
                  value={form.endTime ?? ""}
                  onChange={e => set("endTime", e.target.value)}
                />
              </Field>
              <Field label="Location *">
                <input style={inputStyle} value={form.location} onChange={e => set("location", e.target.value)} placeholder="Colombo" required />
              </Field>
              <Field label="Venue">
                <input style={inputStyle} value={form.venue} onChange={e => set("venue", e.target.value)} placeholder="Trillium Rooftop, Colombo 03" />
              </Field>
              <Field label="Organizer">
                <select style={{ ...inputStyle, cursor: "pointer" }} value={form.organizer} onChange={e => set("organizer", e.target.value)}>
                  <option value="">Select organizer</option>
                  {organizers.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                </select>
              </Field>
              <div style={{ gridColumn: "span 3" }}>
                <label style={labelStyle}>Lineup</label>
                <LineupSelector
                  value={form.lineup}
                  onChange={v => set("lineup", v)}
                  allArtists={artists.map(a => a.stageName || a.name)}
                />
              </div>
              <div style={{ gridColumn: "span 3" }}>
                <label style={labelStyle}>Co-organizers (additional hosts)</label>
                <LineupSelector
                  value={form.coOrganizers ?? []}
                  onChange={v => set("coOrganizers", v)}
                  allArtists={organizers.map(o => o.name).filter(n => n !== form.organizer)}
                />
              </div>
            </div>

            {/* Ticket types */}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <label style={labelStyle}>Ticket Types</label>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>
                Add ticket categories with their prices (e.g. General, VIP, Early Bird). These show on the event detail page.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(form.tickets ?? []).map((t, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 40px", gap: 10, alignItems: "center" }}>
                      <input
                        style={inputStyle}
                        value={t.name}
                        onChange={e => set("tickets", (form.tickets ?? []).map((x, xi) => xi === i ? { ...x, name: e.target.value } : x))}
                        placeholder="Ticket name (e.g. VIP)"
                      />
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", pointerEvents: "none" }}>LKR</span>
                        <input
                          style={{ ...inputStyle, paddingLeft: 46 }}
                          inputMode="numeric"
                          value={formatPrice(t.price)}
                          onChange={e => set("tickets", (form.tickets ?? []).map((x, xi) => xi === i ? { ...x, price: formatPrice(e.target.value) } : x))}
                          placeholder="5,000"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => set("tickets", (form.tickets ?? []).filter((_, xi) => xi !== i))}
                        style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <input
                      style={{ ...inputStyle, fontSize: 12 }}
                      value={t.desc ?? ""}
                      onChange={e => set("tickets", (form.tickets ?? []).map((x, xi) => xi === i ? { ...x, desc: e.target.value } : x))}
                      placeholder="What's included (e.g. VIP lounge access, fast-track entry)"
                    />
                  </div>
                ))}
                {(form.tickets ?? []).length === 0 && (
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>No ticket types added yet.</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => set("tickets", [...(form.tickets ?? []), { name: "", price: "" }])}
                style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: "rgba(57,189,105,0.1)", border: "1px solid rgba(57,189,105,0.3)", color: "#39BD69", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              >
                <Plus size={14} /> Add Ticket Type
              </button>
            </div>
          </section>

          {/* IMAGE */}
          <section style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24 }}>
            <p style={sectionHeadStyle}>Event Image</p>
            <div style={{ maxWidth: 500 }}>
              <ImageUpload
                label="Event Image"
                value={form.image}
                onChange={val => set("image", val)}
                aspectRatio="wide"
                hint="Landscape 16:9 · Recommended 800 × 450 px · PNG, JPG, WEBP · Max 5 MB"
              />
            </div>
          </section>

          {/* GENRES */}
          <section style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24 }}>
            <p style={sectionHeadStyle}>Genres</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {GENRES.map(g => (
                <button
                  key={g} type="button"
                  onClick={() => toggleGenre(g)}
                  style={{
                    padding: "7px 16px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", textTransform: "capitalize", transition: "all 0.15s",
                    background: form.genres.includes(g) ? "rgba(57,189,105,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${form.genres.includes(g) ? "rgba(57,189,105,0.4)" : "rgba(255,255,255,0.1)"}`,
                    color: form.genres.includes(g) ? "#39BD69" : "rgba(255,255,255,0.4)",
                  }}
                >{g}</button>
              ))}
            </div>
          </section>

          {/* DESCRIPTION */}
          <section style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24 }}>
            <p style={sectionHeadStyle}>Description</p>
            <textarea
              style={{ ...inputStyle, height: 120, resize: "vertical" }}
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Describe the event…"
            />
          </section>

          {/* DETAILS */}
          <section style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24 }}>
            <p style={sectionHeadStyle}>Event Details</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              <Field label="Age Restriction">
                <input
                  style={inputStyle}
                  list="age-options"
                  value={form.ageRestriction ?? ""}
                  onChange={e => set("ageRestriction", e.target.value)}
                  placeholder="e.g. 21+"
                />
                <datalist id="age-options">
                  <option value="All Ages" />
                  <option value="18+" />
                  <option value="21+" />
                </datalist>
              </Field>
              <Field label="Capacity / Max Attendees">
                <input
                  type="number"
                  min={0}
                  style={inputStyle}
                  value={form.capacity ?? ""}
                  onChange={e => set("capacity", e.target.value ? Number(e.target.value) : null)}
                  placeholder="e.g. 500"
                />
              </Field>
              <Field label="Indoor / Outdoor">
                <select style={{ ...inputStyle, cursor: "pointer" }} value={form.venueType ?? ""} onChange={e => set("venueType", e.target.value)}>
                  <option value="">Not specified</option>
                  <option value="Indoor">Indoor</option>
                  <option value="Outdoor">Outdoor</option>
                </select>
              </Field>
              <Field label="External Link (more info)">
                <input style={inputStyle} type="url" value={form.externalLink ?? ""} onChange={e => set("externalLink", e.target.value)} placeholder="https://…" />
              </Field>
              <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>Video Trailer URL (portrait preferred)</label>
                <input style={inputStyle} type="url" value={form.videoTrailer ?? ""} onChange={e => set("videoTrailer", e.target.value)} placeholder="YouTube, Vimeo, or direct .mp4 URL" />
              </div>
            </div>
          </section>

          {/* LOCATION COORDS */}
          <section style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(57,189,105,0.2)", paddingBottom: 8, marginBottom: 16 }}>
              <p style={{ ...sectionHeadStyle, border: "none", padding: 0, margin: 0 }}>Coordinates (optional)</p>
              {/* Mode toggle */}
              <div style={{ display: "flex", gap: 2, padding: 3, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {(["map", "manual"] as const).map(m => (
                  <button
                    key={m} type="button"
                    onClick={() => setCoordMode(m)}
                    style={{
                      padding: "5px 12px", borderRadius: 6, cursor: "pointer", border: "none",
                      fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "capitalize",
                      background: coordMode === m ? "rgba(57,189,105,0.15)" : "transparent",
                      color: coordMode === m ? "#39BD69" : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {m === "map" ? "Pick on Map" : "Enter Manually"}
                  </button>
                ))}
              </div>
            </div>

            {coordMode === "map" ? (
              <MapPicker
                lat={form.lat}
                lon={form.lon}
                onChange={(la, lo) => setForm(prev => ({ ...prev, lat: la, lon: lo }))}
              />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                <Field label="Latitude">
                  <input type="number" step="any" style={inputStyle} value={form.lat || ""} onChange={e => set("lat", parseFloat(e.target.value) || 0)} placeholder="6.9271" />
                </Field>
                <Field label="Longitude">
                  <input type="number" step="any" style={inputStyle} value={form.lon || ""} onChange={e => set("lon", parseFloat(e.target.value) || 0)} placeholder="79.8612" />
                </Field>
              </div>
            )}
          </section>

        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => router.push("/admin/events")}
            style={{ padding: "11px 24px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 28px", borderRadius: 8, background: "#39BD69", border: "none", color: "#000", fontSize: 13, fontWeight: 800, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em" }}
          >
            <Check size={14} /> {editing ? "Save Changes" : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EventFormPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32, color: "#fff" }}>Loading…</div>}>
      <EventFormInner />
    </Suspense>
  );
}

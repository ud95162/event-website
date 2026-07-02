"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useAdminData, Artist } from "../../../context/AdminDataContext";
import { ChevronLeft, Check } from "lucide-react";
import ImageUpload from "../../components/ImageUpload";

const EMPTY: Omit<Artist, "id"> = {
  name: "", stageName: "", realName: "", role: "", image: "", bannerImage: "", bio: "",
  genres: [], subGenres: [], isDJ: false, bpmMin: null, bpmMax: null,
  city: "", touringRegion: "",
  soundcloudUrl: "", spotifyUrl: "", beatportUrl: "",
  instagramUrl: "", tiktokUrl: "", youtubeUrl: "",
  bookingContact: "", similarArtists: [], rating: 0,
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box",
  fontFamily: "inherit",
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

function ArtistFormInner() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { artists, genres: GENRES, addArtist, updateArtist } = useAdminData();

  const editId = searchParams.get("id") ? Number(searchParams.get("id")) : null;
  const editing = editId ? artists.find(a => a.id === editId) ?? null : null;

  const [form, setForm] = useState<Omit<Artist, "id">>(EMPTY);

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/admin");
  }, [user, router]);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        stageName: editing.stageName ?? "",
        realName: editing.realName ?? "",
        role: editing.role,
        image: editing.image,
        bannerImage: editing.bannerImage ?? "",
        bio: editing.bio,
        genres: editing.genres ?? [],
        subGenres: editing.subGenres ?? [],
        isDJ: editing.isDJ ?? false,
        bpmMin: editing.bpmMin ?? null,
        bpmMax: editing.bpmMax ?? null,
        city: editing.city ?? "",
        touringRegion: editing.touringRegion ?? "",
        soundcloudUrl: editing.soundcloudUrl ?? "",
        spotifyUrl: editing.spotifyUrl ?? "",
        beatportUrl: editing.beatportUrl ?? "",
        instagramUrl: editing.instagramUrl ?? "",
        tiktokUrl: editing.tiktokUrl ?? "",
        youtubeUrl: editing.youtubeUrl ?? "",
        bookingContact: editing.bookingContact ?? "",
        similarArtists: editing.similarArtists ?? [],
        rating: editing.rating ?? 0,
      });
    }
  }, [editing]);

  const set = (key: keyof Omit<Artist, "id">, val: unknown) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalForm = { ...form, name: form.stageName || form.name };
    if (editing) {
      updateArtist({ ...finalForm, id: editing.id });
    } else {
      addArtist(finalForm);
    }
    router.push("/admin/artists");
  };

  if (user?.role !== "admin") return null;

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <button
          onClick={() => router.push("/admin/artists")}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
        >
          <ChevronLeft size={14} /> Back to Artists
        </button>
        <div>
          <p style={{ fontSize: 10, color: "#39BD69", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 4 }}>
            {editing ? "Edit Artist" : "New Artist"}
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>
            {editing ? (editing.stageName || editing.name) : "Add Artist"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

          {/* BASIC INFO */}
          <section style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24 }}>
            <p style={sectionHeadStyle}>Basic Info</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              <div>
                <label style={labelStyle}>Stage Name *</label>
                <input style={inputStyle} value={form.stageName ?? ""} onChange={e => set("stageName", e.target.value)} placeholder="e.g. DJ Nova" required />
              </div>
              <div>
                <label style={{ ...labelStyle, color: "rgba(239,200,80,0.8)" }}>Real Name (Private — Internal Only)</label>
                <input style={{ ...inputStyle, border: "1px solid rgba(239,200,80,0.2)" }} value={form.realName ?? ""} onChange={e => set("realName", e.target.value)} placeholder="Not shown publicly" />
              </div>
              <div>
                <label style={labelStyle}>Role / Genre Label *</label>
                <input style={inputStyle} value={form.role} onChange={e => set("role", e.target.value)} placeholder="EDM / HOUSE MUSIC" required />
              </div>
              <div>
                <label style={labelStyle}>City</label>
                <input style={inputStyle} value={form.city ?? ""} onChange={e => set("city", e.target.value)} placeholder="Colombo" />
              </div>
              <div>
                <label style={labelStyle}>Touring Region</label>
                <input style={inputStyle} value={form.touringRegion ?? ""} onChange={e => set("touringRegion", e.target.value)} placeholder="South Asia / International" />
              </div>
            </div>
          </section>

          {/* MEDIA */}
          <section style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24 }}>
            <p style={sectionHeadStyle}>Media</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              <ImageUpload
                label="Profile Photo"
                value={form.image}
                onChange={val => set("image", val)}
                aspectRatio="square"
                hint="Square image recommended · Max 5 MB"
              />
              <div style={{ gridColumn: "span 2" }}>
                <ImageUpload
                  label="Banner Image"
                  value={form.bannerImage ?? ""}
                  onChange={val => set("bannerImage", val)}
                  aspectRatio="wide"
                  hint="Wide/landscape image recommended · Max 5 MB"
                />
              </div>
            </div>
          </section>

          {/* BIO */}
          <section style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24 }}>
            <p style={sectionHeadStyle}>Bio</p>
            <label style={labelStyle}>Bio</label>
            <textarea style={{ ...inputStyle, height: 100, resize: "vertical" }} value={form.bio} onChange={e => set("bio", e.target.value)} placeholder="Short artist bio…" />
          </section>

          {/* MUSIC */}
          <section style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24 }}>
            <p style={sectionHeadStyle}>Music</p>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Genres</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {GENRES.map(g => {
                  const active = (form.genres ?? []).includes(g);
                  return (
                    <button
                      key={g} type="button"
                      onClick={() => set("genres", active ? (form.genres ?? []).filter(x => x !== g) : [...(form.genres ?? []), g])}
                      style={{
                        padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                        cursor: "pointer", textTransform: "capitalize", transition: "all 0.15s",
                        background: active ? "rgba(57,189,105,0.15)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${active ? "rgba(57,189,105,0.4)" : "rgba(255,255,255,0.1)"}`,
                        color: active ? "#39BD69" : "rgba(255,255,255,0.4)",
                      }}
                    >{g}</button>
                  );
                })}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Sub-Genres (comma-separated)</label>
              <input style={inputStyle} value={(form.subGenres ?? []).join(", ")} onChange={e => set("subGenres", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} placeholder="Progressive House, Big Room" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <input type="checkbox" id="isDJ" checked={form.isDJ ?? false} onChange={e => set("isDJ", e.target.checked)} style={{ accentColor: "#39BD69", width: 16, height: 16, cursor: "pointer" }} />
              <label htmlFor="isDJ" style={{ ...labelStyle, marginBottom: 0, cursor: "pointer", color: "rgba(255,255,255,0.6)" }}>This artist is a DJ (enables BPM range)</label>
            </div>
            {form.isDJ && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                <div>
                  <label style={labelStyle}>BPM Min</label>
                  <input type="number" style={inputStyle} value={form.bpmMin ?? ""} onChange={e => set("bpmMin", e.target.value ? Number(e.target.value) : null)} placeholder="126" />
                </div>
                <div>
                  <label style={labelStyle}>BPM Max</label>
                  <input type="number" style={inputStyle} value={form.bpmMax ?? ""} onChange={e => set("bpmMax", e.target.value ? Number(e.target.value) : null)} placeholder="134" />
                </div>
              </div>
            )}
          </section>

          {/* STREAMING */}
          <section style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24 }}>
            <p style={sectionHeadStyle}>Streaming Links</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              <div>
                <label style={labelStyle}>SoundCloud URL</label>
                <input style={inputStyle} value={form.soundcloudUrl ?? ""} onChange={e => set("soundcloudUrl", e.target.value)} placeholder="https://soundcloud.com/…" />
              </div>
              <div>
                <label style={labelStyle}>Spotify URL</label>
                <input style={inputStyle} value={form.spotifyUrl ?? ""} onChange={e => set("spotifyUrl", e.target.value)} placeholder="https://open.spotify.com/…" />
              </div>
              <div>
                <label style={labelStyle}>Beatport URL</label>
                <input style={inputStyle} value={form.beatportUrl ?? ""} onChange={e => set("beatportUrl", e.target.value)} placeholder="https://www.beatport.com/…" />
              </div>
            </div>
          </section>

          {/* SOCIAL */}
          <section style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24 }}>
            <p style={sectionHeadStyle}>Social Links</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              <div>
                <label style={labelStyle}>Instagram URL</label>
                <input style={inputStyle} value={form.instagramUrl ?? ""} onChange={e => set("instagramUrl", e.target.value)} placeholder="https://instagram.com/…" />
              </div>
              <div>
                <label style={labelStyle}>TikTok URL</label>
                <input style={inputStyle} value={form.tiktokUrl ?? ""} onChange={e => set("tiktokUrl", e.target.value)} placeholder="https://tiktok.com/@…" />
              </div>
              <div>
                <label style={labelStyle}>YouTube URL</label>
                <input style={inputStyle} value={form.youtubeUrl ?? ""} onChange={e => set("youtubeUrl", e.target.value)} placeholder="https://youtube.com/@…" />
              </div>
            </div>
          </section>

          {/* BUSINESS */}
          <section style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24 }}>
            <p style={sectionHeadStyle}>Business</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              <div>
                <label style={labelStyle}>Booking Contact (email / phone)</label>
                <input style={inputStyle} value={form.bookingContact ?? ""} onChange={e => set("bookingContact", e.target.value)} placeholder="booking@artist.com" />
              </div>
              <div>
                <label style={labelStyle}>Rating (0 – 5)</label>
                <input type="number" min={0} max={5} step={0.1} style={inputStyle} value={form.rating ?? 0} onChange={e => set("rating", Number(e.target.value))} />
              </div>
            </div>
          </section>

          {/* DISCOVERY */}
          <section style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24 }}>
            <p style={sectionHeadStyle}>Discovery</p>
            <label style={labelStyle}>Similar Artists (comma-separated names)</label>
            <input style={inputStyle} value={(form.similarArtists ?? []).join(", ")} onChange={e => set("similarArtists", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} placeholder="Martin Garrix, Afrojack, Hardwell" />
          </section>

        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
          <button type="button" onClick={() => router.push("/admin/artists")} style={{ padding: "11px 24px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Cancel
          </button>
          <button type="submit" style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 28px", borderRadius: 8, background: "#39BD69", border: "none", color: "#000", fontSize: 13, fontWeight: 800, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <Check size={14} /> {editing ? "Save Changes" : "Create Artist"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ArtistFormPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32, color: "#fff" }}>Loading…</div>}>
      <ArtistFormInner />
    </Suspense>
  );
}

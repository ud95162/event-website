"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useAdminData, Artist } from "../../../context/AdminDataContext";
import { ARTIST_GENRES, ARTIST_LEVELS } from "../../../data/artists";
import { ChevronLeft, Check, Plus, Trash2 } from "lucide-react";
import ImageUpload from "../../components/ImageUpload";
import LineupSelector from "../../components/LineupSelector";

const SOCIAL_PLATFORMS = ["Facebook", "Instagram", "TikTok", "YouTube", "X (Twitter)", "Website"];

const EMPTY: Omit<Artist, "id"> = {
  name: "", stageName: "", realName: "", role: "", image: "", bannerImage: "", bio: "",
  genres: [], subGenres: [], isDJ: false, bpm: null,
  city: "", touringRegion: "",
  soundcloudUrl: "", spotifyUrl: "", beatportUrl: "",
  socialLinks: [], bookingEmail: "", bookingPhone: "", level: "", rating: 0,
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
  const { artists, addArtist, updateArtist } = useAdminData();

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
        bpm: editing.bpm ?? (editing.bpmMin ?? null),
        city: editing.city ?? "",
        touringRegion: editing.touringRegion ?? "",
        soundcloudUrl: editing.soundcloudUrl ?? "",
        spotifyUrl: editing.spotifyUrl ?? "",
        beatportUrl: editing.beatportUrl ?? "",
        // Migrate legacy fixed social fields into the dynamic list if needed
        socialLinks: (editing.socialLinks && editing.socialLinks.length > 0)
          ? editing.socialLinks
          : [
              ...(editing.instagramUrl ? [{ platform: "Instagram", url: editing.instagramUrl }] : []),
              ...(editing.tiktokUrl ? [{ platform: "TikTok", url: editing.tiktokUrl }] : []),
              ...(editing.youtubeUrl ? [{ platform: "YouTube", url: editing.youtubeUrl }] : []),
            ],
        bookingEmail: editing.bookingEmail ?? "",
        bookingPhone: editing.bookingPhone ?? "",
        level: editing.level ?? "",
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
                hint="Square 1:1 · Recommended 600 × 600 px · PNG, JPG, WEBP · Max 5 MB"
              />
              <div style={{ gridColumn: "span 2" }}>
                <ImageUpload
                  label="Banner Image"
                  value={form.bannerImage ?? ""}
                  onChange={val => set("bannerImage", val)}
                  aspectRatio="wide"
                  hint="Wide banner 16:5 · Recommended 1600 × 500 px · PNG, JPG, WEBP · Max 5 MB"
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
              <LineupSelector
                value={form.genres ?? []}
                onChange={v => set("genres", v)}
                allArtists={ARTIST_GENRES}
                placeholder="Search and select genres…"
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Sub-Genres (comma-separated)</label>
              <input style={inputStyle} value={(form.subGenres ?? []).join(", ")} onChange={e => set("subGenres", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} placeholder="Progressive House, Big Room" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <input type="checkbox" id="isDJ" checked={form.isDJ ?? false} onChange={e => set("isDJ", e.target.checked)} style={{ accentColor: "#39BD69", width: 16, height: 16, cursor: "pointer" }} />
              <label htmlFor="isDJ" style={{ ...labelStyle, marginBottom: 0, cursor: "pointer", color: "rgba(255,255,255,0.6)" }}>This artist is a DJ</label>
            </div>
            {form.isDJ && (
              <div style={{ maxWidth: 240 }}>
                <label style={labelStyle}>BPM (Beats Per Minute)</label>
                <input type="number" style={inputStyle} value={form.bpm ?? ""} onChange={e => set("bpm", e.target.value ? Number(e.target.value) : null)} placeholder="128" />
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

          {/* SOCIAL — dynamic, any platform */}
          <section style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24 }}>
            <p style={sectionHeadStyle}>Social Links</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>
              Add a link for any platform (Facebook, Instagram, TikTok, YouTube, X, website…).
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(form.socialLinks ?? []).map((s, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "180px 1fr 40px", gap: 10, alignItems: "center" }}>
                  <input
                    style={inputStyle}
                    list="social-platforms"
                    value={s.platform}
                    onChange={e => set("socialLinks", (form.socialLinks ?? []).map((x, xi) => xi === i ? { ...x, platform: e.target.value } : x))}
                    placeholder="Platform (e.g. Facebook)"
                  />
                  <input
                    style={inputStyle}
                    value={s.url}
                    onChange={e => set("socialLinks", (form.socialLinks ?? []).map((x, xi) => xi === i ? { ...x, url: e.target.value } : x))}
                    placeholder="https://…"
                  />
                  <button
                    type="button"
                    onClick={() => set("socialLinks", (form.socialLinks ?? []).filter((_, xi) => xi !== i))}
                    style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {(form.socialLinks ?? []).length === 0 && (
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>No social links added yet.</p>
              )}
            </div>
            <datalist id="social-platforms">
              {SOCIAL_PLATFORMS.map(p => <option key={p} value={p} />)}
            </datalist>
            <button
              type="button"
              onClick={() => set("socialLinks", [...(form.socialLinks ?? []), { platform: "", url: "" }])}
              style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: "rgba(57,189,105,0.1)", border: "1px solid rgba(57,189,105,0.3)", color: "#39BD69", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
            >
              <Plus size={14} /> Add Social Link
            </button>
          </section>

          {/* BUSINESS */}
          <section style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24 }}>
            <p style={sectionHeadStyle}>Business</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Booking Email</label>
                <input type="email" style={inputStyle} value={form.bookingEmail ?? ""} onChange={e => set("bookingEmail", e.target.value)} placeholder="booking@artist.com" />
              </div>
              <div>
                <label style={labelStyle}>Booking Phone</label>
                <input type="tel" style={inputStyle} value={form.bookingPhone ?? ""} onChange={e => set("bookingPhone", e.target.value)} placeholder="+94 77 123 4567" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Rating</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="range" min={0} max={5} step={0.5} value={form.rating ?? 0} onChange={e => set("rating", Number(e.target.value))} style={{ flex: 1, accentColor: "#39BD69" }} />
                <span style={{ fontSize: 14, fontWeight: 800, color: "#f59e0b", minWidth: 30, textAlign: "right" }}>{(form.rating ?? 0).toFixed(1)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                <span>0 = Worst</span>
                <span>5 = Best</span>
              </div>
            </div>
          </section>

          {/* DISCOVERY / LEVEL */}
          <section style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24 }}>
            <p style={sectionHeadStyle}>Discovery</p>
            <div style={{ maxWidth: 280 }}>
              <label style={labelStyle}>Artist Level</label>
              <select style={{ ...inputStyle, cursor: "pointer" }} value={form.level ?? ""} onChange={e => set("level", e.target.value)}>
                <option value="">Not set</option>
                {ARTIST_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 10 }}>
              Recommended artists are generated automatically on the public profile, based on shared genres and level — no manual list needed.
            </p>
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

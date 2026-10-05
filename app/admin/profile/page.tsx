"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Check, Lock } from "lucide-react";
import ImageUpload from "../components/ImageUpload";
import PasswordInput from "../components/PasswordInput";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};
const readOnlyStyle: React.CSSProperties = { ...inputStyle, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.02)", cursor: "not-allowed" };
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)",
  letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6,
};
const panel: React.CSSProperties = { background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24, marginBottom: 24 };
const sectionHead: React.CSSProperties = { fontSize: 10, fontWeight: 800, color: "#E8DCC0", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 18 };
const note = (ok: boolean): React.CSSProperties => ({
  marginBottom: 16, padding: "12px 16px", borderRadius: 8, fontSize: 13,
  background: ok ? "rgba(232,220,192,0.1)" : "rgba(239,68,68,0.1)",
  border: `1px solid ${ok ? "rgba(232,220,192,0.3)" : "rgba(239,68,68,0.3)"}`,
  color: ok ? "#E8DCC0" : "#f87171",
});

// The signed-in organizer's own profile: view/edit details and change password.
type OrgRecord = { id: number; name: string; username?: string; logo?: string | null; banner?: string | null; description?: string | null; email?: string | null; phone?: string | null };

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const token = user?.token;

  useEffect(() => {
    if (user && user.role !== "organizer") router.replace("/admin");
  }, [user, router]);

  // ── The organizer's own record, fetched by identity (not looked up by name in a shared list) ──
  const [org, setOrg] = useState<OrgRecord | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "expired" | "missing" | "error">("loading");

  const loadOrg = useCallback(async () => {
    if (!user || user.role !== "organizer") return;
    if (!token) { setLoadState("expired"); return; }          // session from before sign-in tokens existed
    setLoadState("loading");
    try {
      const res = await fetch("/api/organizers/me", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (res.status === 401) { setLoadState("expired"); return; }
      if (res.status === 404) { setLoadState("missing"); return; }
      if (!res.ok) throw new Error(String(res.status));
      setOrg(await res.json());
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, [user, token]);
  useEffect(() => { loadOrg(); }, [loadOrg]);

  // ── Details ──
  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [detailsMsg, setDetailsMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const fillForm = (o: OrgRecord) => {
    setLogo(o.logo ?? ""); setBanner(o.banner ?? ""); setDescription(o.description ?? "");
    setEmail(o.email ?? ""); setPhone(o.phone ?? "");
  };
  const orgId = org?.id;
  useEffect(() => {
    if (org) fillForm(org);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const saveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org || saving) return;
    setSaving(true); setDetailsMsg(null);
    // Name and username stay as set by the admin; only the profile fields change.
    try {
      const res = await fetch("/api/organizers/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ logo, banner, description, email, phone }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setOrg(body); fillForm(body);
        setDetailsMsg({ ok: true, text: "Your details have been saved." });
      } else {
        setDetailsMsg({ ok: false, text: res.status === 401 ? "Your session has expired — please sign in again." : body.error || "Couldn't save — please try again." });
      }
    } catch {
      setDetailsMsg({ ok: false, text: "Couldn't reach the server — please check your connection and try again." });
    }
    setSaving(false);
  };

  // ── Password ──
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwSaving || !user) return;
    if (newPw.length < 6) { setPwMsg({ ok: false, text: "New password must be at least 6 characters." }); return; }
    if (newPw !== confirmPw) { setPwMsg({ ok: false, text: "New password and confirmation don't match." }); return; }
    setPwSaving(true); setPwMsg(null);
    try {
      const res = await fetch("/api/organizers/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, currentPassword: currentPw, newPassword: newPw }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setPwMsg({ ok: true, text: "Password updated. Use the new one next time you sign in." });
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
      } else {
        setPwMsg({ ok: false, text: body.error || "Couldn't update the password." });
      }
    } catch {
      setPwMsg({ ok: false, text: "Couldn't reach the server — please try again." });
    }
    setPwSaving(false);
  };

  if (user?.role !== "organizer") return null;

  return (
    <div style={{ padding: 32, maxWidth: 860 }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 10, color: "#E8DCC0", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>{user.orgName}</p>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em" }}>My Profile</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>Your organizer details as shown on the site, and your sign-in password.</p>
      </div>

      {/* Details */}
      <form onSubmit={saveDetails} style={panel}>
        <p style={sectionHead}>Organizer Details</p>

        {!org ? (
          loadState === "loading" ? (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Loading your details…</p>
          ) : (
            <div style={note(false)}>
              {loadState === "expired" && "Your session is out of date. Please sign out and sign in again to see and edit your details."}
              {loadState === "missing" && "We couldn't find your organizer record. Please contact the DiscoverEvents.lk team."}
              {loadState === "error" && "We couldn't load your details. Please check your connection and try again."}
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                {loadState === "expired" ? (
                  <button type="button" onClick={() => { logout(); router.replace("/admin/login"); }} style={{ padding: "8px 16px", borderRadius: 8, background: "#2B2E36", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Sign in again</button>
                ) : loadState === "error" ? (
                  <button type="button" onClick={loadOrg} style={{ padding: "8px 16px", borderRadius: 8, background: "#2B2E36", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Try again</button>
                ) : null}
              </div>
            </div>
          )
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Organizer Name</label>
                <input style={readOnlyStyle} value={org.name} readOnly />
              </div>
              <div>
                <label style={labelStyle}>Username</label>
                <input style={readOnlyStyle} value={org.username ?? user.username} readOnly />
              </div>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: -8, marginBottom: 20 }}>
              Name and username are set by the DiscoverEvents.lk team — contact them if these need to change.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24, marginBottom: 20 }}>
              <ImageUpload label="Logo" value={logo} onChange={setLogo} aspectRatio="square" hint="Square 1:1 · Recommended 400 × 400 px · PNG, JPG, WEBP · Max 5 MB" />
              <ImageUpload label="Banner Image" value={banner} onChange={setBanner} aspectRatio="wide" hint="Wide banner 16:5 · Recommended 1600 × 500 px · PNG, JPG, WEBP · Max 5 MB" />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Description</label>
              <textarea style={{ ...inputStyle, height: 90, resize: "vertical" }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description of your organization…" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Contact Email</label>
                <input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="bookings@organizer.com" />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input type="tel" style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+94 77 123 4567" />
              </div>
            </div>

            {detailsMsg && <div style={note(detailsMsg.ok)}>{detailsMsg.text}</div>}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 26px", borderRadius: 8, background: saving ? "rgba(43,46,54,0.5)" : "#2B2E36", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                <Check size={14} /> {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </form>

      {/* Password */}
      <form onSubmit={changePassword} style={panel}>
        <p style={sectionHead}>Change Password</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Current Password</label>
            <PasswordInput style={inputStyle} value={currentPw} onChange={e => setCurrentPw(e.target.value)} autoComplete="current-password" required />
          </div>
          <div>
            <label style={labelStyle}>New Password</label>
            <PasswordInput style={inputStyle} value={newPw} onChange={e => setNewPw(e.target.value)} autoComplete="new-password" placeholder="At least 6 characters" required />
          </div>
          <div>
            <label style={labelStyle}>Confirm New Password</label>
            <PasswordInput style={inputStyle} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} autoComplete="new-password" required />
          </div>
        </div>

        {pwMsg && <div style={note(pwMsg.ok)}>{pwMsg.text}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" disabled={pwSaving || !currentPw || !newPw || !confirmPw} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 26px", borderRadius: 8, background: (pwSaving || !currentPw || !newPw || !confirmPw) ? "rgba(43,46,54,0.5)" : "#2B2E36", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: (pwSaving || !currentPw || !newPw || !confirmPw) ? "not-allowed" : "pointer", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <Lock size={14} /> {pwSaving ? "Updating…" : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}

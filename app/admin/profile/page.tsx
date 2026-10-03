"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useAdminData } from "../../context/AdminDataContext";
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
const sectionHead: React.CSSProperties = { fontSize: 10, fontWeight: 800, color: "#39BD69", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 18 };
const note = (ok: boolean): React.CSSProperties => ({
  marginBottom: 16, padding: "12px 16px", borderRadius: 8, fontSize: 13,
  background: ok ? "rgba(57,189,105,0.1)" : "rgba(239,68,68,0.1)",
  border: `1px solid ${ok ? "rgba(57,189,105,0.3)" : "rgba(239,68,68,0.3)"}`,
  color: ok ? "#39BD69" : "#f87171",
});

// The signed-in organizer's own profile: view/edit details and change password.
export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { organizers, updateOrganizer } = useAdminData();
  const org = organizers.find(o => o.name === user?.orgName);

  useEffect(() => {
    if (user && user.role !== "organizer") router.replace("/admin");
  }, [user, router]);

  // ── Details ──
  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [detailsMsg, setDetailsMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const orgId = org?.id;
  useEffect(() => {
    if (!org) return;
    setLogo(org.logo ?? ""); setBanner(org.banner ?? ""); setDescription(org.description ?? "");
    setEmail(org.email ?? ""); setPhone(org.phone ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const saveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org || saving) return;
    setSaving(true); setDetailsMsg(null);
    // Name and username stay as set by the admin; only the profile fields change.
    const ok = await updateOrganizer({
      id: org.id, name: org.name, username: org.username,
      logo: logo || undefined, banner: banner || undefined, description: description || undefined,
      email: email || undefined, phone: phone || undefined,
    });
    setSaving(false);
    setDetailsMsg(ok ? { ok: true, text: "Your details have been saved." } : { ok: false, text: "Couldn't save — please check your connection and try again." });
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
        <p style={{ fontSize: 10, color: "#39BD69", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>{user.orgName}</p>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em" }}>My Profile</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>Your organizer details as shown on the site, and your sign-in password.</p>
      </div>

      {/* Details */}
      <form onSubmit={saveDetails} style={panel}>
        <p style={sectionHead}>Organizer Details</p>

        {!org ? (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Loading your details…</p>
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
              <button type="submit" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 26px", borderRadius: 8, background: saving ? "rgba(57,189,105,0.5)" : "#39BD69", border: "none", color: "#000", fontSize: 13, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", textTransform: "uppercase", letterSpacing: "0.08em" }}>
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
          <button type="submit" disabled={pwSaving || !currentPw || !newPw || !confirmPw} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 26px", borderRadius: 8, background: (pwSaving || !currentPw || !newPw || !confirmPw) ? "rgba(57,189,105,0.3)" : "#39BD69", border: "none", color: "#000", fontSize: 13, fontWeight: 800, cursor: (pwSaving || !currentPw || !newPw || !confirmPw) ? "not-allowed" : "pointer", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <Lock size={14} /> {pwSaving ? "Updating…" : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { CalendarDays, Users, Building2, ImageIcon, Tag, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/events",     label: "Events",     icon: CalendarDays,    roles: ["admin", "organizer"] },
  { href: "/admin/artists",    label: "Artists",    icon: Users,           roles: ["admin"] },
  { href: "/admin/organizers", label: "Organizers", icon: Building2,       roles: ["admin"] },
  { href: "/admin/genres",     label: "Genres",     icon: Tag,             roles: ["admin"] },
  { href: "/admin/banners",    label: "Banners",    icon: ImageIcon,       roles: ["admin"] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [mounted, user, pathname, router]);

  // Login page — no shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Not yet hydrated or not authed — show nothing to prevent flash
  if (!mounted || !user) {
    return (
      <div style={{ background: "#080808", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Loading…</span>
      </div>
    );
  }

  const visibleItems = NAV_ITEMS.filter(item => (item.roles as readonly string[]).includes(user.role));

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#0d0d0d", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0, background: "#0a0a0a",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh",
      }}>
        {/* Brand */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontSize: 10, color: "#39BD69", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 4 }}>Admin Panel</p>
          <h1 style={{ fontSize: 14, fontWeight: 900, color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase" }}>EVENTS.LK</h1>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {visibleItems.map(item => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", borderRadius: 8,
                  background: isActive ? "rgba(57,189,105,0.12)" : "transparent",
                  border: isActive ? "1px solid rgba(57,189,105,0.2)" : "1px solid transparent",
                  color: isActive ? "#39BD69" : "rgba(255,255,255,0.45)",
                  fontSize: 13, fontWeight: isActive ? 700 : 500,
                  cursor: "pointer", transition: "all 0.15s",
                  letterSpacing: "0.02em",
                }}>
                  <Icon size={15} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: "16px 12px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", marginBottom: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{user.username}</p>
            <p style={{ fontSize: 10, color: "#39BD69", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em" }}>{user.role}</p>
          </div>
          <button
            onClick={() => { logout(); router.push("/admin/login"); }}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "8px 12px", borderRadius: 8,
              background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600,
              cursor: "pointer", letterSpacing: "0.05em", transition: "all 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.4)"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; }}
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, background: "#111", overflowY: "auto", height: "100vh" }}>
        {children}
      </main>
    </div>
  );
}

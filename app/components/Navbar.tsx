"use client";

import { useState } from "react";
import { Menu, X, User, Music2 } from "lucide-react";

const navLinks = [
  { label: "Home",           href: "#",        active: true  },
  { label: "About Us",       href: "#about",   active: false },
  { label: "Explore Events", href: "#events",  active: false },
  { label: "Upcoming Events",href: "#upcoming",active: false },
  { label: "Artists",        href: "#artists", active: false },
  { label: "Contact Us",     href: "#contact", active: false },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
              <Music2 size={15} className="text-white" />
            </div>
            <div className="leading-none">
              <span className="text-white font-black text-sm tracking-[0.2em] uppercase">EVENTS</span>
              <br />
              <span className="text-white/40 text-[9px] tracking-[0.3em] uppercase">COMPANY</span>
            </div>
          </a>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href}
                className={`text-xs tracking-widest uppercase font-medium transition-colors duration-300 relative pb-1 ${
                  l.active
                    ? "text-white/55 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#e91e8c]"
                    : "text-white/55 hover:text-[#e91e8c]"
                }`}>
                {l.label}
              </a>
            ))}
          </div>

          {/* Right */}
          <div className="hidden lg:flex items-center gap-3">
            <button className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-white/60 transition-colors">
              <User size={15} className="text-white/60" />
            </button>
            <button className="btn-outline text-xs px-6 py-2.5 rounded-full">
              GET UPDATES
            </button>
          </div>

          {/* Mobile toggle */}
          <button className="lg:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-black/95 border-t border-white/10 px-4 py-4">
          <div className="flex flex-col gap-3">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href}
                className="text-white/60 hover:text-white py-2 border-b border-white/5 text-sm tracking-widest uppercase transition-colors"
                onClick={() => setMobileOpen(false)}>
                {l.label}
              </a>
            ))}
            <button className="btn-primary text-xs px-6 py-2.5 rounded-full mt-2 w-full">
              GET UPDATES
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

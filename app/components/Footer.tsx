"use client";

import { ArrowRight } from "lucide-react";

/* ── Social SVG Icons ─────────────────────────────────────────────────── */
const SvgFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const SvgTwitter = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);
const SvgYoutube = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="#000" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
);
const SvgTiktok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.7a8.19 8.19 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.13z"/></svg>
);
const SvgInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);
const SvgLinkedin = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
);

const SvgCamera = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={12} height={12}><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);

const upperSocials = [
  { Icon: SvgFacebook }, { Icon: SvgTwitter }, { Icon: SvgYoutube },
  { Icon: SvgTiktok },   { Icon: SvgInstagram }, { Icon: SvgLinkedin },
];

const bottomSocials = [
  { Icon: SvgFacebook }, { Icon: SvgTwitter }, { Icon: SvgYoutube },
  { Icon: SvgTiktok },   { Icon: SvgInstagram },
];

const navLinks = [
  { label: "Home", href: "#" }, { label: "About Us", href: "#about" },
  { label: "Explore Events", href: "#events" }, { label: "Upcoming Events", href: "#upcoming" },
  { label: "Artists", href: "#artists" }, { label: "Contact Us", href: "#contact" },
];

export default function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden">

      {/* ── Background image ──────────────────────────────────────── */}
      <img
        src="/bg/footer.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10">

        {/* ═══════════════════════════════════════════════════════════
            UPPER SECTION — 3-column: image | socials | newsletter
           ═══════════════════════════════════════════════════════════ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="rounded-2xl border border-white/15 overflow-hidden grid grid-cols-1 md:grid-cols-3">

            {/* ── Left: People Image ──────────────────────────────── */}
            <div className="relative h-64 md:h-auto">
              <img
                src="/bg/footer-people.png"
                alt="Events crowd"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-1.5">
                <SvgCamera />
                <span className="text-white/60 font-semibold text-[10px] tracking-[0.2em] uppercase">
                  @SAMPLE-EVENT
                </span>
              </div>
            </div>

            {/* ── Middle: Follow Us / Socials ─────────────────────── */}
            <div className="p-8 flex flex-col justify-center border-l border-white/10">
              <p className="text-white/30 text-[10px] font-semibold tracking-[0.4em] uppercase mb-2">
                SOCIAL LINKS
              </p>
              <h3 className="text-white font-black text-3xl uppercase mb-8 tracking-tight">
                Follow Us
              </h3>
              <div className="grid grid-cols-3 gap-3 max-w-[180px]">
                {upperSocials.map(({ Icon }, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:border-white transition-all text-white hover:text-black"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>

            {/* ── Right: Newsletter ───────────────────────────────── */}
            <div className="p-8 flex flex-col justify-center border-l border-white/10">
              <p className="text-white/30 text-[10px] font-semibold tracking-[0.4em] uppercase mb-2">
                NEWSLETTER SUBSCRIPTION
              </p>
              <h3 className="text-white font-black text-3xl uppercase mb-4 leading-tight tracking-tight">
                Never Miss An Event
              </h3>
              <p className="text-white/45 text-sm mb-6 leading-relaxed">
                Get weekly updates about concerts, festivals, workshops, nightlife events,
                and exclusive early-bird ticket offers directly to your inbox.
              </p>
              <p className="text-white/30 text-[10px] font-semibold tracking-[0.3em] uppercase mb-2">
                YOUR EMAIL
              </p>
              <div className="flex gap-0">
                <input
                  type="email"
                  placeholder="ENTER YOUR EMAIL HERE"
                  className="flex-1 bg-black/30 border border-white/15 border-r-0 rounded-l-lg px-4 py-3 text-white text-xs outline-none focus:border-white/40 transition-colors placeholder:text-white/20 placeholder:tracking-[0.15em]"
                />
                <button
                  className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] uppercase px-6 py-3 rounded-r-lg whitespace-nowrap transition-all hover:brightness-110"
                  style={{ background: "#39BD69", color: "#fff" }}
                >
                  SUBMIT <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            CONTACT INFO BAR
           ═══════════════════════════════════════════════════════════ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm">
            <p className="text-white/50 text-xs leading-relaxed">
              Event Company (Pvt) Ltd. Block A, Lorem Ipsum 001<br />
              Lorem Ipsum, Dolor 12345, Sri Lanka
            </p>
            <p className="text-white/50 text-xs">
              Email: <a href="mailto:info@eventcompany.lk" className="text-white font-semibold hover:underline transition-colors">info@eventcompany.lk</a>
            </p>
            <p className="text-white/50 text-xs">
              Telephone: <span className="text-white font-semibold">+94 11 234 5678</span>
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            MID SECTION — logo + nav links + legal
           ═══════════════════════════════════════════════════════════ */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">

              {/* Logo */}
              <a href="#" className="flex items-center gap-3 flex-shrink-0">
                <div className="w-16 h-16 flex items-center justify-center">
                  <img
                    src="/bg/footer.png"
                    alt="Events Company"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback if footer.png is the background not the logo
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="leading-none">
                  <span className="text-white font-black text-xl tracking-[0.15em] uppercase">EVENTS</span>
                  <br />
                  <span className="text-white/50 text-[10px] tracking-[0.35em] uppercase">COMPANY</span>
                </div>
              </a>

              {/* Nav links + legal */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3">
                  {navLinks.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      className="text-white/60 hover:text-white text-sm transition-colors"
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-white/40 text-sm">
                  <a href="#" className="hover:text-white/70 transition-colors">Privacy Policy</a>
                  <span className="text-white/20">|</span>
                  <a href="#" className="hover:text-white/70 transition-colors">Terms and Conditions</a>
                  <span className="text-white/20">|</span>
                  <a href="#" className="hover:text-white/70 transition-colors">Site Map</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            BOTTOM BAR — copyright + socials
           ═══════════════════════════════════════════════════════════ */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-white/35 text-xs">
                  &copy; 2026 Event Company (Pvt) Ltd. All Rights Reserved.
                </p>
                <p className="text-white/35 text-xs">
                  Design and Development by <span className="text-white/60 font-semibold">Codexium</span>
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                {bottomSocials.map(({ Icon }, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:border-white transition-all text-white/60 hover:text-black"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}

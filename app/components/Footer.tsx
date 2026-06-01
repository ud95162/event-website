"use client";

const SvgFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={15} height={15}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const SvgTwitter = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={15} height={15}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);
const SvgYoutube = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={15} height={15}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="#000" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
);
const SvgTiktok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={15} height={15}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.7a8.19 8.19 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.13z"/></svg>
);
const SvgInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);

const socials = [
  { Icon: SvgFacebook },
  { Icon: SvgTwitter },
  { Icon: SvgYoutube },
  { Icon: SvgTiktok },
  { Icon: SvgInstagram },
];

const navLinks = [
  { label: "Home",     href: "/"        },
  { label: "Events",   href: "/events"  },
  { label: "Artists",  href: "/artists" },
  { label: "About Us", href: "/#about"  },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-black border-t border-white/10">

      {/* ── Main grid ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Logo */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <a href="/" className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 40 40" fill="none" width={28} height={28}>
                  <path d="M20 5 C20 5 28 10 28 20 C28 28 22 33 20 35 C18 33 12 28 12 20 C12 10 20 5 20 5Z" stroke="white" strokeWidth="1.5" fill="none"/>
                  <circle cx="20" cy="20" r="4" fill="white"/>
                  <path d="M14 16 Q20 8 26 16" stroke="white" strokeWidth="1.2" fill="none"/>
                </svg>
              </div>
              <div className="leading-none">
                <span className="text-white font-black text-xl tracking-[0.15em] uppercase">EVENTS</span>
                <br />
                <span className="text-white/50 text-[13px] tracking-[0.3em] uppercase">Company</span>
              </div>
            </a>
          </div>

          {/* Nav links */}
          <div className="md:col-span-1">
            <ul className="flex flex-col gap-3">
              {navLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-white/60 hover:text-white text-base transition-colors duration-200"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div className="md:col-span-1 flex flex-col gap-3 text-white/55 text-base leading-relaxed">
            <p>
              Event Company (Pvt) Ltd.<br />
              Colombo, Sri Lanka
            </p>
            <p>
              Email:{" "}
              <a href="mailto:info@eventcompany.lk" className="text-white font-semibold hover:underline">
                info@eventcompany.lk
              </a>
            </p>
            <p>
              Telephone:{" "}
              <span className="text-white font-semibold">+94 11 234 5678</span>
            </p>
          </div>

          {/* Legal + socials */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <ul className="flex flex-col gap-2">
              {["Privacy Policy", "Terms and Conditions", "Site Map"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-white font-semibold text-base hover:text-white/70 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2.5 mt-2">
              {socials.map(({ Icon }, i) => (
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

      {/* ── Bottom bar ────────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/35 text-sm">
            &copy; 2026 Event Company (Pvt) Ltd. All Rights Reserved.
          </p>
          <p className="text-white/35 text-sm">
            Design and Development by <span className="text-white/60 font-semibold">Codexium</span>
          </p>
        </div>
      </div>

    </footer>
  );
}

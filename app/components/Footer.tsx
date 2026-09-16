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
const SvgWhatsapp = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.48s1.06 2.87 1.21 3.07c.15.2 2.09 3.2 5.07 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z"/><path d="M12.04 2A9.94 9.94 0 0 0 2.1 11.94c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.78 1.22h.01A9.94 9.94 0 0 0 22 11.94 9.94 9.94 0 0 0 12.04 2zm5.83 14.21c-.25.7-1.44 1.32-2.01 1.41m2.01-1.41 0 0zM12.05 20.1h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38 8.26 8.26 0 0 1 8.25-8.24 8.25 8.25 0 0 1 8.24 8.25 8.26 8.26 0 0 1-8.25 8.24z"/></svg>
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
    <footer id="contact" className="bg-black flex-1 flex flex-col justify-center py-6">

      {/* ── Main grid ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-[2.6fr_0.7fr_1.7fr_1fr] gap-12 lg:gap-16">

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

            {/* Follow Us + social icons */}
            <div className="mt-1">
              <p className="text-white/30 text-[11px] font-semibold tracking-[0.3em] uppercase mb-4">Follow Us</p>
              <div className="flex items-center gap-3">
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

            {/* Join WhatsApp Community */}
            <a
              href="https://whatsapp.com/channel/"
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-2 flex max-w-md items-center gap-4 rounded-2xl border border-[#25D366]/25 bg-[#25D366]/[0.07] p-4 transition-all hover:border-[#25D366]/50 hover:bg-[#25D366]/[0.12]"
            >
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                <SvgWhatsapp size={24} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-white/45">Get updates &amp; exclusive deals</span>
                <span className="block text-[15px] font-bold leading-snug text-white">Join Our WhatsApp Community</span>
              </span>
              <span className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white transition-transform group-hover:-translate-y-0.5">
                Join <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            </a>
          </div>

          {/* Nav links */}
          <div className="md:col-span-1">
            <p className="text-white/30 text-[11px] font-semibold tracking-[0.3em] uppercase mb-5">Navigation</p>
            <ul className="flex flex-col gap-5">
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
          <div className="md:col-span-1 flex flex-col gap-5 text-white/55 text-base leading-relaxed">
            <p className="text-white/30 text-[11px] font-semibold tracking-[0.3em] uppercase">Contact</p>
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
          <div className="md:col-span-1 flex flex-col gap-5">
            <p className="text-white/30 text-[11px] font-semibold tracking-[0.3em] uppercase">Legal</p>
            <ul className="flex flex-col gap-5 -mt-1">
              {["Privacy Policy", "Terms and Conditions", "Site Map"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-white font-semibold text-base hover:text-white/70 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-0 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/35 text-sm">
            &copy; 2026 Event Company (Pvt) Ltd. All Rights Reserved.
          </p>
          <p className="text-white/35 text-sm">
            Designed and Developed by <span className="text-white/60 font-semibold">HWC</span>
          </p>
        </div>
      </div>

    </footer>
  );
}

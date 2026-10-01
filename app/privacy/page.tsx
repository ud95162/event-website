"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ParticleField from "../components/ParticleField";
import { ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

const LAST_UPDATED = "October 1, 2026";

type Section = { heading: string; body: React.ReactNode };

const SECTIONS: Section[] = [
  {
    heading: "1. Introduction",
    body: (
      <>
        DiscoverEvents.lk (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the
        DiscoverEvents.lk website and services (the &ldquo;Platform&rdquo;). This Privacy Policy explains what
        information we collect when you use the Platform, how we use and protect it, and the
        choices you have. By using the Platform you agree to the practices described here.
      </>
    ),
  },
  {
    heading: "2. Information We Collect",
    body: (
      <>
        <p>We collect the following types of information:</p>
        <ul>
          <li><strong>Information you provide:</strong> name, email address, and phone number when you contact us, subscribe to updates, or join our WhatsApp community.</li>
          <li><strong>Event activity:</strong> events, artists, and organizers you view, search for, like, or share on the Platform.</li>
          <li><strong>Location data:</strong> with your permission, approximate location to show events near you. You can decline this and still use the Platform.</li>
          <li><strong>Technical data:</strong> device type, browser, IP address, and usage information collected automatically to keep the Platform secure and working.</li>
        </ul>
      </>
    ),
  },
  {
    heading: "3. How We Use Your Information",
    body: (
      <>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Show you relevant events, artists, and recommendations;</li>
          <li>Send updates, announcements, and offers you have asked to receive;</li>
          <li>Respond to your enquiries and provide support;</li>
          <li>Operate, maintain, analyze, and improve the Platform;</li>
          <li>Detect, prevent, and address fraud, abuse, or security issues.</li>
        </ul>
      </>
    ),
  },
  {
    heading: "4. Cookies & Local Storage",
    body: (
      <>
        We use cookies and your browser&rsquo;s local storage to remember your preferences, keep
        recently viewed content available instantly, and understand how the Platform is used.
        You can clear or block these through your browser settings; some features may not work
        as well if you do.
      </>
    ),
  },
  {
    heading: "5. How We Share Information",
    body: (
      <>
        <p>
          We do not sell your personal information. We share it only in these limited cases:
        </p>
        <ul>
          <li><strong>Service providers</strong> who help us run the Platform (e.g. hosting, analytics, messaging), under confidentiality obligations;</li>
          <li><strong>Event organizers</strong> when you choose to register for or enquire about their event;</li>
          <li><strong>Legal reasons</strong> when required by law or to protect our rights, users, or the public.</li>
        </ul>
      </>
    ),
  },
  {
    heading: "6. Data Security",
    body: (
      <>
        We use reasonable technical and organizational measures to protect your information
        against loss, misuse, and unauthorized access. No method of transmission or storage is
        completely secure, so we cannot guarantee absolute security.
      </>
    ),
  },
  {
    heading: "7. Data Retention",
    body: (
      <>
        We keep your information only for as long as needed to provide the Platform and for the
        legitimate and legal purposes described in this policy. When it is no longer needed, we
        delete or anonymize it.
      </>
    ),
  },
  {
    heading: "8. Your Rights",
    body: (
      <>
        <p>Depending on your location, you may have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you;</li>
          <li>Correct inaccurate information;</li>
          <li>Request deletion of your information;</li>
          <li>Withdraw consent or unsubscribe from marketing messages at any time.</li>
        </ul>
        <p>To exercise any of these, contact us using the details below.</p>
      </>
    ),
  },
  {
    heading: "9. Third-Party Links",
    body: (
      <>
        The Platform may link to third-party websites or services (such as ticketing partners,
        social media, or video providers). We are not responsible for their privacy practices,
        and we encourage you to review their policies.
      </>
    ),
  },
  {
    heading: "10. Children's Privacy",
    body: (
      <>
        The Platform is not directed at children under 16, and we do not knowingly collect their
        personal information. If you believe a child has provided us information, please contact
        us and we will remove it.
      </>
    ),
  },
  {
    heading: "11. Changes to This Policy",
    body: (
      <>
        We may update this Privacy Policy from time to time. When we do, we will revise the
        &ldquo;Last updated&rdquo; date above. Significant changes may also be communicated through the
        Platform.
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  const scroll: React.CSSProperties = {
    marginTop: 64,
    height: "calc(100dvh - 64px)",
    overflowY: "auto",
    position: "relative",
    zIndex: 1,
  };

  return (
    <div style={{ background: "#0F1116", color: "#fff", height: "100dvh", overflowX: "hidden" }}>
      <ParticleField />
      <Navbar />

      <div style={scroll}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "clamp(32px,6vh,72px) 24px 24px" }}>

          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <span
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 14px", borderRadius: 999, marginBottom: 20,
                background: "rgba(57,189,105,0.1)", border: "1px solid rgba(57,189,105,0.3)",
                color: "#39BD69", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
              }}
            >
              <ShieldCheck size={13} /> Legal
            </span>
            <h1 style={{ fontSize: "clamp(2rem,5vw,3.25rem)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
              Privacy{" "}
              <span style={{ background: "linear-gradient(90deg,#39BD69,#e91e8c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Policy
              </span>
            </h1>
            <p style={{ marginTop: 14, color: "rgba(255,255,255,0.4)", fontSize: 13, letterSpacing: "0.04em" }}>
              Last updated: {LAST_UPDATED}
            </p>
          </div>

          {/* Sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {SECTIONS.map((s) => (
              <section key={s.heading}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 12, letterSpacing: "0.01em" }}>
                  {s.heading}
                </h2>
                <div className="pp-body" style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.7 }}>
                  {s.body}
                </div>
              </section>
            ))}

            {/* Contact */}
            <section>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 12 }}>12. Contact Us</h2>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
                If you have questions about this Privacy Policy or how we handle your information,
                reach out to us:
              </p>
              <div
                style={{
                  display: "flex", flexDirection: "column", gap: 12,
                  padding: 20, borderRadius: 16,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <MapPin size={15} style={{ color: "#39BD69", flexShrink: 0 }} />
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>DiscoverEvents.lk, Colombo, Sri Lanka</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Mail size={15} style={{ color: "#39BD69", flexShrink: 0 }} />
                  <a href="mailto:info@discoverevents.lk" style={{ color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>info@discoverevents.lk</a>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Phone size={15} style={{ color: "#39BD69", flexShrink: 0 }} />
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>+94 11 234 5678</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <Footer />
      </div>

      <style jsx global>{`
        .pp-body p { margin-bottom: 12px; }
        .pp-body p:last-child { margin-bottom: 0; }
        .pp-body ul { list-style: disc; padding-left: 22px; display: flex; flex-direction: column; gap: 8px; }
        .pp-body li { padding-left: 4px; }
        .pp-body strong { color: rgba(255,255,255,0.85); font-weight: 700; }
      `}</style>
    </div>
  );
}

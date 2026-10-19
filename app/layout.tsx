import type { Metadata } from "next";
import "./globals.css";
import { LocationProvider } from "./context/LocationContext";
import { AuthProvider } from "./context/AuthContext";
import { AdminDataProvider } from "./context/AdminDataContext";
import ScrollReveal from "./components/ScrollReveal";
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from "./lib/seo";

const HOME_TITLE = "DiscoverEvents.lk | Sri Lanka’s Events & Talent, All in One Place";
const HOME_DESCRIPTION =
  "Discover concerts, festivals, club nights, quiz nights, workshops, conferences and the talent behind them, across Sri Lanka. Never miss what’s happening.";

export const metadata: Metadata = {
  // Lets the relative image/URL paths below (and on every page) become absolute links.
  metadataBase: new URL(SITE_URL),
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: "/",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "DiscoverEvents.lk" }],
  },
  twitter: { card: "summary_large_image", title: HOME_TITLE, description: HOME_DESCRIPTION, images: [DEFAULT_OG_IMAGE] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload the font weights the header/hero use so text doesn't flash in a
            fallback then reflow. crossOrigin is required even same-origin — fonts are
            always fetched in CORS mode, so the preload must match. */}
        {["Regular", "Bold", "ExtraBold", "Black"].map((w) => (
          <link
            key={w}
            rel="preload"
            as="font"
            type="font/ttf"
            href={`/Century-Gothic-Sans-Font/CenturyGothicPaneuropean${w}.ttf`}
            crossOrigin="anonymous"
          />
        ))}
        {/* Preload the logo first so it's ready when the preloader shows it */}
        <link rel="preload" as="image" href="/logo.png" fetchPriority="high" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <AdminDataProvider>
            <LocationProvider>{children}</LocationProvider>
            <ScrollReveal />
          </AdminDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

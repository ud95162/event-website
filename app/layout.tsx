import type { Metadata } from "next";
import "./globals.css";
import { LocationProvider } from "./context/LocationContext";
import { AuthProvider } from "./context/AuthContext";
import { AdminDataProvider } from "./context/AdminDataContext";

export const metadata: Metadata = {
  title: "Events.lk — Experience the Biggest Music Festivals",
  description:
    "Discover the best concerts, festivals, DJ nights, and live events in Sri Lanka. Browse featured events, artists, and upcoming experiences.",
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
        <link rel="preload" as="image" href="/preloader-logo.png" fetchPriority="high" />
        {["/events/event1.png", "/events/event2.png", "/events/event3.png", "/events/event4.png",
          "/artists/1.png", "/artists/2.png", "/artists/3.png", "/artists/4.png"].map(src => (
          <link key={src} rel="preload" as="image" href={src} />
        ))}
      </head>
      <body className="antialiased">
        <AuthProvider>
          <AdminDataProvider>
            <LocationProvider>{children}</LocationProvider>
          </AdminDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

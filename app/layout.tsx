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

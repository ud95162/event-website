import type { Metadata } from "next";
import "./globals.css";
import { LocationProvider } from "./context/LocationContext";

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
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <LocationProvider>{children}</LocationProvider>
      </body>
    </html>
  );
}

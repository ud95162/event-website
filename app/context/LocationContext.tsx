"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type UserLocation = {
  city:    string;
  country: string;
  lat:     number;
  lon:     number;
};

type LocationCtx = {
  userLocation:    UserLocation | null;
  setUserLocation: (loc: UserLocation | null) => void;
};

const LocationContext = createContext<LocationCtx>({
  userLocation:    null,
  setUserLocation: () => {},
});

export function LocationProvider({ children }: { children: ReactNode }) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  return (
    <LocationContext.Provider value={{ userLocation, setUserLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useUserLocation = () => useContext(LocationContext);

/* Haversine distance in km */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R    = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km: number): string {
  if (km < 1)    return `${Math.round(km * 1000)} m away`;
  if (km < 10)   return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
}

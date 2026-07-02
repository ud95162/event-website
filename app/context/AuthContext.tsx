"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "admin" | "organizer";

export type AuthUser = {
  username: string;
  role: UserRole;
};

type AuthContextType = {
  user: AuthUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
};

const USERS = [
  { username: "admin", password: "admin123", role: "admin" as UserRole },
  { username: "organizer", password: "org123", role: "organizer" as UserRole },
];

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const found = USERS.find(u => u.username === username && u.password === password);
    if (!found) return false;
    const authUser: AuthUser = { username: found.username, role: found.role };
    setUser(authUser);
    localStorage.setItem("admin_user", JSON.stringify(authUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("admin_user");
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

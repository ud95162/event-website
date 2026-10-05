import crypto from "crypto";

// Signed session token, issued by /api/auth/login and checked by endpoints that expose or change
// private data (contact messages, an organizer's own profile). Stateless:
// "<base64url payload>.<hmac>", valid for 12 hours.
// Set AUTH_SECRET on the server; without it a secret is derived from the DB password.

const TTL_MS = 12 * 60 * 60 * 1000;
const secret = () => process.env.AUTH_SECRET || `${process.env.MYSQL_PASSWORD || "dev"}|events-lk-admin-token`;
const sign = (payload: string) => crypto.createHmac("sha256", secret()).update(payload).digest("hex");

export type AuthInfo = { u: string; role: "admin" | "organizer"; oid?: number };

function issue(info: AuthInfo): string {
  const payload = Buffer.from(JSON.stringify({ ...info, exp: Date.now() + TTL_MS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export const signAdminToken = (username: string) => issue({ u: username, role: "admin" });
/** Organizer token: carries the organizer's id, so the server never trusts a client-sent name. */
export const signOrganizerToken = (username: string, organizerId: number) => issue({ u: username, role: "organizer", oid: organizerId });

/** The verified identity in the request's `Authorization: Bearer …` token, or null. */
export function getAuth(req: Request): AuthInfo | null {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const d = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof d.exp !== "number" || d.exp <= Date.now()) return null;
    if (d.role === "admin") return { u: d.u, role: "admin" };
    if (d.role === "organizer" && Number.isInteger(d.oid)) return { u: d.u, role: "organizer", oid: d.oid };
    return null;
  } catch { return null; }
}

/** True when the request carries a valid, unexpired admin token. */
export const isAdminRequest = (req: Request): boolean => getAuth(req)?.role === "admin";

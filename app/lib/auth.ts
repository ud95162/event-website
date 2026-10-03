import crypto from "crypto";

// Signed admin token, issued by /api/auth/login and checked by endpoints that expose private
// data (contact messages). Stateless: "<base64url payload>.<hmac>", valid for 12 hours.
// Set AUTH_SECRET on the server; without it a secret is derived from the DB password.

const TTL_MS = 12 * 60 * 60 * 1000;
const secret = () => process.env.AUTH_SECRET || `${process.env.MYSQL_PASSWORD || "dev"}|events-lk-admin-token`;
const sign = (payload: string) => crypto.createHmac("sha256", secret()).update(payload).digest("hex");

export function signAdminToken(username: string): string {
  const payload = Buffer.from(JSON.stringify({ u: username, role: "admin", exp: Date.now() + TTL_MS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** True when the request carries a valid, unexpired admin token (Authorization: Bearer …). */
export function isAdminRequest(req: Request): boolean {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const d = JSON.parse(Buffer.from(payload, "base64url").toString());
    return d.role === "admin" && typeof d.exp === "number" && d.exp > Date.now();
  } catch { return false; }
}

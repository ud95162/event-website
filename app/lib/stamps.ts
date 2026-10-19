// "Added" / "last modified" timestamps (created_at / updated_at on every content table).

/** SQL fragment for hand-written SELECT lists. */
export const STAMPS_SQL = "created_at AS createdAt, updated_at AS updatedAt";

/** DB value (Date or string) -> ISO string, or undefined when missing. */
export function toIso(v: unknown): string | undefined {
  if (!v) return undefined;
  const d = v instanceof Date ? v : new Date(String(v).replace(" ", "T") + (typeof v === "string" && !/[zZ+]/.test(v) ? "Z" : ""));
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/** "12 Oct 2026" for display in the admin. */
export function fmtStamp(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

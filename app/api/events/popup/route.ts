import { NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { cols } from "../../../lib/select";
import { ensureSchema } from "../../../lib/schema";
import { mapEventRow } from "../../../lib/mappers";

// Dedicated endpoint for the "This Week" popup. Returns exactly the events the popup
// should show, based on the admin's popup mode (read server-side):
//   manual → events flagged for the popup
//   auto   → events happening in the next 7 days (default)
// A cheap metadata scan picks the ids; one query loads full rows (with images).

function parseSettings(v: unknown): { mode?: string } {
  if (v && typeof v === "object") return v as { mode?: string };
  if (typeof v === "string") { try { return JSON.parse(v); } catch { return {}; } }
  return {};
}
function parseEventDate(s: string): Date | null {
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export async function GET() {
  await ensureSchema();
  const pool = getPool();

  const [settingRows] = await pool.query<any[]>("SELECT data FROM settings WHERE name = 'popup'");
  const mode = parseSettings(settingRows[0]?.data).mode === "manual" ? "manual" : "auto";

  const [meta] = await pool.query<any[]>("SELECT id, popup, date FROM events ORDER BY id");

  let picked: number[];
  if (mode === "manual") {
    picked = meta.filter((r) => !!r.popup).map((r) => r.id);
  } else {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);
    picked = meta
      .filter((r) => { const d = parseEventDate(r.date); return !!d && d >= now && d < weekEnd; })
      .sort((a, b) => parseEventDate(a.date)!.getTime() - parseEventDate(b.date)!.getTime())
      .map((r) => r.id);
  }

  let events: ReturnType<typeof mapEventRow>[] = [];
  if (picked.length) {
    const [full] = await pool.query<any[]>(`SELECT ${await cols("events")} FROM events WHERE id IN (?)`, [picked]);
    const byId = new Map<number, any>(full.map((r) => [r.id, r]));
    events = picked.map((id) => mapEventRow(byId.get(id))).filter(Boolean);
  }

  return NextResponse.json(events, {
    headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=300" },
  });
}

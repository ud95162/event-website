import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../lib/db";
import { ensureSchema } from "../../lib/schema";

// Record a metric (increment). Body: { entityType, entityId, metric }
export async function POST(req: NextRequest) {
  await ensureSchema();
  const pool = getPool();
  const { entityType, entityId, metric } = await req.json();
  if (!entityType || !entityId || !metric) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  await pool.query(
    `INSERT INTO analytics (entity_type, entity_id, metric, count)
       VALUES (?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE count = count + 1`,
    [entityType, entityId, metric]
  );
  return NextResponse.json({ ok: true });
}

// Return aggregated analytics joined with event / organizer names.
export async function GET() {
  await ensureSchema();
  const pool = getPool();

  const [rows] = await pool.query<any[]>("SELECT entity_type, entity_id, metric, count FROM analytics");

  const [events]     = await pool.query<any[]>("SELECT id, title FROM events");
  const [organizers] = await pool.query<any[]>("SELECT id, name FROM organizers");
  const eventName = new Map(events.map(e => [e.id, e.title]));
  const orgName   = new Map(organizers.map(o => [o.id, o.name]));

  // Aggregate into { entityType, entityId, name, views, clicks }
  const byEntity = new Map<string, { entityType: string; entityId: number; name: string; views: number; clicks: number }>();
  let totalViews = 0, totalClicks = 0;
  for (const r of rows) {
    const key = `${r.entity_type}:${r.entity_id}`;
    const name = r.entity_type === "event" ? (eventName.get(r.entity_id) ?? `Event #${r.entity_id}`)
                                            : (orgName.get(r.entity_id) ?? `Organizer #${r.entity_id}`);
    const rec = byEntity.get(key) ?? { entityType: r.entity_type, entityId: r.entity_id, name, views: 0, clicks: 0 };
    if (r.metric === "view")       { rec.views  += r.count; totalViews  += r.count; }
    if (r.metric === "link_click") { rec.clicks += r.count; totalClicks += r.count; }
    byEntity.set(key, rec);
  }

  const list = [...byEntity.values()];
  return NextResponse.json({
    totals: { views: totalViews, clicks: totalClicks },
    events: list.filter(e => e.entityType === "event").sort((a, b) => b.views - a.views),
    organizers: list.filter(e => e.entityType === "organizer").sort((a, b) => b.views - a.views),
  });
}

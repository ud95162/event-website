import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getPool } from "../../../../../lib/db";
import { ensureSchema } from "../../../../../lib/schema";
import { IMG_COLUMNS } from "../../../../../lib/images";

// Serves a DB-stored picture as a real image: decoded from its base64 data URI, capped in
// size and re-encoded as WebP, with a far-future cache header (the ?v= in the URL changes
// whenever the picture does). ?w=<px> asks for a smaller version, e.g. for card thumbnails.

export const runtime = "nodejs";

const DEFAULT_MAX_W = 1600;
const MIN_W = 64;
const MAX_W = 2400;

// Small in-memory LRU of processed images so repeat requests skip the DB read + resize.
const CACHE_LIMIT = 48 * 1024 * 1024;
const cache = new Map<string, { buf: Buffer; type: string }>();
let cacheBytes = 0;
function cacheGet(key: string) {
  const hit = cache.get(key);
  if (hit) { cache.delete(key); cache.set(key, hit); }
  return hit;
}
function cacheSet(key: string, val: { buf: Buffer; type: string }) {
  if (val.buf.length > CACHE_LIMIT / 4) return;
  cache.set(key, val);
  cacheBytes += val.buf.length;
  for (const [k, v] of cache) {
    if (cacheBytes <= CACHE_LIMIT) break;
    cache.delete(k); cacheBytes -= v.buf.length;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ table: string; id: string; field: string }> }
) {
  const { table, id, field } = await params;
  const col = IMG_COLUMNS[table]?.[field];
  if (!col || !/^\d+$/.test(id)) return new NextResponse("Not found", { status: 404 });

  const sp = req.nextUrl.searchParams;
  const v = sp.get("v") ?? "";
  const wParam = parseInt(sp.get("w") ?? "", 10);
  const width = Math.min(Math.max(Number.isFinite(wParam) ? wParam : DEFAULT_MAX_W, MIN_W), MAX_W);

  const etag = `"${table}-${id}-${field}-${v}-${width}"`;
  const headers: Record<string, string> = {
    "Cache-Control": "public, max-age=31536000, immutable",
    ETag: etag,
  };
  if (req.headers.get("if-none-match") === etag) return new NextResponse(null, { status: 304, headers });

  const key = etag;
  const hit = cacheGet(key);
  if (hit) return new NextResponse(new Uint8Array(hit.buf), { headers: { ...headers, "Content-Type": hit.type } });

  await ensureSchema();
  // table & col come from the allow-list above, so interpolating them is safe.
  const [rows] = await getPool().query<any[]>(`SELECT ${col} AS img FROM ${table} WHERE id = ?`, [id]);
  const value: string | undefined = rows[0]?.img;
  if (!value) return new NextResponse("Not found", { status: 404 });

  // Not a data URI (an ordinary link) — just send the client there.
  if (!value.startsWith("data:")) return NextResponse.redirect(new URL(value, req.url), 302);

  const comma = value.indexOf(",");
  const header = comma > 5 ? value.slice(5, comma) : "";           // "image/png;base64"
  if (!header) return new NextResponse("Bad image", { status: 415 });
  const mime = header.split(";")[0] || "application/octet-stream";
  const body = value.slice(comma + 1);
  const raw = header.includes(";base64") ? Buffer.from(body, "base64") : Buffer.from(decodeURIComponent(body));

  let buf: Buffer = raw;
  let type = mime;
  // GIFs/SVGs are served as-is (resizing would flatten animation / rasterise vectors).
  if (!/^image\/(gif|svg)/.test(mime)) {
    try {
      buf = await sharp(raw, { failOn: "none" })
        .rotate()                                              // honour EXIF orientation
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      type = "image/webp";
    } catch {
      buf = raw; type = mime;                                  // unreadable by sharp — serve original
    }
  }

  cacheSet(key, { buf, type });
  return new NextResponse(new Uint8Array(buf), { headers: { ...headers, "Content-Type": type } });
}

import { getPool } from "./db";
import { IMG_MARK } from "./images";

// SQL fragments that keep base64 pictures out of query results. A stored data URI is replaced
// by a short marker (length + two CRC32s of its ends) that imgUrl() turns into an /api/img/ URL;
// ordinary links are selected as-is.
export const imgMarker = (col: string, alias: string = col) =>
  `CASE WHEN LEFT(${col}, 5) = 'data:' THEN CONCAT('${IMG_MARK}', LENGTH(${col}), '-', CRC32(LEFT(${col}, 4000)), '-', CRC32(RIGHT(${col}, 4000))) ELSE ${col} END AS ${alias}`;

// Tables that are selected with SELECT * today -> their picture columns.
const PICTURE_COLS: Record<string, string[]> = {
  events: ["image"],
  artists: ["image", "banner_image"],
};

const columnCache = new Map<string, string>();

/** Column list for `table` with its picture columns swapped for markers (replaces SELECT *). */
export async function cols(table: keyof typeof PICTURE_COLS): Promise<string> {
  const hit = columnCache.get(table);
  if (hit) return hit;
  const [rows] = await getPool().query<any[]>(
    "SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION",
    [table]
  );
  const pics = new Set(PICTURE_COLS[table]);
  const list = rows.map((r) => (pics.has(r.name) ? imgMarker(r.name) : r.name)).join(", ");
  columnCache.set(table, list);
  return list;
}

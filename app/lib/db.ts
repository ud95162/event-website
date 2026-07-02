import mysql from "mysql2/promise";

// Reuse the pool across hot reloads in development to avoid exhausting
// connections. Stored on globalThis as a singleton.
const globalForDb = globalThis as unknown as {
  __mysqlPool?: mysql.Pool;
};

export function getPool(): mysql.Pool {
  if (!globalForDb.__mysqlPool) {
    globalForDb.__mysqlPool = mysql.createPool({
      host: process.env.MYSQL_HOST || "localhost",
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER || "ud",
      password: process.env.MYSQL_PASSWORD || "8494",
      database: process.env.MYSQL_DATABASE || "events_lk",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: "utf8mb4",
    });
  }
  return globalForDb.__mysqlPool;
}

export default getPool;

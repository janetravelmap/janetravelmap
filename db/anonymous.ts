export async function ensureAnonymousVisitorsTable() {
  const d1 = globalThis.__SITES_DB__;
  if (!d1) throw new Error("D1 database is unavailable");
  await d1.exec(`
    CREATE TABLE IF NOT EXISTS anonymous_visitors (
      visitor_id TEXT PRIMARY KEY NOT NULL,
      first_seen_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      started_at TEXT,
      converted_at TEXT
    );
    CREATE INDEX IF NOT EXISTS anonymous_visitors_last_seen_idx ON anonymous_visitors (last_seen_at);
    CREATE INDEX IF NOT EXISTS anonymous_visitors_started_idx ON anonymous_visitors (started_at);
    CREATE INDEX IF NOT EXISTS anonymous_visitors_converted_idx ON anonymous_visitors (converted_at);
  `);
}

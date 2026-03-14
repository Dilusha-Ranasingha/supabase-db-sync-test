import pg from 'pg';

const { Pool } = pg;

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }
  return databaseUrl;
}

function parseDatabaseUrl(databaseUrl) {
  try {
    return new URL(databaseUrl);
  } catch (err) {
    const message = err?.message ?? String(err);
    throw new Error(
      `DATABASE_URL is invalid. Expected a Postgres connection string like ` +
        `'postgres://user:pass@host:5432/db'. Details: ${message}`
    );
  }
}

export const pool = new Pool({
  connectionString: getDatabaseUrl(),
  // Supabase remote connections typically require SSL.
  // Local Postgres often does not support SSL by default.
  ssl: (() => {
    const databaseUrl = getDatabaseUrl();
    const url = parseDatabaseUrl(databaseUrl);
    const isLocalHost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

    if (process.env.PGSSLMODE === 'disable' || isLocalHost) return false;
    return { rejectUnauthorized: false };
  })()
});

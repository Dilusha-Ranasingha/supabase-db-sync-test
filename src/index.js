import 'dotenv/config';
import { createServer } from 'node:http';
import { app } from './app.js';
import { pool } from './db/pool.js';

const port = Number.parseInt(process.env.PORT ?? '3000', 10);

const server = createServer(app);

async function logDatabaseConnectionStatus() {
  try {
    await pool.query('SELECT 1');
    // eslint-disable-next-line no-console
    console.log('Database connected');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Database connection failed:', err?.message ?? err);
  }
}

void logDatabaseConnectionStatus();

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});

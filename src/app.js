import express from 'express';
import cors from 'cors';
import { usersRouter } from './routes/users.js';

export const app = express();

const DEFAULT_CORS_ORIGINS = [
  'https://supabase-db-sync-test-fe.vercel.app',
  'http://localhost:5173',
];

function getCorsOrigins() {
  const configured = process.env.CORS_ORIGINS?.trim();
  if (!configured) return DEFAULT_CORS_ORIGINS;

  return configured
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const corsOrigins = getCorsOrigins();

const corsOptions = {
  origin: corsOrigins.includes('*')
    ? '*'
    : (origin, callback) => {
        if (!origin || corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`origin_not_allowed:${origin}`));
      },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use('/users', usersRouter);

// Basic error handler
app.use((err, _req, res, _next) => {
  if (typeof err?.message === 'string' && err.message.startsWith('origin_not_allowed:')) {
    return res.status(403).json({ error: 'cors_origin_not_allowed' });
  }

  console.error(err);
  res.status(500).json({ error: 'internal_server_error' });
});

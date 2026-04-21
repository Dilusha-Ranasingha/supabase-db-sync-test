import express from 'express';
import cors from 'cors';
import { usersRouter } from './routes/users.js';

export const app = express();

// ✅ ADD THIS (CORS FIX)
app.use(cors({
  origin: '*', // allow all (safe for testing)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use('/users', usersRouter);

// Basic error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_server_error' });
});

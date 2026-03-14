import { Router } from 'express';
import { pool } from '../db/pool.js';

export const usersRouter = Router();

function parseId(value) {
  const id = Number.parseInt(value, 10);
  if (!Number.isFinite(id) || id <= 0) return null;
  return id;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidEmail(value) {
  // Simple sanity check (not RFC perfect)
  if (!isNonEmptyString(value)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

usersRouter.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, created_at FROM users ORDER BY id ASC'
    );
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
});

usersRouter.get('/:id', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'invalid_id' });

    const { rows } = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'not_found' });
    return res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

usersRouter.post('/', async (req, res, next) => {
  try {
    const { name, email } = req.body ?? {};

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'invalid_email' });
    }

    const nameValue = isNonEmptyString(name) ? name.trim() : null;
    const emailValue = email.trim().toLowerCase();

    const { rows } = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email, created_at',
      [nameValue, emailValue]
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    // Unique constraint error (duplicate email)
    if (err?.code === '23505') {
      return res.status(409).json({ error: 'email_already_exists' });
    }
    next(err);
  }
});

usersRouter.put('/:id', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'invalid_id' });

    const { name, email } = req.body ?? {};

    const updates = [];
    const values = [];

    if (name !== undefined) {
      if (name !== null && !isNonEmptyString(name)) {
        return res.status(400).json({ error: 'invalid_name' });
      }
      values.push(name === null ? null : name.trim());
      updates.push(`name = $${values.length}`);
    }

    if (email !== undefined) {
      if (email !== null && !isValidEmail(email)) {
        return res.status(400).json({ error: 'invalid_email' });
      }
      values.push(email === null ? null : email.trim().toLowerCase());
      updates.push(`email = $${values.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'no_fields_to_update' });
    }

    values.push(id);

    const { rows } = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING id, name, email, created_at`,
      values
    );

    if (rows.length === 0) return res.status(404).json({ error: 'not_found' });
    return res.status(200).json(rows[0]);
  } catch (err) {
    if (err?.code === '23505') {
      return res.status(409).json({ error: 'email_already_exists' });
    }
    next(err);
  }
});

usersRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'invalid_id' });

    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'not_found' });

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

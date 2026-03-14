# Node.js API (Users CRUD)

This repo contains SQL migrations under `db/migrations/` and a minimal Node.js REST API that connects to the same Postgres database (including Supabase Postgres).

## Prerequisites

- Node.js 18+ (recommended 20+)
- A Postgres database URL (for Supabase, use the **Transaction pooler** or direct connection string)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your `.env` from the example:

```bash
cp .env.example .env
```

3. Put your Postgres connection string into `DATABASE_URL`.

## Run

```bash
npm run dev
```

API will start on `http://localhost:3000` (or `PORT`).

## Endpoints

- `GET /health`
- `GET /users`
- `GET /users/:id`
- `POST /users` body: `{ "name": "Alice", "email": "alice@example.com" }`
- `PUT /users/:id` body: `{ "name": "New Name" }` and/or `{ "email": "new@example.com" }`
- `DELETE /users/:id`

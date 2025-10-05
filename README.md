## ts-server

A small TypeScript-backed Express server used as the backend for a simple "chirpy" app. The project provides authentication, user and chirp APIs, admin endpoints (metrics / reset), DB migrations powered by Drizzle, and JWT-based auth.

### Why you should care

- Minimal, practical example of a TypeScript + Express + Postgres backend.
- Shows JWT auth, password hashing (argon2), database queries with Drizzle ORM, and a small test suite (Vitest).
- Useful as a lightweight starter for learning full-stack TypeScript backend patterns or for experimenting with authentication and DB migrations.

### Requirements

- Node.js (install a recent LTS, Node 18+ is recommended)
- PostgreSQL (or any database reachable via a connection string assigned to `DB_URL`)

### Install

Clone the repo and install dependencies:

```bash
npm install
```

### Environment

This project reads configuration from environment variables. At minimum you should provide:

- `PORT` — the port the server listens on (e.g. `3000`)
- `PLATFORM` — a string identifying the runtime platform
- `POLKA_KEY` — an application key used by the app
- `DB_URL` — Postgres connection string (used by Drizzle / `postgres` driver)
- `SECRET` — secret used to sign JWTs

Create a `.env` file at the project root for local development. Example:

```env
PORT=3000
PLATFORM=local
POLKA_KEY=dev-key-123
DB_URL=postgres://user:pass@localhost:5432/chirpy_db
SECRET=some-long-random-secret
```

### Build and run

Compile TypeScript and run the built server:

```bash
npm run build
npm run start
```

For a simple development flow (compiles then runs):

```bash
npm run dev
```

Run tests:

```bash
npm run test
```

### Database migrations (Drizzle)

Generate migration types/config (if needed):

```bash
npm run generate
```

Run migrations:

```bash
npm run migrate
```

### Project structure (high level)

- `src/` — TypeScript source
  - `api/` — REST endpoints (auth, chirps, users, readiness)
  - `admin/` — admin endpoints (metrics, reset)
  - `db/` — Drizzle schema, migrations and query helpers
  - `app/` — simple frontend assets served by the server

### Notes

- The server expects certain environment variables (see `src/config.ts`). If any required env var is missing the server will throw on startup.
- The project uses Drizzle ORM and expects migrations under `src/db/migrations` (present in repository).

If you want, I can add a simple Makefile or npm task to create a local Postgres with Docker and an improved dev script — tell me which you prefer.

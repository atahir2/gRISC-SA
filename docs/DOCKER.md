# Docker Compose (PostgreSQL + Next.js + Adminer)

The SAQ / GRISSA web app runs on **PostgreSQL** with **NextAuth** and **Drizzle** migrations. Compose brings up:

| Service       | Purpose                                      |
|--------------|-----------------------------------------------|
| `postgres`   | PostgreSQL 16, persistent volume              |
| `app`        | Production Next.js (standalone) on port 3000  |
| `adminer`    | DB UI on port 8080 (optional to use)         |
| `db-migrate` | One-shot migration runner (Compose **profile**) |

Static questionnaire content stays **file-based**; the engine does **not** persist derived scores in the database.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2
- This repository cloned locally

## 1. Environment file

```bash
cp .env.docker.example .env.docker
```

Edit `.env.docker`:

- Set **`POSTGRES_PASSWORD`** and **`NEXTAUTH_SECRET`** to strong values (not `change_me`).
- Keep **`DATABASE_URL`** using host name **`postgres`** (the Compose service name), e.g.  
  `postgresql://saq_user:YOUR_PASSWORD@postgres:5432/saq_db`
- **`NEXTAUTH_URL`** must match how users open the app (default `http://localhost:3000`).
- **`NEXT_PUBLIC_BASE_PATH`** should stay **empty** for root deployment in Docker (see `next.config.js` for subpath production builds).

Do **not** commit `.env.docker`.

## 2. Start the stack

```bash
docker compose --env-file .env.docker up --build -d
```

Or:

```bash
npm run docker:up
```

This starts **postgres**, **app**, and **adminer**. The first app start expects the DB schema to exist — run migrations next (or before first browse).

## 3. Run database migrations

**Option A — in Docker (recommended, uses isolated `node_modules` volume):**

```bash
docker compose --profile migrate --env-file .env.docker run --rm db-migrate
```

Or:

```bash
npm run docker:migrate
```

**Option B — from the host** (Postgres port `5432` exposed to localhost):

```bash
# Windows PowerShell
$env:DATABASE_URL="postgresql://saq_user:YOUR_PASSWORD@127.0.0.1:5432/saq_db"
npm run db:migrate

# bash
export DATABASE_URL="postgresql://saq_user:YOUR_PASSWORD@127.0.0.1:5432/saq_db"
npm run db:migrate
```

ORM helpers (unchanged):

- `npm run db:generate` — generate SQL from `drizzle/schema.ts`
- `npm run db:migrate` — apply migrations in `drizzle/migrations/`
- `npm run db:studio` — Drizzle Studio (requires `DATABASE_URL` pointing at a reachable DB)

## 4. Open the services

- **App:** [http://localhost:3000](http://localhost:3000) (redirects to `/saq`)
- **Adminer:** [http://localhost:8080](http://localhost:8080)  
  - System: **PostgreSQL**  
  - Server: **`postgres`** (from inside Docker) — if you use host port mapping from the host OS, use **127.0.0.1** and port **5432** instead  
  - Username / password / database: match `.env.docker` (`saq_user`, etc.)

## 5. Stop containers

```bash
docker compose --env-file .env.docker down
```

Or: `npm run docker:down`

### Data loss warning

```bash
docker compose --env-file .env.docker down -v
```

The **`-v`** flag removes named volumes, including **`saq_postgres_data`**, which **deletes the database**. Only use this when you intend to wipe data.

## 6. Verify the app

1. Migrations completed without errors.
2. `docker compose --env-file .env.docker ps` — `saq-postgres` **healthy**, `saq-app` **running**.
3. Open `http://localhost:3000` — you should reach the GRISSA intro; sign up / sign in (NextAuth + Postgres).
4. Create an assessment from Workspace and confirm data appears in Adminer under `saq_db`.

## 7. Optional port overrides

In `.env.docker` you can set:

- `POSTGRES_HOST_PORT` (default `5432`) — host binding for Postgres
- `APP_HOST_PORT` (default `3000`)
- `ADMINER_HOST_PORT` (default `8080`)

## Build notes

- The **Dockerfile** does not copy `.env*` files; runtime configuration is injected by Compose **`env_file`**.
- **`NEXT_PUBLIC_BASE_PATH`** is a **build** argument (`docker-compose.yml` passes it from `.env.docker` when you build). Rebuild after changing it: `docker compose --env-file .env.docker build --no-cache app`.

# Docker Compose (PostgreSQL + Next.js + Adminer)

The SAQ / GRISSA web app runs on **PostgreSQL** with **NextAuth** and **Drizzle** migrations. Compose brings up:

| Service    | Purpose                                                                 |
|-----------|-------------------------------------------------------------------------|
| `postgres` | PostgreSQL 16, persistent volume                                       |
| `app`      | Production Next.js (**standalone** image — **no** Drizzle CLI)         |
| `adminer`  | DB UI (optional)                                                      |
| `migrate`  | **One-shot** migration runner (`drizzle-kit` via `npm ci`; **profile** `migrate`) |

Static questionnaire content stays **file-based**; the engine does **not** persist derived scores in the database.

## Do not run migrations inside the `app` container

The **production Dockerfile** installs only what `next build` needs for the standalone server. **`drizzle-kit` is a devDependency** and is **not** copied into the final `app` image. Running `npm run db:migrate` (or `drizzle-kit`) **inside `saq-app` will fail** or would require bloating the image with dev tooling.

**Use the dedicated `migrate` service** (or run `npm run db:migrate` on the host with a correct `DATABASE_URL`). The migrate container runs `npm ci` (including devDependencies), then `drizzle-kit migrate`, on the Compose network with hostname **`postgres`**.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2
- This repository cloned locally

## 1. Environment file

**Local / default:** copy `.env.docker.example` → `.env.docker` and edit secrets.

**Production-style file:** copy `.env.production.example` → `.env.production`. That example sets:

```env
COMPOSE_ENV_FILE_PATH=.env.production
```

so Compose mounts the same file into `postgres`, `app`, `adminer`, and `migrate`. If you omit `COMPOSE_ENV_FILE_PATH`, the default is **`.env.docker`**.

Edit the env file you use:

- Set **`POSTGRES_PASSWORD`** and **`NEXTAUTH_SECRET`** to strong values.
- **`DATABASE_URL`** must use host **`postgres`** (the Compose service name) when used from containers, e.g.  
  `postgresql://USER:PASSWORD@postgres:5432/DATABASE` — **not** `localhost`.
- **`NEXTAUTH_URL`** must match how users reach the app.
- **`NEXT_PUBLIC_BASE_PATH`** — empty for root deployment in Docker (see `next.config.js` for subpath builds).

Do **not** commit real env files.

## 2. Recommended startup order (first deploy or after schema changes)

Use the env file you maintain (`.env.docker` or `.env.production`). Examples below use **`.env.production`**; swap for `.env.docker` for local stacks.

```bash
docker compose --env-file .env.production up -d postgres
docker compose --profile migrate --env-file .env.production run --rm migrate
docker compose --env-file .env.production up -d --build app
```

You can start **adminer** anytime after Postgres is healthy:

```bash
docker compose --env-file .env.production up -d adminer
```

**Equivalent one-liner** after Postgres is already up (typical local dev):

```bash
docker compose --env-file .env.docker up --build -d
```

Then run migrations once (migrate is **not** started by plain `up` — it uses **profile** `migrate`):

```bash
docker compose --profile migrate --env-file .env.docker run --rm migrate
```

Or: `npm run docker:migrate` (uses `.env.docker` — adjust the script or invoke `docker compose` with your `--env-file` if needed).

## 3. Run database migrations (reference)

**Inside Docker (recommended):**

```bash
docker compose --profile migrate --env-file .env.docker run --rm migrate
```

**From the host** (Postgres port exposed to localhost, URL uses `127.0.0.1`):

```bash
# Windows PowerShell
$env:DATABASE_URL="postgresql://USER:PASSWORD@127.0.0.1:5432/DB"
npm run db:migrate

# bash
export DATABASE_URL="postgresql://USER:PASSWORD@127.0.0.1:5432/DB"
npm run db:migrate
```

npm scripts:

- `npm run db:generate` — generate SQL from `drizzle/schema.ts` (`drizzle-kit generate`)
- `npm run db:migrate` — apply migrations in `drizzle/migrations/` (`drizzle-kit migrate`)
- `npm run db:studio` — Drizzle Studio (requires a reachable `DATABASE_URL`)

## 4. Open the services

- **App:** [http://localhost:3000](http://localhost:3000) (or your `APP_HOST_PORT`)
- **Adminer:** [http://localhost:8080](http://localhost:8080)  
  - From **Adminer in Docker**, server host **`postgres`**. From the **host OS**, use **127.0.0.1** and mapped Postgres port.

## 5. Stop containers

```bash
docker compose --env-file .env.docker down
```

Or: `npm run docker:down`

### Data loss warning

```bash
docker compose --env-file .env.docker down -v
```

**`-v`** removes named volumes, including **`saq_postgres_data`**, which **deletes the database**.

## 6. Verify the app

1. Migrations completed without errors.
2. `docker compose --env-file .env.docker ps` — Postgres **healthy**, `saq-app` **running**.
3. Open the app URL — GRISSA intro; sign up / sign in (NextAuth + Postgres).
4. Create an assessment from Workspace and confirm data in Adminer.

## 7. Optional port overrides

In your env file:

- `POSTGRES_HOST_PORT` (default `5432`)
- `APP_HOST_PORT` (default `3000`)
- `ADMINER_HOST_PORT` (default `8080`)

## Build notes

- The **Dockerfile** does not bake `.env*` files; Compose **`env_file`** injects runtime config.
- **`NEXT_PUBLIC_BASE_PATH`** is a **build** argument from the env file used at build time. Rebuild after changing it: `docker compose ... build --no-cache app`.

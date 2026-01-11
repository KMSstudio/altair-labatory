
# Labatory Monorepo

Monorepo for the Altair Labatory project.
It contains a Next.js web app plus shared auth and database packages.
Postgres runs locally via Docker Compose.

## Prerequisites
- Node.js 20+ and npm
- Docker Desktop (with Compose)
- Git

## Install
```bash
npm install
```

## Environment
- Copy or edit `.env` in the repo root to match your local Postgres settings. The default values in the sample `.env` work with the provided Docker setup.
- `DATABASE_URL` must match the container port (`4821` by default).

## Start the stack
1) Start Postgres
```bash
npm run db:up
```
2) Generate Prisma client and apply migrations
```bash
npm run prisma:generate
npm run prisma:migrate:dev
```
3) Seed initial data (optional if you only need an empty DB)
```bash
npm run prisma:seed
```
4) Run the web app
```bash
npm run web:dev
# open http://localhost:3000
```

## Database utilities
### Stop database
- Stop containers: `npm run db:down`

### Reset database
- Drops the Postgres volume and removes all local data.
- Run `npm run db:reset`, then re-apply migrations with `npm run prisma:migrate:dev`.
- If you need sample data again, rerun `npm run prisma:seed`.

### Open Prisma Studio
- Make sure the DB is running (`npm run db:up`) and the client is generated.
- Run `npm run prisma:studio` and open http://localhost:5555.

## Workspace layout
- `apps/web` — Next.js 16 front-end
- `packages/db` — Prisma schema, migrations, seed
- `packages/auth` — Auth utilities (depends on db)

## Common issues
- **DB not ready**: wait for the health check (Compose retries), or rerun `npm run db:up`.
- **Prisma errors**: confirm `DATABASE_URL` matches `.env` and the container port `4821`.

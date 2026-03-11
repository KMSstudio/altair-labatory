
# Labatory Monorepo

> Last Revised: 01.12.2026  
> Date Created: 01.22.2026  
> Latest Reviser: MyeongSeok Kang  
> Revisers: KMSStudio, Jihoon Kim, Jiho Ryu

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

## .env 파일

.env file must be located at root and written in given form.


| Key Name             | Description                                                      |
|----------------------|------------------------------------------------------------------|
| `NODE_ENV`                     | Application execution mode.  |
| `GOOGLE_CLIENT_ID`             | The OAuth client ID issued by Google. |
| `GOOGLE_CLIENT_SECRET`         | The OAuth client secret associated with the Google client ID. |
| `NEXTAUTH_SECRET`              | A secret key used by NextAuth to sign and encrypt sensitive authentication data. |
| `NEXTAUTH_URL`                 | The canonical base URL of the application. |
| `EMAIL_ID`                     | The email account ID (email address) used as the sender. |
| `EMAIL_PASSWORD`               | The password or app-specific password for the email account. |
| `EMAIL_NAME`                   | The display name shown as the sender in the recipient’s inbox. |
| `EMAIL_DOMAIN`                 | The domain associated with the sender’s email address. |
| `EXPIRE_DURATION`              | The number of minutes before a verification email token expires. |
| `IGNORE_EMAIL_VERIFY`          | When set to '1' or 'true', verification email will not be sent. This option is for development purpose only. |
| `POSTGRES_DB`                  | The name of the PostgreSQL database. |
| `POSTGRES_USER`                | The PostgreSQL user with access to the database. |
| `POSTGRES_PASSWORD`            | The password for the PostgreSQL user. |
| `DATABASE_URL`                 | The PostgreSQL connection string. |
## Start the stack
1) Start Postgres
```bash
npm run db:up
```
1) Start Node
```bash
npm run next:up
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

## Linting (Prettier + ESLint)

This repository uses **Prettier** for formatting and **ESLint** for code-quality rules.
Run linting **before opening a PR**. CI may fail if lint checks do not pass.

### Fix formatting and lint issues (auto-fix)

```bash
npm run web:lint
```

### Check only (no modifications)

```bash
npm run web:lint:check
```

## Common issues
- **DB not ready**: wait for the health check (Compose retries), or rerun `npm run db:up`.
- **Prisma errors**: confirm `DATABASE_URL` matches `.env` and the container port `4821`.

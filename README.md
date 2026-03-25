
# Labatory Monorepo

> Last Revised: 01.12.2026  
> Date Created: 03.25.2026  
> Latest Reviser: MyeongSeok Kang  
> Revisers: KMSStudio, Jihoon Kim, Jiho Ryu

Monorepo for the Altair Labatory project.
It contains a Next.js web app plus shared auth and database packages.
Postgres runs locally via Docker Compose.

## Install & Run

### Prerequisite
- Node.js 20+ and npm
- Docker Desktop
- docker compose
- Git

### Install

We use npm workspaces. To install node.js packages we using, run a cmd code below:

```bash
npm install
```

Description under is our Workspace layout

```
apps/web            Next.js 16 front-end
packages/db         Prisma schema, migrations, seed
packages/auth       Auth utilities (depends on db)
```

### Environment file
- Copy or edit `.env` in the repo root `/` to match local settings. The default values in the sample `.env` work with the provided Docker setup.
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

### Start the database

If this is your ***first time** setting up the environment, you should build out prisma client.  
This also should be done when code at `/packages/db/src` changes.

```bash
npm run prisma:build
```

### Run the database

We use docker psql image as a database and prisma as ORM package.  

```bash
npm run db:up
npm run prisma:generate
npm run prisma:migrate:dev
```

Seed data for testing locale at `/packages/db/prisma/seed.ts`.

```bash
npm run prisma:seed
```

You can use prisma studio for database management. Web-based and supports GUI.  

```bash
npm run prisma:studio
```

### Run the web application

To run our web application as **develop** setting, use `web:dev` command at root.  
You also check lint when changing codes.

```bash
npm run web:lint
npm run web:dev
# open http://localhost:300
```

When delpoy the was, build and execute the product via Next.js.  
Meanwhile, we will try to make docker image for was, so the command will change in short future.

```bash
npm run web:build
npm run web:start
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


## About Linting (Prettier + ESLint)

This repository uses **Prettier** for formatting and **ESLint** for code-quality rules.
Run linting **before opening a PR**. Or GitHub Action CI may fail.

### Fix formatting and lint issues (auto-fix)

```bash
npm run web:lint
```

### Check only (no modifications)

```bash
npm run web:lint:check
```

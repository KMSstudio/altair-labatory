# Laboratory Monorepo

> Last Revised: 01.12.2026  
> Date Created: 03.25.2026  
> Latest Reviser: MyeongSeok Kang  
> Revisers: KMSStudio, Jihoon Kim, Jiho Ryu

Monorepo for the Altair Laboratory project.
This repository contains a Next.js web application along with shared authentication and database packages.
PostgreSQL runs locally via Docker Compose.

## Install & Run

### Prerequisites

* Node.js 20+ and npm
* Docker Desktop
* Docker Compose
* Git
* Web Browser

### Install

We use npm workspaces. To install the required Node.js packages, run the following command:

```bash
npm install
```

Below is the workspace layout:

```
apps/web            Next.js 16 front-end
packages/db         Prisma schema, migrations, seed
packages/auth       Auth utilities (depends on db)
```

### Environment File

Copy or edit the `.env` file in the repository root (`/`) to match your local settings.  
The default values in the sample `.env` file work with the provided Docker setup.  
The `.env` file must be located at the root and follow the required format.

| Key Name               | Description                                                         |
| ---------------------- | ------------------------------------------------------------------- |
| `NODE_ENV`             | Application execution mode                                          |
| `GOOGLE_CLIENT_ID`     | OAuth client ID issued by Google                                    |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret associated with the client ID                   |
| `NEXTAUTH_SECRET`      | Secret key used by NextAuth to sign and encrypt authentication data |
| `NEXTAUTH_URL`         | Base URL of the application                                         |
| `EMAIL_ID`             | Sender email address                                                |
| `EMAIL_PASSWORD`       | Password or app-specific password for the email account             |
| `EMAIL_NAME`           | Display name shown in the recipient’s inbox                         |
| `EMAIL_DOMAIN`         | Domain of the sender email address                                  |
| `EXPIRE_DURATION`      | Token expiration time (minutes)                                     |
| `IGNORE_EMAIL_VERIFY`  | If '1' or 'true', email verification is skipped (development only)  |
| `POSTGRES_DB`          | PostgreSQL database name                                            |
| `POSTGRES_USER`        | PostgreSQL username                                                 |
| `POSTGRES_PASSWORD`    | PostgreSQL password                                                 |
| `DATABASE_URL`         | PostgreSQL connection string                                        |

### Run the Database

We use a Docker PostgreSQL image as the database and Prisma as the ORM.

```bash
npm run db:up
npm run prisma:generate
npm run prisma:migrate:dev
```

Seed data is located at `/packages/db/prisma/seed.ts`.

```bash
npm run prisma:seed
```

You can use Prisma Studio for database management (web-based GUI):

```bash
npm run prisma:studio
```

### Build Prisma Client (First Setup)

If this is your ***first time*** setting up the environment, build the Prisma client.
This should also be done whenever files in `/packages/db/src` are modified.

```bash
npm run prisma:build
```

### Run the Web Application

To run the application in **development mode**, use:

```bash
npm run web:lint
npm run web:dev
# open http://localhost:3000
```

To run in **production mode**:

```bash
npm run web:build
npm run web:start
```

> Note: Docker-based deployment for the web application will be added soon.

## Database Utilities

### Stop Database

* Stop containers:
  `npm run db:down`

### Reset Database

* Drops the PostgreSQL volume and removes all local data
* Run:

  ```bash
  npm run db:reset
  npm run prisma:migrate:dev
  ```
* To reseed:

  ```bash
  npm run prisma:seed
  ```

### Open Prisma Studio

* Ensure the DB is running:

  ```bash
  npm run db:up
  ```
* Then run:

  ```bash
  npm run prisma:studio
  ```
* Open: http://localhost:5555

## Linting (Prettier + ESLint)

This repository uses **Prettier** for formatting and **ESLint** for code quality.
Run linting **before opening a PR**, otherwise CI may fail.

### Auto-fix issues

```bash
npm run web:lint
```

### Check only (no modifications)

```bash
npm run web:lint:check
```

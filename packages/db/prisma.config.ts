// @db/prisma.config.ts

import { config as loadEnv } from "dotenv";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

// Inject root .env of repository.
loadEnv({ path: path.resolve(process.cwd(), "../../.env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") },
});

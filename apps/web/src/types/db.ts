// @/types/db.ts

import type { Prisma, prisma } from "@labatory/db";

export type DbClient = Prisma.TransactionClient | typeof prisma;

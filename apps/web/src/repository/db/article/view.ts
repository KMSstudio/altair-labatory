// @/repository/db/article/view.ts

"use server";

import { prisma } from "@labatory/db";

/**
 * Record a new article view log.
 */
export async function record_view({
  articleId,
  ip,
  userId,
}: {
  articleId: bigint;
  ip: string;
  userId: bigint | null;
}): Promise<void> {
  await prisma.articleViewLog.create({
    data: {
      articleId,
      ip,
      userId,
    },
  });
}

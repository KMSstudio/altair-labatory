// @/repository/db/article/view.ts

import { prisma } from "@labatory/db";

/**
 * Create a new article view log.
 */
export async function CreateArticleViewLog({
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

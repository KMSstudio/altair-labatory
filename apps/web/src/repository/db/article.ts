// @/repository/db/article.ts

"use server";

import { Prisma, prisma } from "@labatory/db";

import type { Article_Ctx, Article_Input } from "@/types/article";
import { type ArticleDbShape, ArticleDTO, getArticleSelect } from "@/repository/dto/article";
import { serializeArticle } from "../serialize/article";

/**
 * Retrieve a specific visible (non-hidden) article by id.
 *
 * This is a DB-only function. No authentication/authorization is performed here.
 *
 * @param articleId - Target article id.
 * @returns Article DB shape if found and not hidden, otherwise null.
 */
export async function GetArticleCore(articleId: bigint): Promise<ArticleDTO | null> {
  const article = (await prisma.article.findUnique({
    where: { id: articleId, isHidden: false },
    select: getArticleSelect,
  })) as ArticleDbShape;
  if (!article) return null;
  return serializeArticle(article);
}

/**
 * Update an existing article's title/content/tags, and store the previous version in `articleHistory`.
 *
 * This is a **DB-only function**. Caller must ensure:
 * - Authentication/authorization (e.g., requester is allowed to update this article)
 * - Input validation (non-empty title/content, valid tag ids, etc.)
 *
 * The update runs in a single transaction:
 * 1) Load current article state
 * 2) Insert previous state into `articleHistory`
 * 3) Update article fields (including `authorIp`)
 * 4) Replace `articleTag` relations
 *
 * @param articleId - Target article id to update.
 * @param ctx - Context information (authorId/boardId/authorIp).
 * @param input - Update payload (title/content/tagIds).
 *
 * @throws Error
 * If the target article does not exist.
 *
 * @throws Prisma.PrismaClientKnownRequestError
 * If a database constraint violation occurs.
 */
export async function UpdateArticleCore(
  articleId: bigint,
  ctx: Article_Ctx,
  input: Article_Input,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const article = await tx.article.findUnique({
      where: { id: articleId },
      select: { title: true, content: true, authorIp: true },
    });
    if (!article) throw Error("Article does not Exist.");

    await tx.articleHistory.create({
      data: {
        articleId,
        oldTitle: article.title,
        oldContent: article.content,
        oldAuthorIp: article.authorIp,
      },
    });

    await tx.article.update({
      where: { id: articleId },
      data: {
        title: input.title,
        content: input.content,
        authorIp: ctx.authorIp,
      },
    });

    await tx.articleTag.deleteMany({ where: { articleId } });

    if (input.tagIds.length) {
      const data: Prisma.ArticleTagCreateManyInput[] = input.tagIds.map((tagId) => ({
        articleId,
        tagId,
      }));
      await tx.articleTag.createMany({ data });
    }
  });
}

/**
 * Soft-delete (hide) article.
 */
export async function DeleteArticle({ articleId }: { articleId: bigint }): Promise<void> {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { authorId: true },
  });
  if (!article) throw Error("Article does not Exist.");
  await prisma.article.update({
    where: { id: articleId },
    data: { isHidden: true, deletedAt: new Date() },
  });
}

/**
 * Create a new article and its tag relations in the database.
 *
 * This function performs **only database operations** and assumes that
 * all authentication, authorization, and input validation have already
 * been completed by the caller
 *
 * The function inserts a new article row and optionally creates
 * corresponding entries in `articleTag` using a single transaction.
 *
 * @param ctx - Context information required for article creation.
 * @param input - Article data payload.
 * @returns The ID of the newly created article.
 *
 * @throws Prisma.PrismaClientKnownRequestError
 * If a database constraint violation occurs (e.g., invalid foreign key,
 * duplicate entries, etc.).
 */
export async function CreateArticleCore(ctx: Article_Ctx, boardId: bigint, input: Article_Input) {
  return prisma.$transaction(async (tx) => {
    const newArticle = await tx.article.create({
      data: {
        title: input.title,
        boardId: boardId,
        authorId: ctx.authorId,
        authorIp: ctx.authorIp,
        content: input.content,
      },
      select: { id: true },
    });

    if (input.tagIds.length) {
      const data: Prisma.ArticleTagCreateManyInput[] = input.tagIds.map((tagId) => ({
        articleId: newArticle.id,
        tagId,
      }));
      await tx.articleTag.createMany({ data });
    }

    return newArticle.id;
  });
}

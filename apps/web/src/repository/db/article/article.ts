// @/repository/db/article.ts

"use server";

import { Prisma, prisma } from "@labatory/db";

import type { Article_Ctx, Article_Input } from "@/types/article";
import { type ArticleDbShape, ArticleDTO, getArticleSelect } from "@/repository/dto/article";
import { serializeArticle } from "../../serialize/article";

type DbClient = Prisma.TransactionClient | typeof prisma;

/**
 * Retrieve a specific visible (non-hidden) article by id.
 *
 * This is a DB-only function. No authentication/authorization is performed here.
 *
 * @param articleId - Target article id.
 * @param db - Client where query will be performed. Default is prisma.
 * @returns Article DB shape if found and not hidden, otherwise null.
 */
export async function GetArticleCore({
  articleId,
  db = prisma,
}: {
  articleId: bigint;
  db?: DbClient;
}): Promise<ArticleDTO | null> {
  const article = (await db.article.findUnique({
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
 * @param ctx - Context information (authorId/authorIp).
 * @param input - Update payload (title/content/tagIds).
 *
 * @returns Article DB shape when the article is successfully updated.
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
): Promise<ArticleDTO | null> {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // We use findFirst to query non-PK fields.
    const article = await tx.article.findFirst({
      where: {
        id: articleId,
        isHidden: false,
        deletedAt: null,
      },
      select: {
        title: true,
        content: true,
        authorIp: true,
      },
    });

    if (!article) throw new Error("Article does not exist or is hidden.");

    await tx.articleHistory.create({
      data: {
        articleId,
        oldTitle: article.title,
        oldContent: article.content,
        oldAuthorIp: article.authorIp,
      },
    });
    try {
      await tx.article.update({
        where: {
          id: articleId,
          isHidden: false,
          deletedAt: null,
        },
        data: {
          title: input.title,
          content: input.content,
          authorIp: ctx.authorIp,
        },
        select: getArticleSelect,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025")
        throw new Error("Article was deleted or hidden during update.");
      else throw e;
    }

    await tx.articleTag.deleteMany({
      where: { articleId },
    });

    if (input.tagIds.length) {
      await tx.articleTag.createMany({
        data: input.tagIds.map((tagId) => ({
          articleId,
          tagId,
        })),
      });
    }
    return await GetArticleCore({ articleId, db: tx });
  });
}

/**
 * Soft-deletes an article.
 *
 * Marks the article as hidden by setting `isHidden = true` and recording
 * the deletion timestamp in `deletedAt`. This function performs DB-only
 * logic and assumes that authorization (e.g., author/admin validation)
 * has already been handled by the caller.
 *
 * To prevent race conditions during concurrent delete requests, the final
 * write operation is guarded with `isHidden: false`. If another request
 * deletes the article between the read and the write, the update will
 * affect zero rows and an error will be thrown.
 *
 * @param params - Object containing the target article id.
 * @param params.articleId - The id of the article to delete.
 *
 * @throws {Error} If the article does not exist.
 * @throws {Error} If the article has already been deleted.
 *
 * @returns Article DB shape when the article is successfully soft-deleted.
 */
export async function DeleteArticle({
  articleId,
}: {
  articleId: bigint;
}): Promise<ArticleDTO | null> {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { authorId: true, isHidden: true },
  });

  if (!article) throw new Error("Article does not exist.");
  if (article.isHidden) throw new Error("Article already deleted.");

  try {
    const result = await prisma.article.update({
      where: {
        id: articleId,
        isHidden: false,
      },
      data: {
        isHidden: true,
        deletedAt: new Date(),
      },
      select: getArticleSelect,
    });
    return serializeArticle(result);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025")
      throw new Error("Article already deleted.");
    else throw e;
  }
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
 * @returns Article DB shape of new article.
 *
 * @throws Prisma.PrismaClientKnownRequestError
 * If a database constraint violation occurs (e.g., invalid foreign key,
 * duplicate entries, etc.).
 */
export async function CreateArticleCore(
  ctx: Article_Ctx,
  boardId: bigint,
  input: Article_Input,
): Promise<ArticleDTO | null> {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

    return await GetArticleCore({ articleId: newArticle.id, db: tx });
  });
}

// @/repository/db/article.ts

"use server";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Prisma, prisma, type EmoteKind, type EmotePlace } from "@labatory/db";

import type { Article_Ctx, Article_Input } from "@/types/article";
import { type ArticleDbShape, getArticleSelect } from "@/repository/dto/article";

/**
 * Retrieve a specific visible (non-hidden) article by id.
 *
 * This is a DB-only function. No authentication/authorization is performed here.
 *
 * @param articleId - Target article id.
 * @returns Article DB shape if found and not hidden, otherwise null.
 */
export async function GetArticleCore(articleId: bigint): Promise<ArticleDbShape | null> {
  return prisma.article.findUnique({
    where: { id: articleId, isHidden: false },
    select: getArticleSelect,
  });
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw Error("Unauthorized.");

  let sessionId: bigint;
  try {
    sessionId = BigInt(session.user.id);
  } catch {
    throw Error("Invalid user id.");
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { authorId: true },
  });

  if (!article) throw Error("Article does not Exist.");
  if (sessionId !== article.authorId) throw Error("Unauthorized");

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

// export async function LinkComments(comments: GetComments_RetType | null): Promise<CommentDisplayType[]> {
//   const roots: CommentDisplayType[] = [];
//   const map = new Map<CommentDisplayType["id"], CommentDisplayType>();
//   if (!comments) return roots;

//   for (const c of comments) map.set(c.id, { ...c, children: [] });
//   for (const c of comments) {
//     const cur = map.get(c.id);
//     if (!cur) continue;

//     if (!cur.parentId) roots.push(cur);
//     else {
//       const parent = map.get(cur.parentId);
//       if (parent) parent.children.push(cur);
//       else roots.push(cur);
//     }
//   }
//   return roots;
// }

export async function PostEmote({
  id,
  targetPlace,
  emoteKind,
}: {
  id: bigint;
  targetPlace: EmotePlace;
  emoteKind: EmoteKind;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw Error("Unauthorized.");

  let sessionId: bigint;
  try {
    sessionId = BigInt(session.user.id);
  } catch {
    throw Error("Invalid user id.");
  }

  let articleId: bigint | null = null;
  let commentId: bigint | null = null;
  switch (targetPlace) {
    case "ARTICLE":
      articleId = id;
      break;
    case "COMMENT":
      commentId = id;
      break;
  }

  const duplicate = await prisma.emote.findFirst({
    where: { userId: sessionId, articleId, commentId, kind: emoteKind },
    select: { id: true },
  });

  if (duplicate) {
    await prisma.emote.delete({ where: { id: duplicate.id } });
    return false;
  }

  await prisma.emote.create({
    data: { userId: sessionId, articleId, commentId, kind: emoteKind, place: targetPlace },
  });
  return true;
}

export async function GetEmoteCount({ id, targetPlace }: { id: bigint; targetPlace: EmotePlace }) {
  let articleId: bigint | null = null;
  let commentId: bigint | null = null;
  switch (targetPlace) {
    case "ARTICLE":
      articleId = id;
      break;
    case "COMMENT":
      commentId = id;
      break;
  }

  const res = await prisma.emote.groupBy({
    by: ["kind"],
    where: { articleId, commentId },
    _count: { kind: true },
  });

  const countMap: Record<EmoteKind, number> = {
    CHEER: 0,
    EMPATHY: 0,
    LIKE: 0,
    QUESTION: 0,
    BAD: 0,
  };

  for (const cur of res) countMap[cur.kind] = cur._count.kind;
  return countMap;
}

export type GetEmoteCount_RetType = NonNullable<Awaited<ReturnType<typeof GetEmoteCount>>>;

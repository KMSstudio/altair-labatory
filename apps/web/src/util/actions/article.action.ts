// @/util/actions/article.action.ts
"use server";

import { authOptions } from "@/lib/auth";
import { getClientIp } from "@/util/util";
import { SerializeComment } from "@/util/serialize/SerializeComment";
import { Prisma, prisma, type EmoteKind, type EmotePlace } from "@labatory/db";
import { getServerSession } from "next-auth";

import type { Article_Ctx, Article_Input } from "@/types/article";
import type { ArticleDbShape } from "@/lib/dto/article";

const getArticleSelect = {
  id: true,
  boardId: true,
  title: true,
  content: true,
  viewCount: true,
  tags: {
    include: {
      tag: {
        select: {
          id: true,
          kind: true,
          labId: true,
          univId: true,
          subjId: true,
          text: true,
        },
      },
    },
  },
  author: true,
  createdAt: true,
  updatedAt: true,
  emotes: { select: { userId: true, kind: true } },
  _count: { select: { comments: true } },
} as const;

/**
 * Retrieve a specific article by id (filters hidden).
 */
export async function GetArticle({ articleId }: { articleId: bigint }): Promise<ArticleDbShape | null> {
  return prisma.article.findUnique({
    where: { id: articleId, isHidden: false },
    select: getArticleSelect,
  }) as any;
}

/**
 * Update article title/content/tags, and store previous version in articleHistory.
 */
export async function UpdateArticle({ formData }: { formData: FormData }): Promise<void> {
  const newContent = formData.get("content")?.toString() ?? "";
  const newTitle = formData.get("title")?.toString() ?? "";
  const articleIdRaw = formData.get("articleId")?.toString() ?? "";
  if (!articleIdRaw) throw Error("Article id is required");

  let articleId: bigint;
  try { articleId = BigInt(articleIdRaw); } catch { throw Error("Invalid article Id"); }

  if (!newContent) throw Error("content is required.");
  if (!newTitle) throw Error("Title is required.");

  const clientIp = await getClientIp();
  if (!clientIp) throw Error("Cannot read client id properly.");

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw Error("Unauthorized.");

  let sessionId: bigint;
  try { sessionId = BigInt(session.user.id); } catch { throw Error("Invalid user id."); }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { authorId: true, title: true, content: true, authorIp: true },
  });
  if (!article) throw Error("Article does not Exist.");
  if (sessionId !== article.authorId) throw Error("Unauthorized");

  const tagIdsRaw = formData.getAll("tagIds") as string[];
  const tagIds = tagIdsRaw.map((tagId) => {
    try { return BigInt(tagId); } catch { throw Error("Invalid Tag id."); }
  });

  try {
    await prisma.$transaction(async (tx) => {
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
        data: { title: newTitle, content: newContent, authorIp: clientIp },
      });

      await tx.articleTag.deleteMany({ where: { articleId } });

      if (tagIds.length) {
        const data: Prisma.ArticleTagCreateManyInput[] = tagIds.map((tagId) => ({ articleId, tagId }));
        await tx.articleTag.createMany({ data });
      }
    });
  } catch (e) {
    throw Error(e instanceof Error ? e.message : "Internal server error.");
  }
}

/**
 * Soft-delete (hide) article.
 */
export async function DeleteArticle({ articleId }: { articleId: bigint }): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw Error("Unauthorized.");

  let sessionId: bigint;
  try { sessionId = BigInt(session.user.id); } catch { throw Error("Invalid user id."); }

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
export async function CreateArticleCore(ctx: Article_Ctx, input: Article_Input) {
  return prisma.$transaction(async (tx) => {
    const newArticle = await tx.article.create({
      data: {
        title: input.title,
        boardId: ctx.boardId,
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


/**
 * Get comments for an article (ordered asc).
 */
export async function GetComments({ articleId }: { articleId: bigint }) {
  return prisma.comment.findMany({
    where: { articleId },
    select: {
      id: true,
      author: { select: { id: true, displayName: true } },
      articleId: true,
      isHidden: true,
      parentId: true,
      content: true,
      emotes: { select: { userId: true, kind: true } },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export type GetComments_RetType = NonNullable<Awaited<ReturnType<typeof GetComments>>>;
export type CommentDisplayType = GetComments_RetType[number] & { children: CommentDisplayType[] };

/**
 * Post comment and return serialized comment DTO (existing behavior).
 */
export async function PostComment({
  content,
  articleId,
  parentCommentId,
}: {
  content: string;
  articleId: bigint;
  parentCommentId: bigint | null;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (!content) throw new Error("Content is required.");

  const authorIp = await getClientIp();
  if (!authorIp) throw new Error("Invalid client ip.");

  const authorId = BigInt(session.user.id);

  try {
    const comment = await prisma.comment.create({
      data: { articleId, parentId: parentCommentId, content, authorIp, authorId },
      select: {
        id: true,
        author: { select: { id: true, displayName: true } },
        articleId: true,
        isHidden: true,
        parentId: true,
        content: true,
        emotes: { select: { userId: true, kind: true } },
        createdAt: true,
        updatedAt: true,
      },
    });

    return SerializeComment(comment);
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : "Internal server error.");
  }
}

export async function UpdateComment({ commentId, newContent }: { commentId: bigint; newContent: string }) {
  if (!newContent) throw Error("content is required.");

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw Error("Unauthorized.");

  let sessionId: bigint;
  try { sessionId = BigInt(session.user.id); } catch { throw Error("Invalid user id."); }

  const clientIp = await getClientIp();
  if (!clientIp) throw Error("Cannot read client id properly.");

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, content: true, authorIp: true },
  });
  if (!comment) throw Error("Comment does not Exist.");
  if (comment.content === newContent) return false;
  if (sessionId !== comment.authorId) throw Error("Unauthorized");

  try {
    await prisma.$transaction(async (tx) => {
      await tx.commentHistory.create({
        data: { commentId, oldContent: comment.content, oldAuthorIp: comment.authorIp },
      });
      await tx.comment.update({
        where: { id: commentId },
        data: { content: newContent, authorIp: clientIp },
      });
    });
    return true;
  } catch (e) {
    throw Error(e instanceof Error ? e.message : "Internal server error.");
  }
}

export async function DeleteComment({ commentId }: { commentId: bigint }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw Error("Unauthorized.");

  let sessionId: bigint;
  try { sessionId = BigInt(session.user.id); } catch { throw Error("Invalid user id."); }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  });
  if (!comment) throw Error("Comment does not Exist.");
  if (sessionId !== comment.authorId) throw Error("Unauthorized");

  await prisma.comment.update({
    where: { id: commentId },
    data: { isHidden: true, deletedAt: new Date() },
  });
}

export async function LinkComments(comments: GetComments_RetType | null): Promise<CommentDisplayType[]> {
  const roots: CommentDisplayType[] = [];
  const map = new Map<CommentDisplayType["id"], CommentDisplayType>();
  if (!comments) return roots;

  for (const c of comments) map.set(c.id, { ...c, children: [] });
  for (const c of comments) {
    const cur = map.get(c.id);
    if (!cur) continue;

    if (!cur.parentId) roots.push(cur);
    else {
      const parent = map.get(cur.parentId);
      if (parent) parent.children.push(cur);
      else roots.push(cur);
    }
  }
  return roots;
}

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
  try { sessionId = BigInt(session.user.id); } catch { throw Error("Invalid user id."); }

  let articleId: bigint | null = null;
  let commentId: bigint | null = null;
  switch (targetPlace) {
    case "ARTICLE": articleId = id; break;
    case "COMMENT": commentId = id; break;
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
    case "ARTICLE": articleId = id; break;
    case "COMMENT": commentId = id; break;
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

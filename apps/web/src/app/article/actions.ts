"use server";

import { authOptions } from "@/lib/auth";
import { getClientIp } from "@/util/tag.action";
import { SerializeComment } from "@/util/serialize/SerializeComment";
import { type EmoteKind, type EmotePlace, Prisma, prisma } from "@labatory/db";
import { getServerSession } from "next-auth";

/**
 * Retrieve a specific article based on article id.
 * filter hidden articles.
 *
 * @param {bigint} articleId Id of target article.
 *
 * @returns Article object containing:
 * - basic fields: id, boardId, title, content, viewCount
 * - tags: { tag: { id, kind, labId, univId, subjId, text } }[]
 * - author: User
 * - emotes: { userId, kind }[]
 * - _count: { comments: number }
 */
export async function GetArticle({ articleId }: { articleId: bigint }) {
  return prisma.article.findUnique({
    where: {
      id: articleId,
      isHidden: false,
    },
    select: {
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
      emotes: {
        select: {
          userId: true,
          kind: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });
}

export async function UpdateViewCount({ articleId }: { articleId: bigint }) {
  await prisma.article.update({
    where: {
      id: articleId,
    },
    data: {
      viewCount: { increment: 1 },
    },
  });
}

export type GetArticle_RetType = NonNullable<Awaited<ReturnType<typeof GetArticle>>>;

/**
 * Update article title, content, and tags.
 * preserve previous version of article in articlehistory table.
 *
 * @param formData - FormData containing:
 * - newTitle: updated article title
 * - newContent: updated article content
 * - articleId: article id.
 * - tagIds: updated repeated tag id values
 *
 * @throws if article id is invalid, or content and title is empty, or user did not logged in, user is not the writer of this article, or cannot detect client ip.
 */
export async function UpdateArticle({ formData }: { formData: FormData }) {
  const newContent = formData.get("content")?.toString() ?? "";
  const newTitle = formData.get("title")?.toString() ?? "";
  const articleIdRaw = formData.get("articleId")?.toString() ?? "";
  if (!articleIdRaw) {
    throw Error("Article id is required");
  }
  let articleId: bigint;
  try {
    articleId = BigInt(articleIdRaw);
  } catch {
    throw Error("Invalid article Id");
  }
  if (!newContent) {
    throw Error("content is required.");
  }
  if (!newTitle) {
    throw Error("Title is required.");
  }
  const clientIp = await getClientIp();
  if (!clientIp) {
    throw Error("Cannot read client id properly.");
  }
  const session = await getServerSession(authOptions);
  if (!session) {
    throw Error("Unauthorized.");
  }

  if (!session.user) {
    throw Error("Invalid session.");
  }

  let sessionId: bigint;
  try {
    sessionId = BigInt(session.user.id);
  } catch {
    throw Error("Invalid user id.");
  }

  const article = await prisma.article.findUnique({
    where: {
      id: articleId,
    },
    select: {
      authorId: true,
      title: true,
      content: true,
      authorIp: true,
    },
  });

  if (!article) {
    throw Error("Article does not Exist.");
  }

  if (sessionId !== article.authorId) {
    throw Error("Unauthorized");
  }

  const tagIdsRaw = formData.getAll("tagIds") as string[];
  const tagIds = tagIdsRaw.map((tagId) => {
    try {
      return BigInt(tagId);
    } catch {
      throw Error("Invalid Tag id.");
    }
  });
  try {
    await prisma.$transaction(async (tx) => {
      await tx.articleHistory.create({
        data: {
          articleId: articleId,
          oldTitle: article.title,
          oldContent: article.content,
          oldAuthorIp: article.authorIp,
        },
      });

      await tx.article.update({
        where: {
          id: articleId,
        },
        data: {
          title: newTitle,
          content: newContent,
          authorIp: clientIp,
        },
      });
      await tx.articleTag.deleteMany({
        where: {
          articleId,
        },
      });
      if (tagIds.length) {
        const data: Prisma.ArticleTagCreateManyInput[] = tagIds.map((tagId) => ({
          articleId,
          tagId,
        }));
        await tx.articleTag.createMany({
          data,
        });
      }
    });
  } catch (e) {
    throw Error(e instanceof Error ? e.message : "Internal server error.");
  }
}

/**
 * HIDE article from board.
 * Do not completely delete article from database;
 *
 * @param {bigint} boardId Id of board where target articles are located.
 * @param {number} page  The page number to retrieve. default is 1.
 * @param {number} pageSize  The number of articles in one page.
 *
 * @throws if article id is invalid, or user did not logged in, user is not the writer of this article, or cannot detect client ip.
 */
export async function DeleteArticle({ articleId }: { articleId: bigint }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw Error("Unauthorized.");
  }

  if (!session.user) {
    throw Error("Invalid session.");
  }

  let sessionId: bigint;
  try {
    sessionId = BigInt(session.user.id);
  } catch {
    throw Error("Invalid user id.");
  }

  const article = await prisma.article.findUnique({
    where: {
      id: articleId,
    },
    select: {
      authorId: true,
    },
  });

  if (!article) {
    throw Error("Article does not Exist.");
  }
  if (sessionId !== article.authorId) {
    throw Error("Unauthorized");
  }

  await prisma.article.update({
    where: {
      id: articleId,
    },
    data: {
      isHidden: true,
      deletedAt: new Date(),
    },
  });
}

/**
 * Retrieve pages of comment post on specific article.
 * Include replies.
 *
 * @param {bigint} articleId Id of article where comments are posted.
 *
 * @returns Comment list containing:
 * - id
 * - author: { id, displayName }
 * - articleId
 * - isHidden
 * - parentId
 * - content
 * - emotes: { userId, kind }[]
 * - createdAt, updatedAt
 *
 * Ordered by createdAt ascending
 */
export async function GetComments({ articleId }: { articleId: bigint }) {
  return prisma.comment.findMany({
    where: {
      articleId: articleId,
    },
    select: {
      id: true,
      author: {
        select: {
          id: true,
          displayName: true,
        },
      },
      articleId: true,
      isHidden: true,
      parentId: true,
      content: true,
      emotes: {
        select: {
          userId: true,
          kind: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}
/**
 * post specific comment
 *
 * @param {bigint} articleId Id of article where comments are being posted.
 * @param {string} content Content of comment.
 * @param {bigint | null} parentCommentId Id of comment where this comment will be attached. null if this comment is not reply.
 *
 * @returns Serialized Comment data.
 * @throws If user is not logged in or cannot detect client ip, or failed to post comment on database.
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

  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  if (!session.user.id) {
    throw new Error("Invalid session.");
  }

  if (!content) {
    throw new Error("Content is required.");
  }

  const authorIp = await getClientIp();
  if (!authorIp) {
    throw new Error("Invalid client ip.");
  }

  const authorId = BigInt(session.user.id);

  try {
    const comment = await prisma.comment.create({
      data: {
        articleId,
        parentId: parentCommentId,
        content,
        authorIp,
        authorId,
      },
      select: {
        id: true,
        author: {
          select: {
            id: true,
            displayName: true,
          },
        },
        articleId: true,
        isHidden: true,
        parentId: true,
        content: true,
        emotes: {
          select: {
            userId: true,
            kind: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return SerializeComment(comment);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error.";
    throw new Error(message);
  }
}

export async function UpdateComment({
  commentId,
  newContent,
}: {
  commentId: bigint;
  newContent: string;
}) {
  if (!newContent) {
    throw Error("content is required.");
  }
  const session = await getServerSession(authOptions);
  if (!session) {
    throw Error("Unauthorized.");
  }

  if (!session.user) {
    throw Error("Invalid session.");
  }
  let sessionId: bigint;
  try {
    sessionId = BigInt(session.user.id);
  } catch {
    throw Error("Invalid user id.");
  }
  const clientIp = await getClientIp();
  if (!clientIp) {
    throw Error("Cannot read client id properly.");
  }
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    select: {
      authorId: true,
      content: true,
      authorIp: true,
    },
  });
  if (!comment) {
    throw Error("Comment does not Exist.");
  }
  if (comment.content === newContent) {
    return false;
  }
  if (sessionId !== comment.authorId) {
    throw Error("Unauthorized");
  }
  try {
    await prisma.$transaction(async (tx) => {
      await tx.commentHistory.create({
        data: {
          commentId,
          oldContent: comment.content,
          oldAuthorIp: comment.authorIp,
        },
      });
      await tx.comment.update({
        where: {
          id: commentId,
        },
        data: {
          content: newContent,
          authorIp: clientIp,
        },
      });
    });
    return true;
  } catch (e) {
    throw Error(e instanceof Error ? e.message : "Internal server error.");
  }
}

export async function DeleteComment({ commentId }: { commentId: bigint }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw Error("Unauthorized.");
  }

  if (!session.user) {
    throw Error("Invalid session.");
  }
  let sessionId: bigint;
  try {
    sessionId = BigInt(session.user.id);
  } catch {
    throw Error("Invalid user id.");
  }
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    select: {
      authorId: true,
    },
  });
  if (!comment) {
    throw Error("Comment does not Exist.");
  }
  if (sessionId !== comment.authorId) {
    throw Error("Unauthorized");
  }
  await prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      isHidden: true,
      deletedAt: new Date(),
    },
  });
}

export async function LinkComments(
  comments: GetComments_RetType | null,
): Promise<CommentDisplayType[]> {
  const roots: CommentDisplayType[] = [];
  const map = new Map<CommentDisplayType["id"], CommentDisplayType>();
  if (!comments) return roots;

  for (const comment of comments) {
    map.set(comment.id, { ...comment, children: [] });
  }
  for (const c of comments) {
    const comment = map.get(c.id);
    if (!comment) continue;

    if (!comment.parentId) {
      roots.push(comment);
    } else {
      const parent = map.get(comment.parentId);
      if (parent) parent.children.push(comment);
      else {
        roots.push(comment);
      }
    }
  }
  return roots;
}

export type GetComments_RetType = NonNullable<Awaited<ReturnType<typeof GetComments>>>;
export type CommentDisplayType = GetComments_RetType[number] & { children: CommentDisplayType[] };

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
  if (!session) {
    throw Error("Unauthorized.");
  }

  if (!session.user) {
    throw Error("Invalid session.");
  }
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
  const duplicateCheck = await prisma.emote.findFirst({
    where: {
      userId: sessionId,
      articleId,
      commentId,
      kind: emoteKind,
    },
    select: {
      id: true,
    },
  });
  if (duplicateCheck) {
    await prisma.emote.delete({
      where: {
        id: duplicateCheck.id,
      },
    });
    return false;
  } else {
    await prisma.emote.create({
      data: {
        userId: sessionId,
        articleId,
        commentId,
        kind: emoteKind,
        place: targetPlace,
      },
    });
    return true;
  }
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
    where: {
      articleId,
      commentId,
    },
    _count: {
      kind: true,
    },
  });
  const countMap: Record<EmoteKind, number> = {
    CHEER: 0,
    EMPATHY: 0,
    LIKE: 0,
    QUESTION: 0,
    BAD: 0,
  };

  for (const cur of res) {
    countMap[cur.kind] = cur._count.kind;
  }
  return countMap;
}

export type GetEmoteCount_RetType = NonNullable<Awaited<ReturnType<typeof GetEmoteCount>>>;

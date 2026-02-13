"use server";

import { authOptions } from "@/lib/auth";
import { getClientIp } from "@/util/tag.action";
import { SerializeComment } from "@/util/serialize/SerializeComment";
import { type EmoteKind, type EmotePlace, Prisma, prisma } from "@labatory/db";
import { getServerSession } from "next-auth";
import { SerializeTagResult } from "@/util/serialize/SerializeTag";

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

export type GetArticleResult = NonNullable<Awaited<ReturnType<typeof GetArticle>>>;
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
    throw Error("Invaild article Id");
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
    throw Error("Invaild session.");
  }

  let sessionId: bigint;
  try {
    sessionId = BigInt(session.user.id);
  } catch {
    throw Error("Invaild user id.");
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

  const serializedTags = formData.get("tags")?.toString() ?? "";
  const tags = JSON.parse(serializedTags) as SerializeTagResult[];

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
      await prisma.articleTag.deleteMany({
        where: {
          articleId,
        },
      });
      console.log(tags);
      if (tags.length) {
        const data: Prisma.ArticleTagCreateManyInput[] = tags.map((tag) => ({
          articleId,
          tagId: BigInt(tag.id),
        }));
        await tx.articleTag.createMany({
          data,
        });
      }
    });

    return true;
  } catch (e) {
    return Error(e instanceof Error ? e.message : "Internal server error.");
  }
}

export async function DeleteArticle({ articleId }: { articleId: bigint }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw Error("Unauthorized.");
  }

  if (!session.user) {
    throw Error("Invaild session.");
  }

  let sessionId: bigint;
  try {
    sessionId = BigInt(session.user.id);
  } catch {
    throw Error("Invaild user id.");
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
    throw Error("Invaild session.");
  }
  let sessionId: bigint;
  try {
    sessionId = BigInt(session.user.id);
  } catch {
    throw Error("Invaild user id.");
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
    throw Error("Invaild session.");
  }
  let sessionId: bigint;
  try {
    sessionId = BigInt(session.user.id);
  } catch {
    throw Error("Invaild user id.");
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

export async function LinkComments(comments: GetCommentsResult | null): Promise<CommentDisplay[]> {
  const roots: CommentDisplay[] = [];
  const map = new Map<CommentDisplay["id"], CommentDisplay>();
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

export type GetCommentsResult = NonNullable<Awaited<ReturnType<typeof GetComments>>>;
export type CommentDisplay = GetCommentsResult[number] & { children: CommentDisplay[] };

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
    throw Error("Invaild session.");
  }
  let sessionId: bigint;
  try {
    sessionId = BigInt(session.user.id);
  } catch {
    throw Error("Invaild user id.");
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

export type GetEmoteCountResult = NonNullable<Awaited<ReturnType<typeof GetEmoteCount>>>;
export type ClientEmoteKind = EmoteKind;

// @/app/board/action.tsx

"use server";

import { authOptions } from "@/lib/auth";
import { getClientIp } from "@/util/tag.action";
import { Prisma, prisma } from "@labatory/db";
import { getServerSession } from "next-auth";

export async function GetBoard(id: bigint) {
  return prisma.board.findUnique({
    where: { id },
    select: {
      id: true,
      nameKo: true,
      nameEn: true,
      description: true,
      isActive: true,
      _count: {
        select: {
          articles: true,
        },
      },
    },
  });
}

/**
 * Retrieve a paginated list of articles for a specific board.
 * Articles are returned in descending order by creation time.
 * filter hidden, pinned articles.
 *
 * @param {bigint} boardId Id of board where target articles are located.
 * @param {number} page  The page number to retrieve. default is 1.
 * @param {number} pageSize  The number of articles in one page.
 *
 * @return list of article.
 * @throws if page or pageSize if less than 1.
 */
export async function GetArticles(boardId: bigint, page: number = 1, pageSize: number) {
  if (page < 1) {
    throw new Error("page must be greater than 1.");
  }

  const skip = (page - 1) * pageSize;

  return prisma.article.findMany({
    where: {
      boardId,
      isHidden: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: pageSize,
    select: {
      id: true,
      title: true,
      viewCount: true,
      tags: true,
      createdAt: true,
      _count: {
        select: {
          comments: true,
          emotes: true,
        },
      },
    },
  });
}

export type GetArticles_RetType = NonNullable<Awaited<ReturnType<typeof GetArticles>>>;

/**
 * Retrieve a id and title of pinned articles for a specific board.
 * Articles are returned in descending order by creation time.
 * filter hidden articles.
 *
 * @param {bigint} boardId Id of board where target articles are located.
 *
 * @return list of article.
 * @throws if page or pageSize if less than 1.
 */
export async function GetPinnedArticles(boardId: bigint) {
  return prisma.article.findMany({
    where: {
      boardId,
      isHidden: false,
      isPinned: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
    },
  });
}

export type GetPinnedArticles_RetType = NonNullable<Awaited<ReturnType<typeof GetPinnedArticles>>>;

export async function CreateArticle(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw Error("User must be logged in.");
  }
  if (!session.user.id) {
    throw Error("Invalid Session.");
  }
  let authorId: bigint;
  try {
    authorId = BigInt(session.user.id);
  } catch {
    throw Error("Invaild user id.");
  }

  const clientIp = await getClientIp();
  if (!clientIp) {
    throw Error("Cannot read client id properly.");
  }
  const rawBoardId = formData.get("boardId")?.toString().trim() ?? "";
  let boardId: bigint;
  try {
    boardId = BigInt(rawBoardId);
  } catch {
    throw Error("Invaild board id.");
  }

  const title = formData.get("title")?.toString() ?? "";
  const content = formData.get("content")?.toString() ?? "";
  if (!title || !content) {
    throw Error("Title and content are required");
  }
  const tagIdsRaw = formData.getAll("tagIds") as string[];
  const tagIds = tagIdsRaw.map((tagId) => {
    try {
      return BigInt(tagId);
    } catch {
      throw Error("Invaild Tag id.");
    }
  });
  try {
    return prisma.$transaction(async (tx) => {
      const newArticle = await tx.article.create({
        data: {
          title,
          boardId,
          authorId,
          authorIp: clientIp,
          content,
        },
        select: {
          id: true,
        },
      });

      if (tagIds.length) {
        const data: Prisma.ArticleTagCreateManyInput[] = tagIds.map((tagId) => ({
          articleId: newArticle.id,
          tagId,
        }));
        await tx.articleTag.createMany({
          data,
        });
      }
      return newArticle.id;
    });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
      throw Error("Internal server error.");
    }
    if (e.code === "P2003") {
      throw Error("Invalid tag exists.");
    } else if (e.code === "P2002") {
      throw Error("Duplicate tags exist.");
    } else {
      throw Error("Internal database error.");
    }
  }
}

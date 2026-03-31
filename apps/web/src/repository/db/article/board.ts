import type { ArticleDTO, BoardDTO } from "@/repository/dto/article";
import { getBoardSelect, getArticleSelect } from "@/repository/dto/article";
import { serializeArticle, serializeBoard } from "@/repository/serialize/article";
import { prisma } from "@labatory/db";

/**
 * Get an information of board.
 * @param {bigint} boardId - Id of target board.
 * @returns BoardDTO if a board correspond to input boardId exists. null if no board was found.
 */
export async function getBoard({ boardId }: { boardId: bigint }): Promise<BoardDTO | null> {
  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
    },
    select: getBoardSelect,
  });
  if (!board) return null;
  return serializeBoard(board);
}

/**
 * Retrieve a paginated list of articles for a specific board.
 * Articles are returned in descending order by creation time.
 * filter hidden, pinned articles.
 *
 * @param {bigint} boardId - Id of board where target articles are located.
 * @param {number} start - The starting index (0-based, inclusive).
 * @param {number} finish - The ending index (exclusive). The number of items returned is (finish - start).
 *
 * @return list of articleDTO.
 * @throws if start is less than 0 or finish is less than or equal to start.
 */
export async function getBoardArticles({
  boardId,
  start,
  finish,
  tags = [],
}: {
  boardId: bigint;
  start: number;
  finish: number;
  tags?: bigint[];
}): Promise<ArticleDTO[]> {
  if (start < 0) {
    throw new Error("start index must be greater than or equal to 0.");
  }
  if (finish <= start) {
    throw new Error("finish index must be greater than start index.");
  }

  const whereTags = tags.length > 0 ?
    tags.map(id => ({
        tags: {
          some: { 
            tagId: id 
          }
        }
      }))
    : [];

  const articles = await prisma.article.findMany({
    where: {
      boardId,
      isHidden: false,
      isPinned: false,
      AND: tags.length > 0 ?
        tags.map(id => ({
            tags: {
              some: { 
                tagId: id 
              }
            }
        })) : [],
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: start,
    take: finish - start,
    select: getArticleSelect,
  });
  // console.log(articles)
  return articles.map(serializeArticle);
}

/**
 * Retrieve a id and title of pinned articles for a specific board.
 * Articles are returned in descending order by creation time.
 * filter hidden articles.
 *
 * @param {bigint} boardId - Id of board where target articles are located.
 *
 * @return list of articleDTO.
 */
export async function getPinnedArticles({ 
  boardId,
  tags = [],
}: { 
  boardId: bigint,
  tags?: bigint[], 
}): Promise<ArticleDTO[]> {
  const pinnedArticles = await prisma.article.findMany({
    where: {
      boardId,
      isHidden: false,
      isPinned: true,
      AND: tags.length > 0 ?
        tags.map(id => ({
            tags: {
              some: { 
                tagId: id 
              }
            }
        })) : [],
    },
    orderBy: {
      createdAt: "desc",
    },
    select: getArticleSelect,
  });
  return pinnedArticles.map(serializeArticle);
}

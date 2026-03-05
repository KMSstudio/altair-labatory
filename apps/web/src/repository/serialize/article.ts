// @/util/serialize/article.ts

import type { ArticleDTO, ArticleDbShape } from "@/repository/dto/article";
import type { ArticleTagDbShape, ArticleTagDTO } from "@/repository/dto/article";

export function serializeArticleTag(articleTag: ArticleTagDbShape): ArticleTagDTO {
  return {
    id: articleTag.id.toString(),
    kind: articleTag.kind,
    labId: articleTag.labId?.toString(),
    subjId: articleTag.subjId?.toString(),
    univId: articleTag.univId?.toString(),
    text: articleTag.text,
  };
}

export function serializeArticle(article: ArticleDbShape): ArticleDTO {
  return {
    id: article.id.toString(),
    boardId: article.boardId.toString(),
    title: article.title,
    content: article.content,
    viewCount: article.viewCount,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),

    tags: article.tags.map((t) => serializeArticleTag(t)),
    author: { ...article.author, id: article.author.id.toString() },

    emotes: article.emotes.map((e) => ({
      userId: e.userId.toString(),
      kind: e.kind,
    })),

    commentCount: article._count.comments,
  };
}

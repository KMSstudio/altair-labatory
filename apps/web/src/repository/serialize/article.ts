// @/util/serialize/article.ts

import type { ArticleTagDbShape, ArticleTagDTO } from "@/repository/dto/article";
import type { PostEmoteDbShape, PostEmoteDTO } from "@/repository/dto/article";
import type { PostAuthorDbShape, PostAuthorDTO } from "@/repository/dto/article";
import type { CommentDbShape, CommentDTO } from "@/repository/dto/article";
import type { ArticleDTO, ArticleDbShape } from "@/repository/dto/article";

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

export function serializeEmote(emote: PostEmoteDbShape): PostEmoteDTO {
  return { userId: emote.userId.toString(), kind: emote.kind };
}

export function serializePostAuthor(author: PostAuthorDbShape | null): PostAuthorDTO | null {
  if (author == null) return null;
  return {
    ...author,
    id: author.id.toString(),
  };
}

export function serializeComment(comment: CommentDbShape): CommentDTO {
  return {
    id: comment.id.toString(),
    author: serializePostAuthor(comment.author),

    articleId: comment.articleId.toString(),
    isHidden: comment.isHidden,
    parentId: comment.parentId ? comment.parentId.toString() : null,

    content: comment.content,
    emotes: comment.emotes.map((e) => serializeEmote(e)),

    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
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
    author: serializePostAuthor(article.author),
    emotes: article.emotes.map((e) => ({
      userId: e.userId.toString(),
      kind: e.kind,
    })),
    comments: article.comments.map(serializeComment),

    commentCount: article._count.comments,
  };
}

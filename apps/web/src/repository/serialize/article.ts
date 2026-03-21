// @/util/serialize/article.ts

import type { TagDbShape, TagDTO } from "@/repository/dto/article";
import type { PostEmoteDbShape, PostEmoteDTO } from "@/repository/dto/article";
import type { PostAuthorDbShape, PostAuthorDTO } from "@/repository/dto/article";
import type { CommentDbShape, CommentDTO } from "@/repository/dto/article";
import type { ArticleDTO, ArticleDbShape } from "@/repository/dto/article";
import type { BoardAclDTO, BoardAclDbShape } from "@/repository/dto/article";
import type { BoardDTO, BoardDbShape } from "@/repository/dto/article";

export function serializeTag(tag: TagDbShape): TagDTO {
  return {
    id: tag.id.toString(),
    kind: tag.kind,
    labId: tag.labId?.toString(),
    subjId: tag.subjId?.toString(),
    univId: tag.univId?.toString(),
    text: tag.text,
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

    content: comment.isHidden ? "This comment is hidden." : comment.content,
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

    tags: article.tags.map((t) => serializeTag(t.tag)),
    author: serializePostAuthor(article.author),
    emotes: article.emotes.map((e) => ({
      userId: e.userId.toString(),
      kind: e.kind,
    })),
    comments: article.comments.map(serializeComment),

    commentCount: article._count.comments,
  };
}

export function serializeBoardAcl(boardAcl: BoardAclDbShape): BoardAclDTO {
  return {
    id: boardAcl.id.toString(),
    boardId: boardAcl.boardId.toString(),
    action: boardAcl.action,
    role: boardAcl.role,
  };
}

export function serializeBoard(board: BoardDbShape): BoardDTO {
  return {
    id: board.id.toString(),
    nameKo: board.nameKo,
    nameEn: board.nameEn,
    description: board.description?.toString(),
    isActive: board.isActive,
    aclRules: board.aclRules.map(serializeBoardAcl),
    _count: {
      articles: board._count.articles,
    },
  };
}

// @/lib/dto/article.ts

import type { EmoteKind, TagKind } from "@labatory/db";

// TAG
export type ArticleTagDbShape = {
  id: bigint;
  kind: TagKind;
  labId: bigint | null;
  subjId: bigint | null;
  univId: bigint | null;
  text: string | null;
};

export type ArticleTagDTO = {
  id: string;
  kind: TagKind;
  labId?: string;
  subjId?: string;
  univId?: string;
  text: string | null;
};

// EMOTE
export type PostEmoteDbShape = { userId: bigint; kind: EmoteKind };
export type PostEmoteDTO = { userId: string; kind: EmoteKind };

// AUTHOR
export type PostAuthorDbShape = { id: bigint; displayName: string } & Record<string, any>;
export type PostAuthorDTO = { id: string; displayName: string } & Record<string, any>;

// COMMENT
export type CommentDbShape = {
  id: bigint;
  author: PostAuthorDbShape | null;
  articleId: bigint;
  isHidden: boolean;
  parentId: bigint | null;
  content: string;
  emotes: { userId: bigint; kind: EmoteKind }[];
  createdAt: Date;
  updatedAt: Date;
};

export const getCommentSelect = {
  id: true,
  author: { select: { id: true, displayName: true } },
  articleId: true,
  isHidden: true,
  parentId: true,
  content: true,
  emotes: { select: { userId: true, kind: true } },
  createdAt: true,
  updatedAt: true,
} as const;

export type CommentDTO = {
  id: string;
  author: PostAuthorDTO | null;
  articleId: string;
  isHidden: boolean;
  parentId: string | null;
  content: string;
  emotes: { userId: string; kind: EmoteKind }[];
  createdAt: string;
  updatedAt: string;
};

// ARTICLE
export type ArticleDbShape = {
  id: bigint;
  boardId: bigint;
  title: string;
  content: string;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;

  tags: ArticleTagDbShape[];
  author: PostAuthorDbShape | null;
  emotes: PostEmoteDbShape[];
  comments: CommentDbShape[];

  _count: { comments: number };
};

export const getArticleSelect = {
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
  author: { select: { id: true, displayName: true } },
  createdAt: true,
  updatedAt: true,
  emotes: { select: { userId: true, kind: true } },
  comments: {
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" as const },
    select: getCommentSelect,
  },
  _count: { select: { comments: true } },
} as const;

export type ArticleDTO = {
  id: string;
  boardId: string;
  title: string;
  content: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;

  tags: ArticleTagDTO[];
  author: PostAuthorDTO | null;
  emotes: PostEmoteDTO[];
  comments: CommentDTO[];

  commentCount: number;
};

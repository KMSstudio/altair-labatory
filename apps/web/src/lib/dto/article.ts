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
export type ArticleEmoteDbShape = { userId: bigint; kind: EmoteKind };
export type ArticleEmoteDTO = { userId: string; kind: EmoteKind };

// AUTHOR=
export type ArticleAuthorDbShape = { id: bigint; displayName: string } & Record<string, any>;
export type ArticleAuthorDTO = { id: string; displayName: string } & Record<string, any>;

// ARTICLE (detail)
export type ArticleDbShape = {
  id: bigint;
  boardId: bigint;
  title: string;
  content: string;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;

  tags: ArticleTagDbShape[];
  author: ArticleAuthorDbShape;
  emotes: ArticleEmoteDbShape[];

  _count: { comments: number };
};

export type ArticleDTO = {
  id: string;
  boardId: string;
  title: string;
  content: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;

  tags: ArticleTagDTO[];
  author: ArticleAuthorDTO;
  emotes: ArticleEmoteDTO[];

  commentCount: number;
};

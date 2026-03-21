// @/repository/dto/article.ts

import type { EmoteKind, TagKind } from "@labatory/db";
import type { UserRole } from "@labatory/db";

// TAG
export type TagDbShape = {
  id: bigint;
  kind: TagKind;
  labId: bigint | null;
  subjId: bigint | null;
  univId: bigint | null;
  text: string | null;
};

export const getTagSelect = {
  id: true,
  kind: true,
  labId: true,
  univId: true,
  subjId: true,
  text: true,
} as const;

export type TagDTO = {
  id: string;
  kind: TagKind;
  labId?: string;
  subjId?: string;
  univId?: string;
  text: string | null;
};

// EMOTE
export type PostEmoteDbShape = { userId: bigint; kind: EmoteKind };
export const getPostEmoteSelect = { userId: true, kind: true } as const;
export type PostEmoteDTO = { userId: string; kind: EmoteKind };

export type EmoteCountRecord = Record<EmoteKind, number>;
export type EmoteDisplayState = {
  counts: EmoteCountRecord;
  activeKinds: EmoteKind[];
};

// AUTHOR
export type PostAuthorDbShape = { id: bigint; displayName: string };
export const getPostAuthorSelect = { id: true, displayName: true } as const;
export type PostAuthorDTO = { id: string; displayName: string };

// COMMENT
export type CommentDbShape = {
  id: bigint;
  author: PostAuthorDbShape | null;
  articleId: bigint;
  isHidden: boolean;
  parentId: bigint | null;
  content: string;
  emotes: PostEmoteDbShape[];
  createdAt: Date;
  updatedAt: Date;
};

export const getCommentSelect = {
  id: true,
  author: { select: getPostAuthorSelect },
  articleId: true,
  isHidden: true,
  parentId: true,
  content: true,
  emotes: { select: getPostEmoteSelect },
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
  emotes: PostEmoteDTO[];
  createdAt: string;
  updatedAt: string;
};

export type CommentDisplayTree = CommentDTO & {
  children: CommentDisplayTree[];
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

  tags: { tag: TagDbShape }[];
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
    select: {
      tag: { select: getTagSelect },
    },
  },
  author: { select: getPostAuthorSelect },
  createdAt: true,
  updatedAt: true,
  emotes: { select: getPostEmoteSelect },
  comments: {
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

  tags: TagDTO[];
  author: PostAuthorDTO | null;
  emotes: PostEmoteDTO[];
  comments: CommentDTO[];

  commentCount: number;
};

// BOARD ACL
export type BoardAclDbShape = {
  id: bigint;
  boardId: bigint;
  action: string;
  role: UserRole | null;
};

export const getBoardAclSelect = {
  id: true,
  boardId: true,
  action: true,
  role: true,
} as const;

export type BoardAclDTO = {
  id: string;
  boardId: string;
  action: string;
  role: UserRole | null;
};

// BOARD
export type BoardDbShape = {
  id: bigint;
  nameKo: string;
  nameEn: string;
  description: string | null;
  isActive: boolean;
  aclRules: BoardAclDbShape[];
  _count: {
    articles: number;
  };
};

export const getBoardSelect = {
  id: true,
  nameKo: true,
  nameEn: true,
  description: true,
  isActive: true,
  aclRules: { select: getBoardAclSelect },
  _count: {
    select: {
      articles: true,
    },
  },
} as const;

export type BoardDTO = {
  id: string;
  nameKo: string;
  nameEn: string;
  description?: string;
  isActive: boolean;
  aclRules: BoardAclDTO[];
  _count: {
    articles: number;
  };
};

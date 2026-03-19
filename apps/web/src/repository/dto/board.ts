// @/repository/dto/board.ts

import type { UserRole } from "@labatory/db";
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

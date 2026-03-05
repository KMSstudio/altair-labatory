// @/src/lib/dto/article-tag.ts

import type { TagKind } from "@labatory/db";

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

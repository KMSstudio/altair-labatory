// @/src/types/article.ts

export type Article_Ctx = {
  authorId: bigint;
  authorIp: string;
};

export type Article_Input = {
  title: string;
  content: string;
  tagIds: bigint[];
};

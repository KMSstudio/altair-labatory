// @/src/types/article.ts

export type Article_Ctx = {
  authorId: bigint;
  boardId: bigint;
  authorIp: string;
};

export type Article_Input = {
  title: string;
  content: string;
  tagIds: bigint[];
};

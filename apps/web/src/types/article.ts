// @/types/article.ts

export type Emote_Ctx = {
  userId: bigint;
  postId: bigint;
  postKind: string;
};

export type Comment_Ctx = {
  authorId: bigint;
  authorIp: string;
};

export type Comment_PostInput = {
  articleId: bigint;
  parentId: bigint | null;
  content: string;
};

export type Comment_UpdateInput = {
  content: string;
};

export type Article_Ctx = {
  authorId: bigint;
  authorIp: string;
};

export type Article_Input = {
  title: string;
  content: string;
  tagIds: bigint[];
};

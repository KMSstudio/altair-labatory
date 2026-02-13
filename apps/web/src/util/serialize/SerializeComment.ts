import { GetCommentsResult } from "@/app/article/actions";

export function SerializeComment(comment: GetCommentsResult[number]) {
  const emotes = comment.emotes.map((emote) => {
    return {
      userId: emote.userId.toString(),
      kind: emote.kind,
    };
  });
  return {
    id: comment.id.toString(),
    content: comment.content,
    emotes,
    articleId: comment.articleId.toString(),
    parentId: comment.parentId ? comment.parentId.toString() : null,
    isHidden: comment.isHidden,
    createdAt: comment.createdAt.toISOString(),
    author: {
      id: comment.author?.id.toString() ?? "",
      displayName: comment.author?.displayName ?? "",
    },
  };
}

export type SerializedComment = ReturnType<typeof SerializeComment>;

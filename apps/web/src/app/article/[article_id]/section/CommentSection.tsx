// @/app/article/[article_id]/section/CommentSection.tsx

import type { CommentDisplayTree } from "@/repository/dto/article";
import { BuildEmoteDisplayState } from "../article.transform";

import { CommentUpdateSection } from "./CommentUpdateSection";
import { EmoteSection } from "./EmoteSection";
import { ReplySection } from "./ReplySection";

function CommentComponent({
  comment,
  depth,
  viewerId,
}: {
  comment: CommentDisplayTree;
  depth: number;
  viewerId: string | null;
}) {
  let commentId: bigint;
  let articleId: bigint;
  let createdAt: Date;
  let updatedAt: Date;

  try {
    commentId = BigInt(comment.id);
    articleId = BigInt(comment.articleId);
    createdAt = new Date(comment.createdAt);
    updatedAt = new Date(comment.updatedAt);

    if (Number.isNaN(createdAt.getTime()) || Number.isNaN(updatedAt.getTime())) {
      throw new Error("Invalid date");
    }
  } catch {
    return (
      <div>
        <div>Error while parsing: cannot change String into Bigint or Date</div>
      </div>
    );
  }

  const isOwner = viewerId !== null && comment.author?.id === viewerId;
  const isEdited = createdAt.getTime() !== updatedAt.getTime();
  const emoteState = BuildEmoteDisplayState(comment.emotes, viewerId);

  return (
    <div>
      <div>
        <h3>{comment.author?.displayName ?? "anonymous"}</h3>
      </div>

      {isOwner && !comment.isHidden && (
        <CommentUpdateSection commentId={commentId} content={comment.content} />
      )}

      <div>
        {createdAt.toDateString()}
        {isEdited ? (
          <span>
            {" · Edited "}
            <time dateTime={updatedAt.toISOString()}>{updatedAt.toLocaleString()}</time>
          </span>
        ) : null}
      </div>

      {comment.isHidden ? (
        <div>This Comment is hidden.</div>
      ) : (
        <div>
          <div>{comment.content}</div>
          <EmoteSection postId={commentId} postKind="COMMENT" emoteState={emoteState} />
        </div>
      )}

      <ReplySection parentId={commentId} articleId={articleId} />

      {comment.children.length > 0 && (
        <div>
          {comment.children.map((child) => (
            <CommentComponent
              key={child.id}
              comment={child}
              depth={depth + 1}
              viewerId={viewerId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({
  comments,
  depth,
  viewerId,
}: {
  comments: CommentDisplayTree[];
  depth: number;
  viewerId: string | null;
}) {
  return (
    <div>
      {comments.map((comment) => (
        <CommentComponent key={comment.id} comment={comment} depth={depth} viewerId={viewerId} />
      ))}
    </div>
  );
}

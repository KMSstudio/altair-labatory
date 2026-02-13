import { GetEmoteCount, type CommentDisplay } from "../../actions";
import { CommentUpdateSection } from "./CommentUpdateSection";
import { EmoteSection } from "./EmoteSection";
import { ReplySection } from "./ReplySection";

export async function CommentSection({
  comments,
  depth,
  viewerId,
}: {
  comments: CommentDisplay[];
  depth: number;
  viewerId: bigint | null;
}) {
  return (
    <div>
      {comments.map(async (comment) => {
        const emoteCount = await GetEmoteCount({ id: comment.id, targetPlace: "COMMENT" });
        return (
          <div key={comment.id}>
            <div>
              <h3>{comment.author?.displayName ?? "anonymous"}</h3>
            </div>
            {viewerId === comment.author?.id && !comment.isHidden ? (
              <CommentUpdateSection commentId={comment.id} content={comment.content} />
            ) : (
              <></>
            )}
            <div>
              {comment.createdAt.toDateString()}
              {comment.createdAt.getDate() !== comment.updatedAt.getDate() && (
                <>
                  <span> · 수정 </span>
                  <time dateTime={comment.updatedAt.toISOString()}>
                    {comment.updatedAt.toLocaleString()}
                  </time>
                </>
              )}
            </div>
            {comment.isHidden ? (
              <div>댓글이 가려졌습니다</div>
            ) : (
              <>
                <div>{comment.content}</div>
                <EmoteSection id={comment.id} emotes={emoteCount} kind="COMMENT" />
              </>
            )}
            <ReplySection parentId={comment.id} articleId={comment.articleId} />
            {comment.children.length !== 0 ? (
              <CommentSection comments={comment.children} depth={depth + 1} viewerId={viewerId} />
            ) : (
              <></>
            )}
          </div>
        );
      })}
    </div>
  );
}

import { notFound } from "next/navigation";
import { GetArticle, GetComments, LinkComments, GetEmoteCount } from "../actions";
import Link from "next/link";
import { CommentSection } from "./section/CommentSection";
import { EmoteSection } from "./section/EmoteSection";
import { CommentForm } from "./section/CommentForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { WriterSection } from "./section/WriterSection";

export default async function Page({ params }: { params: { article_id: string } }) {
  params = await params;
  if (!params.article_id) notFound();
  let articleId: bigint;
  try {
    articleId = BigInt(params.article_id);
  } catch {
    notFound();
  }
  const article = await GetArticle({ articleId });
  if (!article) {
    notFound();
  }
  const emoteCount = await GetEmoteCount({ id: articleId, targetPlace: "ARTICLE" });
  const commentsRaw = await GetComments({ articleId });
  const comments = await LinkComments(commentsRaw);
  const session = await getServerSession(authOptions);
  let sessionId: bigint | null = null;
  if (session && session.user) {
    try {
      sessionId = BigInt(session.user.id);
    } catch {
      sessionId = null;
    }
  }
  return (
    <article>
      <header>
        <div>
          <Link href={`/board/${article.boardId}/list`}>게시판으로 이동.</Link>
        </div>
        <h1>{article.title}</h1>
        <div>
          <p>{article.author?.displayName ?? "anonymous"}</p>
        </div>
        <div>
          <time dateTime={article.createdAt.toISOString()}>
            {article.createdAt.toLocaleString()}
          </time>
          {article.updatedAt.getTime() !== article.createdAt.getTime() && (
            <>
              <span> · 수정 </span>
              <time dateTime={article.updatedAt.toISOString()}>
                {article.updatedAt.toLocaleString()}
              </time>
            </>
          )}
        </div>
        {sessionId === article.author?.id ? <WriterSection articleId={articleId} /> : <></>}
      </header>
      <section>
        <dl>
          <div>
            <dt>조회</dt>
            <dd>{article.viewCount}</dd>
          </div>
          <div>
            <dt>댓글</dt>
            <dd>{article._count.comments ?? 0}</dd>
          </div>
        </dl>
      </section>
      <section>
        <div>{article.content}</div>
      </section>
      <section>
        <h2>반응</h2>
        <EmoteSection id={articleId} emotes={emoteCount} kind="ARTICLE" />
      </section>
      <section>
        <h2>태그</h2>
        {article.tags ? (
          <ol>
            {article.tags.map((articleTag) => (
              <p key={articleTag.tagId}>{articleTag.tag.text ?? articleTag.tag.id}</p>
            ))}
          </ol>
        ) : (
          <></>
        )}
      </section>
      <section>
        <h2>댓글 {article._count.comments ?? 0}</h2>

        {(article._count.comments ?? 0) === 0 ? (
          <p>아직 댓글이 없습니다.</p>
        ) : (
          <CommentSection comments={comments} depth={0} viewerId={sessionId} />
        )}
        <CommentForm articleId={articleId} />
      </section>
    </article>
  );
}

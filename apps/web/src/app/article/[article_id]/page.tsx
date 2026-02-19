"use server";

import { notFound } from "next/navigation";
import { GetArticle, GetComments, LinkComments, GetEmoteCount } from "../actions";
import Link from "next/link";
import { CommentSection } from "./section/CommentSection";
import { EmoteSection } from "./section/EmoteSection";
import { CommentForm } from "./section/CommentForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { WriterSection } from "./section/WriterSection";

export default async function Page({
  params,
  searchParams,
}: {
  params: { article_id: string };
  searchParams?: { error: string };
}) {
  params = await params;
  searchParams = await searchParams;
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
      {/*Display Name, author, created date, and updated Date.
       If user is the writer of this article, also display edit and delete button.*/}
      <header>
        <div>
          <Link href={`/board/${article.boardId}/list`}>Return to board.</Link>
        </div>
        {searchParams?.error && <p>{decodeURIComponent(searchParams.error)}</p>}
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
              <span> · Edited </span>
              <time dateTime={article.updatedAt.toISOString()}>
                {article.updatedAt.toLocaleString()}
              </time>
            </>
          )}
          {sessionId === article.author?.id && (
            <WriterSection articleId={articleId} boardId={article.boardId} />
          )}
        </div>
      </header>
      {/*Display viewcount, the number of comments and emote of this article.*/}
      <section>
        <dl>
          <div>
            <dt>view</dt>
            <dd>{article.viewCount}</dd>
          </div>
          <div>
            <dt>comments</dt>
            <dd>{article._count.comments ?? 0}</dd>
          </div>
        </dl>
      </section>
      <section>
        <div>{article.content}</div>
      </section>
      {/*Display the number of emotes left in this article in detail.*/}
      <section>
        <h2>Emote</h2>
        <EmoteSection id={articleId} emotes={emoteCount} kind="ARTICLE" />
      </section>
      {/*Display tags of this article.*/}
      <section>
        <h2>Tags</h2>
        {article.tags && (
          <ol>
            {article.tags.map((articleTag) => (
              <p key={articleTag.tagId}>{articleTag.tag.text ?? articleTag.tag.id}</p>
            ))}
          </ol>
        )}
      </section>
      {/*Display comments of this article.*/}
      <section>
        <h2>Coment {article._count.comments ?? 0}</h2>

        {(article._count.comments ?? 0) !== 0 ? (
          <CommentSection comments={comments} depth={0} viewerId={sessionId} />
        ) : (
          <p>No comment.</p>
        )}
        <CommentForm articleId={articleId} />
      </section>
    </article>
  );
}

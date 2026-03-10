// @/app/article/[article_id]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { GetArticleCore } from "@/repository/db/article/article";

import { BuildCommentDisplayTree, BuildEmoteDisplayState } from "./article.transform";
import { CommentSection } from "./section/CommentSection";
import { EmoteSection } from "./section/EmoteSection";
import { CommentForm } from "./section/CommentForm";
import { WriterSection } from "./section/WriterSection";

function ParseArticleId(articleIdRaw: string): bigint {
  try {
    return BigInt(articleIdRaw);
  } catch {
    notFound();
  }
}

function ParseSessionUserId(userIdRaw?: string | null): string | null {
  if (!userIdRaw) return null;
  try {
    return BigInt(userIdRaw).toString();
  } catch {
    return null;
  }
}

export default async function Page({ params }: { params: { article_id: string } }) {
  const articleId = ParseArticleId(await params.article_id);

  const [article, session] = await Promise.all([
    GetArticleCore(articleId),
    getServerSession(authOptions),
  ]);

  if (!article) notFound();

  const sessionId = ParseSessionUserId(session?.user?.id);
  const commentDisplayTree = BuildCommentDisplayTree(article.comments);
  const emoteDisplayState = BuildEmoteDisplayState(article.emotes, sessionId);

  return (
    <article>
      <header>
        <div>
          <Link href={`/board/${article.boardId}/list`}>Return to board.</Link>
        </div>

        <h1>{article.title}</h1>

        <div>
          <p>{article.author?.displayName ?? "anonymous"}</p>
        </div>

        <div>
          <time dateTime={article.createdAt}>{new Date(article.createdAt).toLocaleString()}</time>

          {article.updatedAt !== article.createdAt && (
            <>
              <span> · Edited </span>
              <time dateTime={article.updatedAt}>
                {new Date(article.updatedAt).toLocaleString()}
              </time>
            </>
          )}

          {sessionId === article.author?.id && (
            <WriterSection articleId={BigInt(article.id)} boardId={BigInt(article.boardId)} />
          )}
        </div>
      </header>

      <section>
        <dl>
          <div>
            <dt>view</dt>
            <dd>{article.viewCount}</dd>
          </div>
          <div>
            <dt>comments</dt>
            <dd>{article.commentCount}</dd>
          </div>
        </dl>
      </section>

      <section>
        <div>{article.content}</div>
      </section>

      <section>
        <h2>Emote</h2>
        <EmoteSection
          emoteState={emoteDisplayState}
          postId={BigInt(article.id)}
          postKind="ARTICLE"
        />
      </section>

      <section>
        <h2>Tags</h2>
        {article.tags.length ? (
          <ol>
            {article.tags.map((articleTag) => (
              <li key={articleTag.id}>{articleTag.text ?? articleTag.id}</li>
            ))}
          </ol>
        ) : (
          <p>No tag.</p>
        )}
      </section>

      <section>
        <h2>Comment {article.commentCount}</h2>

        {article.commentCount ? (
          <CommentSection comments={commentDisplayTree} depth={0} viewerId={sessionId} />
        ) : (
          <p>No comment.</p>
        )}

        <CommentForm articleId={BigInt(article.id)} />
      </section>
    </article>
  );
}

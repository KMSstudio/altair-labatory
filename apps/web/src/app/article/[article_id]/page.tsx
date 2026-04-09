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
import { ViewCounter } from "./ViewCounter";

import styles from "./article.module.css";

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
  params = await params;
  const articleId = ParseArticleId(params.article_id);

  const [article, session] = await Promise.all([
    GetArticleCore({ articleId }),
    getServerSession(authOptions),
  ]);

  if (!article) notFound();

  const sessionId = ParseSessionUserId(session?.user?.id);
  const commentDisplayTree = BuildCommentDisplayTree(article.comments);
  const emoteDisplayState = BuildEmoteDisplayState(article.emotes, sessionId);

  return (
    <article className={styles.articleShell}>
      <ViewCounter articleId={article.id} />
      <header className={styles.articleHeader}>
        <div>
          <Link href={`/board/${article.boardId}/list`} className={styles.backLink}>
            Return to board.
          </Link>
        </div>

        <h1 className={styles.articleTitle}>{article.title}</h1>

        <div>
          <p className={styles.authorLine}>{article.author?.displayName ?? "anonymous"}</p>
        </div>

        <div className={styles.metaBar}>
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

      <section className={styles.statsPanel}>
        <dl className={styles.statsList}>
          <div className={styles.statsRow}>
            <dt className={styles.statsDt}>view</dt>
            <dd className={styles.statsDd}>{article.viewCount}</dd>
          </div>
          <div className={styles.statsRow}>
            <dt className={styles.statsDt}>comments</dt>
            <dd className={styles.statsDd}>{article.commentCount}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.section}>
        <div className={styles.bodyContent}>{article.content}</div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Emote</h2>
        <EmoteSection
          emoteState={emoteDisplayState}
          postId={BigInt(article.id)}
          postKind="ARTICLE"
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Tags</h2>
        {article.tags.length ? (
          <ol className={styles.tagList}>
            {article.tags.map((articleTag) => (
              <li className={styles.tagItem} key={articleTag.id}>
                {articleTag.text ?? articleTag.id}
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.emptyNote}>No tag.</p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Comment {article.commentCount}</h2>

        {article.commentCount ? (
          <CommentSection comments={commentDisplayTree} depth={0} viewerId={sessionId} />
        ) : (
          <p className={styles.emptyNote}>No comment.</p>
        )}

        <CommentForm articleId={BigInt(article.id)} />
      </section>
    </article>
  );
}

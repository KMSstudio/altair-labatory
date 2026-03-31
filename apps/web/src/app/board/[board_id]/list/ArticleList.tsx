import { ArticleDTO } from "@/repository/dto/article";
import Link from "next/link";
import styles from "../../board.module.css";

async function PinnedArticleItem({ pinnedArticle }: { pinnedArticle: ArticleDTO }) {
  return (
    <li className={styles.pinnedArticleItem}>
      <div>
        <Link 
          className={styles.articleTitleLink}
          href={`/article/${pinnedArticle.id}`}>
          <h3 className={styles.articleTitle}>{pinnedArticle.title}</h3>
        </Link>
      </div>
    </li>
  );
}

async function ArticleItem({ article }: { article: ArticleDTO }) {
  return (
    <li className={styles.articleItem}>
      <div>
        <Link 
          className={styles.articleTitleLink}
          href={`/article/${article.id}`}
        >
          <h3 className={styles.articleTitle}>{article.title}</h3>
        </Link>
      </div>
      <div className={styles.articleMeta}>
        <p>emote:{article.emotes.length}</p>
        <p>comment:{article.comments.length}</p>
        <p>view:{article.viewCount}</p>
      </div>
      <div className={styles.articleDate}>
        <p>{article.createdAt}</p>
      </div>
    </li>
  );
}

export default async function ArticleList({
  articles,
  pinnedArticles,
}: {
  articles: ArticleDTO[];
  pinnedArticles: ArticleDTO[] | null;
}) {
  return (
    <section className={styles.articleSection}>
      <h2 className={styles.sectionTitle}>Articles</h2>
      <ul className={styles.articleList}>
        {pinnedArticles &&
          pinnedArticles.map((pinnedArticle) => (
            <PinnedArticleItem key={pinnedArticle.id} pinnedArticle={pinnedArticle} />
          ))}
        {articles && articles.map((article) => <ArticleItem key={article.id} article={article} />)}
      </ul>
    </section>
  );
}

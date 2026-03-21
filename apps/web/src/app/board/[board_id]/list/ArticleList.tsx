import { ArticleDTO } from "@/repository/dto/article";
import Link from "next/link";

async function PinnedArticleItem({ pinnedArticle }: { pinnedArticle: ArticleDTO }) {
  return (
    <li>
      <div>
        <Link href={`/article/${pinnedArticle.id}`}>
          <h3>{pinnedArticle.title}</h3>
        </Link>
      </div>
    </li>
  );
}

async function ArticleItem({ article }: { article: ArticleDTO }) {
  return (
    <li>
      <div>
        <Link href={`/article/${article.id}`}>
          <h3>{article.title}</h3>
        </Link>
      </div>
      <div>
        <p>emote:{article.emotes.length}</p>
        <p>comment:{article.comments.length}</p>
        <p>view:{article.viewCount}</p>
      </div>
      <div>
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
    <section>
      <h2>Articles</h2>
      <ul>
        {pinnedArticles &&
          pinnedArticles.map((pinnedArticle) => (
            <PinnedArticleItem key={pinnedArticle.id} pinnedArticle={pinnedArticle} />
          ))}
        {articles && articles.map((article) => <ArticleItem key={article.id} article={article} />)}
      </ul>
    </section>
  );
}

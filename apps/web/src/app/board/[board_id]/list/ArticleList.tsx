import { GetArticlesResult, GetPinnedArticlesResult } from "../../actions";
import Link from "next/link";

async function PinnedArticleItem({ pinnedArticle }: { pinnedArticle: GetPinnedArticlesResult[number] }) {
    return (<li>
        <div>
            <Link href={`/article/${pinnedArticle.id}`}>
                <h3>{pinnedArticle.title}</h3>
            </Link>
        </div>
    </li>)
}

async function ArticleItem({ article }: { article: GetArticlesResult[number] }) {
    const totalEmote = (
        article.cheerCount +
        article.likeCount +
        article.empathyCount +
        article.questionCount +
        article.badCount
    )
    return (<li>
        <div>
            <Link href={`/article/${article.id}`}>
                <h3>{article.title}</h3>
            </Link>
        </div>
        <div>
            <p>{totalEmote}</p>
            <p>{article._count.comments}</p>
            <p>{article.viewCount}</p>
        </div>
        <div>
            <p>{article.createdAt.toDateString()}</p>
        </div>
    </li>)
}


export default async function ArticleList({ articles, pinnedArticles }: { articles: GetArticlesResult | null, pinnedArticles: GetPinnedArticlesResult | null }) {

    return (
        <section>
            <h2>전체 글</h2>
            <ul>
                {pinnedArticles && pinnedArticles.map((pinnedArticle) => (
                    <PinnedArticleItem key={pinnedArticle.id} pinnedArticle={pinnedArticle} />
                ))}
                {articles && articles.map((article) => (
                    <ArticleItem key={article.id} article={article} />
                ))}
            </ul>
        </section>
    )
}

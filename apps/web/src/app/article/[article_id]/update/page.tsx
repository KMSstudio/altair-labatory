import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { GetArticle } from "../../actions";
import { ArticleUpdateForm } from "./ArticleUpdateForm";

export default async function Page({ params }: { params: { article_id: string } }) {
  params = await params;
  let articleId: bigint;
  try {
    articleId = BigInt(params.article_id);
  } catch {
    notFound();
  }
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/");
  }
  const sessionId = BigInt(session.user.id);
  const article = await GetArticle({ articleId });
  if (!article) {
    notFound();
  }
  if (!article.author || sessionId !== article.author?.id) {
    redirect("/");
  }
  return <ArticleUpdateForm article={article} />;
}

// @/app/article/[article_id]/update/page.tsx

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { GetArticleCore } from "@/repository/db/article/article";
import { ArticleUpdateForm } from "./ArticleUpdateForm";

export default async function Page({
  params,
  searchParams,
}: {
  params: { article_id: string };
  searchParams?: { error: string };
}) {
  params = await params;
  searchParams = await searchParams;
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
  let userId: bigint;
  try {
    userId = BigInt(session.user.id);
  } catch {
    redirect("/");
  }

  const article = await GetArticleCore(articleId);
  if (!article) {
    notFound();
  }
  if (!article.author || userId !== BigInt(article.author?.id)) {
    redirect("/");
  }

  return (
    <div>
      {searchParams?.error && <p>{decodeURIComponent(searchParams.error)}</p>}
      <ArticleUpdateForm article={article} />
    </div>
  );
}

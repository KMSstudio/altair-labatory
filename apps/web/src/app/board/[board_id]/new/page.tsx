// @/app/board/[boardId]/new/page.tsx

import { getServerSession } from "next-auth";
import ArticleForm from "./NewArticleForm";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page({
  params,
  searchParams,
}: {
  params: { board_id: string };
  searchParams?: { error: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");
  params = await params;
  searchParams = await searchParams;
  return (
    <main>
      <h1>New article</h1>
      {searchParams?.error && <p>{decodeURIComponent(searchParams.error)}</p>}
      <ArticleForm boardId={params.board_id} />
    </main>
  );
}

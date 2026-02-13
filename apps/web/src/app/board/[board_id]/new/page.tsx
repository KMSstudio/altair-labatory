// @/app/board/[boardId]/new/page.tsx

import { getServerSession } from "next-auth";
import ArticleForm from "./NewArticleForm";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { board_id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");
  params = await params;
  return (
    <main>
      <h1>새 글 작성</h1>

      <ArticleForm boardId={params.board_id} />
    </main>
  );
}

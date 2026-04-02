// @/app/board/[boardId]/new/page.tsx

import { getServerSession } from "next-auth";
import ArticleForm from "./NewArticleForm";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import styles from "../../board.module.css";

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
    <main className={styles.formShell}>
      <h1 className={styles.boardTitle}>New article</h1>
      {searchParams?.error && (
        <p className={styles.errorText}>{decodeURIComponent(searchParams.error)}</p>
      )}
      <ArticleForm boardId={params.board_id} />
    </main>
  );
}

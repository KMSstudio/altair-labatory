// @/app/board/[boardId]/new/page.tsx

import ArticleForm from "./NewArticleForm";

export default async function Page({ params }: { params: { board_id: string } }) {
  params = await params
  return (
    <main>
      <h1>새 글 작성</h1>

      <ArticleForm boardId={params.board_id} />
    </main>
  );
}

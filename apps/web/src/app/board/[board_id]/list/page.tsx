// @/app/board/[board_id]/list/page.tsx

import { notFound } from "next/navigation";
import {
  GetArticles,
  GetArticles_RetType,
  GetBoard,
  GetPinnedArticles,
  GetPinnedArticles_RetType,
} from "../../actions";
import ArticleList from "./ArticleList";
import { PageExplorer } from "./PageExplorer";
import Link from "next/link";

export default async function Page({
  params,
  searchParams,
}: {
  params: { board_id: string };
  searchParams?: { page?: string };
}) {
  params = await params;
  searchParams = await searchParams;

  let boardId;
  try {
    boardId = BigInt(params.board_id);
  } catch {
    notFound();
  }
  const board = await GetBoard(boardId);
  if (!board) {
    notFound();
  }
  if (!board.isActive) {
    notFound();
  }

  let page: number = 1;
  if (searchParams?.page) {
    try {
      page = Number.parseInt(searchParams?.page, 10);
      console.log(page);
      if (!Number.isFinite(page) || page < 1) throw new Error();
    } catch {
      notFound();
    }
  }
  const pageSize = 10;
  const maxPage = Math.ceil(board._count.articles / pageSize);
  let articles: GetArticles_RetType;
  let pinnedArticles: GetPinnedArticles_RetType;

  try {
    articles = await GetArticles(boardId, page, pageSize);
    pinnedArticles = await GetPinnedArticles(boardId);
  } catch (e) {
    return <div>{e instanceof Error ? e.message : "Unable to load"}</div>;
  }
  return (
    <main>
      <header>
        <h1>
          <span lang="ko">{board.nameKo}</span>
          <small lang="en">{board.nameEn}</small>
        </h1>
        {board.description && <p>{board.description}</p>}
      </header>
      <div>
        <Link href={`/board/${boardId}/new`}>Write a new article</Link>
      </div>
      <ArticleList articles={articles} pinnedArticles={pinnedArticles} />
      <PageExplorer BoardId={board.id} currentPage={page} maxPage={maxPage} maxLength={5} />
    </main>
  );
}

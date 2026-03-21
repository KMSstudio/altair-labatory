// @/app/board/[board_id]/list/page.tsx

import { notFound } from "next/navigation";
import ArticleList from "./ArticleList";
import { PageExplorer } from "./PageExplorer";
import Link from "next/link";
import { getBoard, getBoardArticles, getPinnedArticles } from "@/repository/db/article/board";
import { ArticleDTO, BoardDTO } from "@/repository/dto/article";

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

  let page: number = 1;
  if (searchParams?.page) {
    try {
      page = Number.parseInt(searchParams?.page, 10);
      if (!Number.isFinite(page) || page < 1) throw new Error();
    } catch {
      notFound();
    }
  }
  const pageSize = 10;
  let board: BoardDTO | null = null;
  let articles: ArticleDTO[];
  let pinnedArticles: ArticleDTO[];
  const start = pageSize * (page - 1);
  const finish = pageSize * page;
  try {
    [board, articles, pinnedArticles] = await Promise.all([
      await getBoard({ boardId }),
      await getBoardArticles({ boardId, start, finish }),
      await getPinnedArticles({ boardId }),
    ]);
    if (!board || !board.isActive) {
      throw new Error();
    }
  } catch (e) {
    if (!board || !board.isActive) {
      notFound();
    } else {
      return <div>{e instanceof Error ? e.message : "Unable to load board articles."}</div>;
    }
  }
  const maxPage = Math.ceil(board._count.articles / pageSize);
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
      <PageExplorer BoardId={BigInt(board.id)} currentPage={page} maxPage={maxPage} maxLength={5} />
    </main>
  );
}

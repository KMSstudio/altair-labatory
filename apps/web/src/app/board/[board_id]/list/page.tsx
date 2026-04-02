// @/app/board/[board_id]/list/page.tsx

import { notFound } from "next/navigation";
import ArticleList from "./ArticleList";
import { PageExplorer } from "./PageExplorer";
import Link from "next/link";
import { getBoard, getBoardArticles, getPinnedArticles } from "@/repository/db/article/board";
import { ArticleDTO, BoardDTO } from "@/repository/dto/article";
import { GetTags } from "@/repository/db/article/tag";
import Search from "./Search";
import styles from "../../board.module.css";
import { Suspense } from "react";

export default async function Page({
  params,
  searchParams,
}: {
  params: { board_id: string };
  searchParams?: { "tags[]": string | string[]; page?: string };
}) {
  params = await params;
  searchParams = await searchParams;

  const allTags = await GetTags({});

  const tagTexts = searchParams?.["tags[]"];
  const normalizedTagTexts =
    typeof tagTexts === "string" ? [tagTexts] : Array.isArray(tagTexts) ? tagTexts : [];

  const tagIds = normalizedTagTexts
    .map((text) => allTags.find((tag) => tag.text === text)?.id)
    .filter((id) => id !== undefined)
    .map((id) => BigInt(id));

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
      await getBoardArticles({ boardId, start, finish, tags: tagIds }),
      await getPinnedArticles({ boardId, tags: tagIds }),
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
    <main className={styles.boardShell}>
      <header className={styles.boardHeader}>
        <h1 className={styles.boardTitle}>
          <span lang="ko">{board.nameKo}</span>
          <small lang="en">{board.nameEn}</small>
        </h1>
        {board.description && <p className={styles.boardDescription}>{board.description}</p>}
      </header>
      <div className={styles.actions}>
        <Link className={styles.primary} href={`/board/${boardId}/new`}>
          Write a new article
        </Link>
      </div>
      <Suspense fallback={null}>
        <Search tags={allTags.map((e) => e?.text).filter((t): t is string => !!t)} />
      </Suspense>
      <ArticleList articles={articles} pinnedArticles={pinnedArticles} />
      <PageExplorer BoardId={BigInt(board.id)} currentPage={page} maxPage={maxPage} maxLength={5} />
    </main>
  );
}

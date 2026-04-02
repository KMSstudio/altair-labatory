"use client";

import Link from "next/link";
import styles from "../../board.module.css";
import { useSearchParams } from "next/navigation";

export function PageExplorer({
  BoardId,
  currentPage,
  maxPage,
  maxLength,
}: {
  BoardId: bigint;
  currentPage: number;
  maxPage: number;
  maxLength: number;
}) {
  const searchParams = useSearchParams();
  const currentSearchTags = searchParams.getAll("tags[]");

  if (maxPage < 1 || maxLength < 1) {
    return (
      <div>
        <p>No page exists.</p>
      </div>
    );
  }

  let start = Math.max(1, currentPage - Math.floor(Number(maxLength / 2)));
  const end = Math.min(maxPage, start + maxLength - 1);
  if (end - start < maxLength - 1) {
    start = Math.max(1, currentPage - maxLength + 1);
  }

  const tagsQuery = currentSearchTags.map((tag) => `tags[]=${encodeURIComponent(tag)}`).join("&");

  return (
    <div className={styles.pagination}>
      {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((idx) => (
        <PageExplorerItem
          key={idx}
          BoardId={BoardId}
          pageNumber={idx}
          isCurrentPage={idx === currentPage}
          tagsQuery={tagsQuery}
        />
      ))}
    </div>
  );
}

function PageExplorerItem({
  BoardId,
  pageNumber,
  isCurrentPage,
  tagsQuery,
}: {
  BoardId: bigint;
  pageNumber: number;
  isCurrentPage: boolean;
  tagsQuery: string;
}) {
  let href = `/board/${BoardId}/list?page=${pageNumber}`;
  if (!!tagsQuery) href += `&${tagsQuery}`;
  console.log(href);

  return isCurrentPage ? (
    <p className={styles.pageCurrent}>{pageNumber}</p>
  ) : (
    <Link className={styles.pageLink} href={href}>
      {pageNumber}
    </Link>
  );
}

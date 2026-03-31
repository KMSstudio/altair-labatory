import Link from "next/link";
import styles from "../../board.module.css";

export async function PageExplorer({
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
  return (
    <div className={styles.pagination}>
      {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((idx) => (
        <PageExplorerItem
          key={idx}
          BoardId={BoardId}
          pageNumber={idx}
          isCurrentPage={idx === currentPage}
        />
      ))}
    </div>
  );
}

async function PageExplorerItem({
  BoardId,
  pageNumber,
  isCurrentPage,
}: {
  BoardId: bigint;
  pageNumber: number;
  isCurrentPage: boolean;
}) {
  return isCurrentPage ? (
    <p className={styles.pageCurrent}>{pageNumber}</p>
  ) : (
    <Link 
      className={styles.pageLink}
      href={`/board/${BoardId}/list?page=${pageNumber}`}
    >
      {pageNumber}
    </Link>
  );
}

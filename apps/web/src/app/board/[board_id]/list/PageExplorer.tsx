import Link from "next/link";

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
  if (currentPage > maxPage) {
    return <></>;
  }
  const start = Math.max(1, currentPage - Number(maxLength / 2));
  const end = Math.min(maxPage, start + maxLength);
  return (
    <div>
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
  return <Link href={`/board/${BoardId}/list?page=${pageNumber}`}>{pageNumber}</Link>;
}

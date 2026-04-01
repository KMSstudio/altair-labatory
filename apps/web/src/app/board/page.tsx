import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBoardList } from "@/repository/db/article/board";
import { BoardDTO } from "@/repository/dto/article";
import Link from "next/link";

function BoardItem({ board }: { board: BoardDTO }) {
  return (
    <li>
      <Link href={`/board/${board.id}/list`}>
        <span lang="ko">{board.nameKo}</span>
        <small lang="en">{board.nameEn}</small>
      </Link>
      {board.description && <p>{board.description}</p>}
      <span>{board._count.articles} articles</span>
    </li>
  );
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) return notFound();

  const boards = await getBoardList();

  return (
    <main>
      <header>
        <h1>Board List</h1>
      </header>
      <ul>
        {boards.map((board) => (
          <BoardItem key={board.id} board={board} />
        ))}
      </ul>
    </main>
  );
}
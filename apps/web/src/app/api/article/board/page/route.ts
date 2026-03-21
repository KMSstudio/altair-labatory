// @/app/api/article/board/page/route.ts

import { NextResponse } from "next/server";
import { Prisma } from "@labatory/db";

import { getBoardArticles } from "@/repository/db/article/board";

type Body = {
  boardId: string;
  page: string;
  pageSize: string;
};

/**
 * Get a paginated list of articles in a board.
 *
 * Validation performed here includes:
 * - Request URL validation
 *
 * @param request - HTTP request containing URL. URL contains boardId, page, pageSize.
 *
 * @returns
 * - `200` with `{ ok: true, articles }` if update succeeds
 * - `400` for validation errors
 * - `500` for internal or database errors
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const body: Body = {
    boardId: searchParams.get("boardId") ?? "",
    page: searchParams.get("page") ?? "",
    pageSize: searchParams.get("pageSize") ?? "",
  };
  if (!body.boardId) return NextResponse.json({ error: "Board id is required." }, { status: 400 });
  if (!body.page || !body.pageSize)
    return NextResponse.json({ error: "page and page size are required." }, { status: 400 });

  let boardId: bigint;
  try {
    boardId = BigInt(body.boardId);
  } catch {
    return NextResponse.json({ error: "Invalid board id." }, { status: 400 });
  }
  const page = Number(body.page);
  if (!Number.isFinite(page) || page < 1)
    return NextResponse.json({ error: "Invalid page." }, { status: 400 });
  const pageSize = Number(body.pageSize);
  if (!Number.isFinite(pageSize) || pageSize < 1)
    return NextResponse.json({ error: "Invalid page size." }, { status: 400 });

  try {
    const articles = await getBoardArticles({
      boardId,
      start: (page - 1) * pageSize,
      finish: page * pageSize,
    });
    return NextResponse.json({ ok: true, articles }, { status: 200 });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal database error." }, { status: 500 });
  }
}

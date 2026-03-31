// @/app/api/article/board/pin/route.ts

import { NextResponse } from "next/server";
import { Prisma } from "@labatory/db";

import { getPinnedArticles } from "@/repository/db/article/board";

type Body = {
  boardId: string;
  tags: string[];
};

/**
 * Get all pinned articles in a board.
 *
 * Validation performed here includes:
 * - Request URL validation
 *
 * @param request - HTTP request containing URL. URL contains boardId.
 *
 * @returns
 * - `200` with `{ ok: true, pinnedArticles }` if update succeeds
 * - `400` for validation errors
 * - `500` for internal or database errors
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const body: Body = {
    boardId: searchParams.get("boardId") ?? "",
    tags: searchParams.getAll("tags"),
  };

  if (!body.boardId) return NextResponse.json({ error: "Board id is required." }, { status: 400 });

  let boardId: bigint;
  try {
    boardId = BigInt(body.boardId);
  } catch {
    return NextResponse.json({ error: "Invalid board id." }, { status: 400 });
  }

  const tags: bigint[] = [];
  try {
    body.tags?.map((e) => {
      tags.push(BigInt(e));
    });
  } catch {
    return NextResponse.json({ error: "Invalid tags." }, { status: 400 });
  }

  try {
    const pinnedArticles = await getPinnedArticles({ boardId, tags: tags });
    return NextResponse.json({ ok: true, pinnedArticles }, { status: 200 });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal database error." }, { status: 500 });
  }
}

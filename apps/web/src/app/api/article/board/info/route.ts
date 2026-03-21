// @/app/api/article/board/info/route.ts

import { NextResponse } from "next/server";
import { Prisma } from "@labatory/db";

import { getBoard } from "@/repository/db/article/board";

type Body = {
  boardId: string;
};

/**
 * Get id, name, description, and the number of articles in a board.
 *
 * Validation performed here includes:
 * - Request URL validation
 *
 * @param request - HTTP request containing URL. URL contains boardId.
 *
 * @returns
 * - `200` with `{ ok: true, board }` if update succeeds
 * - `400` for validation errors
 * - `404` if board correspond to input does not exists.
 * - `500` for internal or database errors
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const body: Body = {
    boardId: searchParams.get("boardId") ?? "",
  };

  if (!body.boardId) return NextResponse.json({ error: "Board id is required." }, { status: 400 });

  let boardId: bigint;
  try {
    boardId = BigInt(body.boardId);
  } catch {
    return NextResponse.json({ error: "Invalid board id." }, { status: 400 });
  }

  try {
    const board = await getBoard({ boardId });
    if (!board) return NextResponse.json({ error: "Board does not exist." }, { status: 404 });
    return NextResponse.json({ ok: true, board }, { status: 200 });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal database error." }, { status: 500 });
  }
}

// @/app/api/article/board/pin/route.ts

import { NextResponse } from "next/server";
import { Prisma } from "@labatory/db";

import { getPinnedArticles } from "@/repository/db/article/board";

/* eslint-disable */
type body = {
  boardId: string;
};
/* eslint-enable */

/**
 * Get all pinned article of a board.
 *
 * This API endpoint performs all **server-side validation** before
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
  const boardIdRaw = searchParams.get("boardId");

  if (!boardIdRaw) return NextResponse.json({ error: "Board id is required." }, { status: 400 });

  let boardId: bigint;
  try {
    boardId = BigInt(boardIdRaw);
  } catch {
    return NextResponse.json({ error: "Invalid board id." }, { status: 400 });
  }

  try {
    const pinnedArticles = await getPinnedArticles({ boardId });
    return NextResponse.json({ ok: true, pinnedArticles }, { status: 200 });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal database error." }, { status: 500 });
  }
}

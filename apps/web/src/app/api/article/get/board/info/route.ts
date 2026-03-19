// @/app/api/article/get/board/info/route.ts

import { NextResponse } from "next/server";
import { Prisma } from "@labatory/db";

import { getBoard } from "@/repository/db/article/board";

/**
 * Get id, name, description, and the number of articles of a board.
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
 * - `404` if board correspond to input does not exists.
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
        const board = await getBoard({ boardId });
        if (!board) return NextResponse.json({ error: "Board does not exists." }, { status: 404 });
        return NextResponse.json({ ok: true, board }, { status: 200 });
    } catch (e) {
        if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
            return NextResponse.json({ error: "Internal server error." }, { status: 500 });
        }
        return NextResponse.json({ error: "Internal database error." }, { status: 500 });
    }
}

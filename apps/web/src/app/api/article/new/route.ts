// @/app/api/article/new/route.ts

import { NextResponse } from "next/server";
import { prisma, Prisma } from "@labatory/db";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { CreateArticleCore } from "@/repository/db/article";
import { buildCreateArticleCtx } from "@/app/api/_util/createArticleCtx";

type Body = {
  boardId: string;
  title: string;
  content: string;
  tagIdsRaw?: string[];
};

/**
 * Handle article creation requests.
 *
 * This API endpoint performs all **server-side validation** before
 * delegating the actual database write operation to `CreateArticleCore`.
 *
 * Validation performed here includes:
 * - User authentication via NextAuth session
 * - Author ID validation
 * - Request body validation
 * - Board existence and status check
 * - Tag ID parsing
 * - Client IP extraction
 *
 * If validation succeeds, the endpoint calls `CreateArticleCore`
 * to create the article and returns the created article ID.
 *
 * @param request - Incoming HTTP request containing a JSON body.
 *
 * @returns
 * - `200` with `{ ok: true, articleId }` if creation succeeds
 * - `400` for validation errors
 * - `401` if the user is not authenticated
 * - `500` for internal or database errors
 */
export async function POST(request: Request) {
  let body: Body;
  try { body = (await request.json()) as Body; }
  catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const session = await getServerSession(authOptions);
  if (!session?.user) throw Error("User must be logged in.");
  if (!session.user.id) throw Error("Invalid session.");

  const rawBoardId = body.boardId?.toString().trim() ?? "";
  const title = body.title?.toString() ?? "";
  const content = body.content?.toString() ?? "";
  const tagIdsRaw = Array.isArray(body.tagIdsRaw) ? body.tagIdsRaw : [];

  let boardId: bigint;
  if (!rawBoardId) return NextResponse.json({ error: "Board id is required." }, { status: 400 });
  if (!title || !content) return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
  try { boardId = BigInt(rawBoardId.trim()); }
  catch { throw Error("Invalid board id."); }

  let ctx;
  try { ctx = await buildCreateArticleCtx(session); }
  catch (e) {
    const msg = e instanceof Error ? e.message : "Internal server error.";
    const status = msg === "User must be logged in." ? 401 : 400;
    return NextResponse.json({ error: msg }, { status });
  }

  // Load minimal board info for existence check
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { isActive: true },
  });
  if (!board) return NextResponse.json({ error: "Board does not exists." }, { status: 400 });
  if (!board.isActive) return NextResponse.json({ error: "Board is inactive." }, { status: 400 });

  let tagIds: bigint[];
  try { tagIds = tagIdsRaw.map((tagId) => BigInt(tagId)); }
  catch { return NextResponse.json({ error: "Invalid tag id." }, { status: 400 }); }

  try {
    const articleId = await CreateArticleCore(
      ctx, boardId,
      { title, content, tagIds },
    );

    return NextResponse.json({ ok: true, articleId: articleId.toString() }, { status: 200 });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
    if (e.code === "P2003") return NextResponse.json({ error: "Invalid reference." }, { status: 400 });
    if (e.code === "P2002") return NextResponse.json({ error: "Duplicate tags exist." }, { status: 400 });
    return NextResponse.json({ error: "Internal database error." }, { status: 500 });
  }
}

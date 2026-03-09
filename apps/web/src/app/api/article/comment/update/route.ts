// @/app/api/article/comment/update/route.ts

import { NextResponse } from "next/server";
import { Prisma } from "@labatory/db";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { buildCommentCtx } from "@/app/api/_util/createArticleCtx";
import { parseBigInt } from "@/app/api/_util/parse";
import { assertCommentAuthorOrAdmin, mapPermissionError } from "@/app/api/_util/assertPermission";

import { UpdateComment } from "@/repository/db/comment";
import type { Comment_Ctx, Comment_UpdateInput } from "@/types/article";

type Body = {
  commentId: string;
  content: string;
};

/**
 * Update an existing comment.
 *
 * This API endpoint allows a user to modify the content of a comment.
 * The request must include a valid `commentId` and new `content`.
 *
 * Authorization rules:
 * - The comment author can update the comment.
 * - An ADMIN user can update any comment.
 *
 * @param request - Incoming HTTP request containing `{ commentId, content }`.
 *
 * @returns
 * - `200` `{ ok: true, comment }` when the comment is successfully updated
 * - `400` when the request body or parameters are invalid
 * - `401` when the user is not authenticated
 * - `403` when the user does not have permission to modify the comment
 * - `500` for unexpected internal server errors
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "User must be logged in." }, { status: 401 });
  }

  const content = body.content?.toString().trim() ?? "";
  if (!content) {
    return NextResponse.json({ error: "Content is required." }, { status: 400 });
  }

  let commentId: bigint;
  let userId: bigint;
  try {
    commentId = parseBigInt(body.commentId, "comment id");
    userId = parseBigInt(session.user.id, "user id");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid parameter.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    await assertCommentAuthorOrAdmin(commentId, userId, session.user.role);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal server error.";
    const { error, status } = mapPermissionError(msg);
    return NextResponse.json({ error }, { status });
  }

  let ctx: Comment_Ctx;
  try {
    ctx = (await buildCommentCtx(session)) as Comment_Ctx;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal server error.";
    const status = msg === "User must be logged in." ? 401 : 400;
    return NextResponse.json({ error: msg }, { status });
  }

  const input: Comment_UpdateInput = { content };

  try {
    const comment = await UpdateComment(commentId, ctx, input);
    return NextResponse.json({ ok: true, comment }, { status: 200 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Database error." }, { status: 400 });
    }

    const msg = e instanceof Error ? e.message : "Internal server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

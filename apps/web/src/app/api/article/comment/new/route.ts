// @/app/api/article/comment/new/route.ts

import { NextResponse } from "next/server";
import { Prisma } from "@labatory/db";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { buildCommentCtx } from "@/app/api/_util/createArticleCtx";
import { parseBigInt } from "@/app/api/_util/parse";
import {
  assertArticleCommentable,
  assertParentCommentInArticle,
  mapPermissionError,
} from "@/app/api/_util/assertPermission";

import { PostComment } from "@/repository/db/article/comment";
import type { Comment_Ctx, Comment_PostInput } from "@/types/article";

type Body = {
  articleId: string;
  parentId?: string | null;
  content: string;
};

/**
 * Create a new comment on an article.
 *
 * This endpoint creates a comment for a target article.
 * The requester does not need to be the article author, but must be logged in.
 *
 * @param request - HTTP request containing `{ articleId, parentId?, content }`
 *
 * @returns
 * - `200` `{ ok: true, comment }` on success
 * - `400` for invalid input or invalid article / parent comment state
 * - `401` when the user is not logged in
 * - `500` for internal server errors
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

  let articleId: bigint;
  let parentId: bigint | null = null;
  try {
    articleId = parseBigInt(body.articleId, "article id");
    if (body.parentId != null && body.parentId.toString().trim() !== "") {
      parentId = parseBigInt(body.parentId, "parent comment id");
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid parameter.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    await assertArticleCommentable(articleId);
    if (parentId !== null) {
      await assertParentCommentInArticle(parentId, articleId);
    }
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

  const input: Comment_PostInput = {
    articleId,
    parentId,
    content,
  };

  try {
    const comment = await PostComment(ctx, input);
    return NextResponse.json({ ok: true, comment }, { status: 200 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2003")
        return NextResponse.json({ error: "Invalid reference." }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

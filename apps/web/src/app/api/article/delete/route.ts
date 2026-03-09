// @/app/api/article/delete/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { DeleteArticle } from "@/repository/db/article";
import { parseBigInt } from "@/app/api/_util/parse";
import { assertArticleAuthorOrAdmin, mapPermissionError } from "@/app/api/_util/assertPermission";

type Body = {
  articleId: string;
};

/**
 * Delete an article.
 *
 * This endpoint deletes an article if the requester is the author
 * or an ADMIN user.
 *
 * Validation steps:
 * 1. Parse request body
 * 2. Validate session
 * 3. Convert ids to bigint
 * 4. Verify permission
 * 5. Execute deletion
 *
 * @param request - HTTP request containing `{ articleId }`
 *
 * @returns
 * - `200` `{ ok: true, articleId }` on success
 * - `400` invalid parameters
 * - `401` user not logged in
 * - `403` permission denied
 * - `500` internal server error
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

  let articleId: bigint;
  let userId: bigint;
  try {
    articleId = parseBigInt(body.articleId, "article id");
    userId = parseBigInt(session.user.id, "user id");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid parameter.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    await assertArticleAuthorOrAdmin(articleId, userId, session.user.role);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal server error.";
    const { error, status } = mapPermissionError(msg);
    return NextResponse.json({ error }, { status });
  }

  try {
    await DeleteArticle({ articleId });

    return NextResponse.json({ ok: true, articleId: articleId.toString() }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

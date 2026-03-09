// @/app/api/article/delete/route.ts

import { NextResponse } from "next/server";
import { DeleteArticle } from "@/repository/db/article";

type Body = {
  articleId: string;
};

/**
 * Handle article delete requests.
 *
 * This API endpoint validates the incoming request body and delegates
 * the actual deletion logic to `DeleteArticle`.
 *
 * @param request - Incoming HTTP request containing a JSON body.
 *
 * @returns
 * - `200` with `{ ok: true, articleId }` if deletion succeeds
 * - `400` for validation errors
 * - `401` if the user is not authenticated
 * - `403` if the user is not the author
 * - `500` for internal errors
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const articleIdRaw = body.articleId?.toString().trim() ?? "";
  if (!articleIdRaw)
    return NextResponse.json({ error: "Article id is required." }, { status: 400 });

  let articleId: bigint;
  try {
    articleId = BigInt(articleIdRaw);
  } catch {
    return NextResponse.json({ error: "Invalid article id." }, { status: 400 });
  }

  try {
    await DeleteArticle({ articleId });
    return NextResponse.json({ ok: true, articleId: articleId.toString() }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal server error.";

    if (msg === "Unauthorized.") return NextResponse.json({ error: msg }, { status: 401 });
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 403 });
    if (msg === "Invalid user id.") return NextResponse.json({ error: msg }, { status: 400 });
    if (msg === "Article does not Exist.")
      return NextResponse.json({ error: msg }, { status: 400 });

    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

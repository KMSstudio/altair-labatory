// @/app/api/article/view/route.ts

import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { CreateArticleViewLog } from "@/repository/db/article/view";
import { getClientIp } from "@/util/util";

type Body = {
  articleId: string;
};

/**
 * Handle article view recording requests.
 *
 * This endpoint is called by the client after 3 seconds of viewing an article.
 * It records the view in the `article_view_log` table.
 *
 * - Anonymous users (no session) are also recorded using their IP.
 * - No authentication is required to record a view.
 *
 * @param request - Incoming HTTP request containing a JSON body with `articleId`.
 *
 * @returns
 * - `200` with `{ ok: true }` if the view is recorded
 * - `400` for validation errors
 * - `500` for internal or database errors
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawArticleId = body.articleId?.toString().trim() ?? "";
  if (!rawArticleId) {
    return NextResponse.json({ error: "Article id is required." }, { status: 400 });
  }

  let articleId: bigint;
  try {
    articleId = BigInt(rawArticleId);
  } catch {
    return NextResponse.json({ error: "Invalid article id." }, { status: 400 });
  }

  const ip = (await getClientIp()) ?? "unknown";

  const session = await getServerSession(authOptions);
  let userId: bigint | null = null;
  if (session?.user?.id) {
    try {
      userId = BigInt(session.user.id);
    } catch {
      userId = null;
    }
  }

  try {
    await CreateArticleViewLog({ articleId, ip, userId });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

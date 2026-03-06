// @/app/api/article/update/route.ts

import { NextResponse } from "next/server";
import { Prisma, prisma } from "@labatory/db";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { buildCreateArticleCtx } from "@/app/api/_util/createArticleCtx";
import { UpdateArticleCore } from "@/repository/db/article";

type Body = {
  articleId: string;
  title: string;
  content: string;
  tagIdsRaw?: string[];
};

/**
 * Handle article update requests.
 *
 * This API endpoint performs all **server-side validation** before
 * delegating the actual database write operation to `UpdateArticleCore`.
 *
 * Validation performed here includes:
 * - Request body validation
 * - Article existence check
 * - Authentication and client IP extraction via `buildCreateArticleCtx`
 * - Author ownership check (only author can update)
 * - Tag ID parsing
 *
 * @param request - Incoming HTTP request containing a JSON body.
 *
 * @returns
 * - `200` with `{ ok: true, articleId }` if update succeeds
 * - `400` for validation errors
 * - `401` if the user is not authenticated
 * - `403` if the user is not the author
 * - `500` for internal or database errors
 */
export async function POST(request: Request) {
  let body: Body;
  try { body = (await request.json()) as Body; }
  catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
  
  const session = await getServerSession(authOptions);
  if (!session?.user) throw Error("User must be logged in.");
  if (!session.user.id) throw Error("Invalid session.");

  const articleIdRaw = body.articleId?.toString().trim() ?? "";
  const title = body.title?.toString() ?? "";
  const content = body.content?.toString() ?? "";
  const tagIdsRaw = Array.isArray(body.tagIdsRaw) ? body.tagIdsRaw : [];

  if (!articleIdRaw) return NextResponse.json({ error: "Article id is required." }, { status: 400 });
  if (!title || !content) return NextResponse.json({ error: "Title and content are required." }, { status: 400 });

  let articleId: bigint;
  try { articleId = BigInt(articleIdRaw); }
  catch { return NextResponse.json({ error: "Invalid article id." }, { status: 400 }); }

  // Load minimal article info for ownership check
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { authorId: true, isHidden: true },
  });

  if (!article) return NextResponse.json({ error: "Article does not Exist." }, { status: 400 });
  if (article.isHidden) return NextResponse.json({ error: "Article is hidden." }, { status: 400 });

  let ctx;
  try { ctx = await buildCreateArticleCtx(session); }
  catch (e) {
    const msg = e instanceof Error ? e.message : "Internal server error.";
    const status = msg === "User must be logged in." ? 401 : 400;
    return NextResponse.json({ error: msg }, { status });
  }

  if (article.authorId !== ctx.authorId) return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  let tagIds: bigint[];
  try { tagIds = tagIdsRaw.map((tagId) => BigInt(tagId)); }
  catch { return NextResponse.json({ error: "Invalid tag id." }, { status: 400 }); }

  try {
    await UpdateArticleCore(articleId, ctx, { title, content, tagIds });
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

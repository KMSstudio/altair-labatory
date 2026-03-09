// @/app/api/article/comment/new/route.ts

import { NextResponse } from "next/server";
import { Prisma, prisma } from "@labatory/db";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { buildCommentCtx } from "@/app/api/_util/createArticleCtx";
import { PostComment } from "@/repository/db/comment";
import type { Comment_Ctx, Comment_PostInput } from "@/types/article";

type Body = {
  articleId: string;
  parentId?: string | null;
  content: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) throw Error("User must be logged in.");
  if (!session.user.id) throw Error("Invalid session.");

  const articleIdRaw = body.articleId?.toString().trim() ?? "";
  const parentIdRaw = body.parentId?.toString().trim() ?? "";
  const content = body.content?.toString().trim() ?? "";

  if (!articleIdRaw)
    return NextResponse.json({ error: "Article id is required." }, { status: 400 });
  if (!content) return NextResponse.json({ error: "Content is required." }, { status: 400 });

  let articleId: bigint;
  try {
    articleId = BigInt(articleIdRaw);
  } catch {
    return NextResponse.json({ error: "Invalid article id." }, { status: 400 });
  }

  let parentId: bigint | null = null;
  if (parentIdRaw) {
    try {
      parentId = BigInt(parentIdRaw);
    } catch {
      return NextResponse.json({ error: "Invalid parent comment id." }, { status: 400 });
    }
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { id: true, isHidden: true },
  });

  if (!article) return NextResponse.json({ error: "Article does not exist." }, { status: 400 });
  if (article.isHidden) return NextResponse.json({ error: "Article is hidden." }, { status: 400 });

  if (parentId !== null) {
    const parent = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { id: true, articleId: true, isHidden: true },
    });

    if (!parent)
      return NextResponse.json({ error: "Parent comment does not exist." }, { status: 400 });
    if (parent.isHidden)
      return NextResponse.json({ error: "Parent comment is hidden." }, { status: 400 });
    if (parent.articleId !== articleId) {
      return NextResponse.json(
        { error: "Parent comment does not belong to the article." },
        { status: 400 },
      );
    }
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

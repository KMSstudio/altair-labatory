// @/app/api/article/comment/update/route.ts

import { NextResponse } from "next/server";
import { Prisma } from "@labatory/db";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { buildCommentCtx } from "@/app/api/_util/createArticleCtx";

import { UpdateComment } from "@/repository/db/comment";
import type { Comment_Ctx, Comment_UpdateInput } from "@/types/article";

type Body = {
  commentId: string;
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

  const commentIdRaw = body.commentId?.toString().trim() ?? "";
  const content = body.content?.toString().trim() ?? "";

  if (!commentIdRaw)
    return NextResponse.json({ error: "Comment id is required." }, { status: 400 });

  if (!content) return NextResponse.json({ error: "Content is required." }, { status: 400 });

  let commentId: bigint;
  try {
    commentId = BigInt(commentIdRaw);
  } catch {
    return NextResponse.json({ error: "Invalid comment id." }, { status: 400 });
  }

  let ctx: Comment_Ctx;
  try {
    ctx = (await buildCommentCtx(session)) as Comment_Ctx;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal server error.";
    const status = msg === "User must be logged in." ? 401 : 400;
    return NextResponse.json({ error: msg }, { status });
  }

  const input: Comment_UpdateInput = {
    content,
  };

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

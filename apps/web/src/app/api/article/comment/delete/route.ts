// @/app/api/article/comment/delete/route.ts

import { NextResponse } from "next/server";
import { Prisma } from "@labatory/db";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { DeleteComment } from "@/repository/db/article/comment";
import { parseBigInt } from "@/app/api/_util/parse";
import { assertCommentAuthorOrAdmin, mapPermissionError } from "@/app/api/_util/assertPermission";

type Body = {
  commentId: string;
};

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

  try {
    const comment = await DeleteComment(commentId);
    return NextResponse.json({ ok: true, comment }, { status: 200 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Database error." }, { status: 400 });
    }

    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error." },
      { status: 500 },
    );
  }
}

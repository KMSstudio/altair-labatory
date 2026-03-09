// @/app/api/article/comment/delete/route.ts

import { NextResponse } from "next/server";
import { Prisma } from "@labatory/db";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { DeleteComment } from "@/repository/db/comment";

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

  const commentIdRaw = body.commentId?.toString().trim() ?? "";

  if (!commentIdRaw)
    return NextResponse.json({ error: "Comment id is required." }, { status: 400 });

  let commentId: bigint;
  try {
    commentId = BigInt(commentIdRaw);
  } catch {
    return NextResponse.json({ error: "Invalid comment id." }, { status: 400 });
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

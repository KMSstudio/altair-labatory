import { PostComment } from "@/app/article/actions";
import { authOptions } from "@/lib/auth";
import { getClientIp } from "@/util/tag.action";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session.user.id) {
    return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  }
  let body: { content: string; articleIdRaw: string; parentIdRaw: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  let articleId: bigint;
  try {
    articleId = BigInt(body.articleIdRaw);
  } catch {
    return NextResponse.json({ error: "Invalid board id." }, { status: 400 });
  }
  let parentId: bigint | null = null;
  if (body.parentIdRaw) {
    try {
      parentId = BigInt(body.parentIdRaw);
    } catch {
      return NextResponse.json({ error: "Invalid parent commemnt id." }, { status: 400 });
    }
  }
  const content = body.content;
  if (!content) {
    return NextResponse.json({ error: "Content is required." }, { status: 400 });
  }
  const authorIp = await getClientIp();
  if (!authorIp) {
    return NextResponse.json({ error: "Invalid client ip." }, { status: 400 });
  }
  try {
    const serializedComment = PostComment({ articleId, parentCommentId: parentId, content });
    return NextResponse.json({ ok: true, comment: serializedComment }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

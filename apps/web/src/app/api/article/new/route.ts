import { authOptions } from "@/lib/auth";
import { getClientIp } from "@/util/tag.action";
import { prisma, Prisma } from "@labatory/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type Body = {
  boardIdRaw: string;
  title: string;
  content: string;
  tagIdsRaw?: string[];
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "User must be logged in." }, { status: 401 });
  }
  if (!session.user.id) {
    return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  }

  let authorId: bigint;
  try {
    authorId = BigInt(session.user.id);
  } catch {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawBoardId = body.boardIdRaw?.toString().trim() ?? "";
  const title = body.title?.toString() ?? "";
  const content = body.content?.toString() ?? "";
  const tagIdsRaw = Array.isArray(body.tagIdsRaw) ? body.tagIdsRaw : [];

  if (!rawBoardId) {
    return NextResponse.json({ error: "Board id is required." }, { status: 400 });
  }
  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
  }

  let boardId: bigint;
  try {
    boardId = BigInt(rawBoardId);
  } catch {
    return NextResponse.json({ error: "Invalid board id." }, { status: 400 });
  }

  let tagIds: bigint[];
  try {
    tagIds = tagIdsRaw.map((tagId) => BigInt(tagId));
  } catch {
    return NextResponse.json({ error: "Invalid tag id." }, { status: 400 });
  }

  const clientIp = await getClientIp();
  if (!clientIp) {
    return NextResponse.json({ error: "Invalid client ip." }, { status: 400 });
  }

  try {
    const articleId = await prisma.$transaction(async (tx) => {
      const newArticle = await tx.article.create({
        data: {
          title,
          boardId,
          authorId,
          authorIp: clientIp,
          content,
        },
        select: { id: true },
      });

      if (tagIds.length) {
        const data: Prisma.ArticleTagCreateManyInput[] = tagIds.map((tagId) => ({
          articleId: newArticle.id,
          tagId,
        }));
        await tx.articleTag.createMany({ data });
      }

      return newArticle.id;
    });

    return NextResponse.json({ ok: true, articleId }, { status: 200 });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }

    if (e.code === "P2003") {
      return NextResponse.json({ error: "Invalid tag exists." }, { status: 400 });
    } else if (e.code === "P2002") {
      return NextResponse.json({ error: "Duplicate tags exist." }, { status: 400 });
    } else {
      return NextResponse.json({ error: "Internal database error." }, { status: 500 });
    }
  }
}

import { authOptions } from "@/lib/auth";
import { getClientIp } from "@/util/tag.action";
import { prisma, Prisma } from "@labatory/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type Body = {
  articleIdRaw: string;
  title: string;
  content: string;
  tagIdsRaw?: string[];
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session.user.id) {
    return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const newTitle = body.title?.toString() ?? "";
  const newContent = body.content?.toString() ?? "";
  const articleIdRaw = body.articleIdRaw?.toString() ?? "";

  if (!articleIdRaw) {
    return NextResponse.json({ error: "Article id is required." }, { status: 400 });
  }
  if (!newContent) {
    return NextResponse.json({ error: "Content is required." }, { status: 400 });
  }
  if (!newTitle) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  let articleId: bigint;
  try {
    articleId = BigInt(articleIdRaw);
  } catch {
    return NextResponse.json({ error: "Invalid article id." }, { status: 400 });
  }

  let sessionId: bigint;
  try {
    sessionId = BigInt(session.user.id);
  } catch {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }

  const tagIdsRaw = Array.isArray(body.tagIdsRaw) ? body.tagIdsRaw : [];
  let tagIds: bigint[];
  try {
    tagIds = tagIdsRaw.map((x) => BigInt(x));
  } catch {
    return NextResponse.json({ error: "Invalid tag id." }, { status: 400 });
  }

  const clientIp = await getClientIp();
  if (!clientIp) {
    return NextResponse.json({ error: "Invalid client ip." }, { status: 400 });
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: {
      authorId: true,
      title: true,
      content: true,
      authorIp: true,
    },
  });

  if (!article) {
    return NextResponse.json({ error: "Article does not exist." }, { status: 404 });
  }

  if (sessionId !== article.authorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.articleHistory.create({
        data: {
          articleId,
          oldTitle: article.title,
          oldContent: article.content,
          oldAuthorIp: article.authorIp,
        },
      });

      await tx.article.update({
        where: { id: articleId },
        data: {
          title: newTitle,
          content: newContent,
          authorIp: clientIp,
        },
      });

      await tx.articleTag.deleteMany({
        where: { articleId },
      });

      if (tagIds.length) {
        const data: Prisma.ArticleTagCreateManyInput[] = tagIds.map((tagId) => ({
          articleId,
          tagId,
        }));
        await tx.articleTag.createMany({ data });
      }
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }

    if (e.code === "P2003") {
      return NextResponse.json({ error: "Invalid reference." }, { status: 400 });
    } else if (e.code === "P2002") {
      return NextResponse.json({ error: "Duplicate tags exist." }, { status: 400 });
    } else {
      return NextResponse.json({ error: "Internal database error." }, { status: 500 });
    }
  }
}

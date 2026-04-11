// @/app/api/lab/[lab_id]/review/edit/[review_id]/route.ts

import { NextResponse } from "next/server";
import { Prisma } from "@labatory/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLabReviewCore, UpdateLabReviewCore } from "@/repository/db/labatory/lab-review";
import type { Labatory_Review_Update_Input } from "@/types/labatory";

type Body = {
  content: string;
  recommend: boolean;
  atmos: number;
  lectr: number;
  paper: number;
  salry: number;
  persn: number;
  guidance: number | null;
  meetFreq: number | null;
  externOk: number | null;
};

export async function PATCH(
  request: Request,
  { params }: { params: { lab_id: string; review_id: string } },
) {
  const { review_id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "User must be logged in." }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  let reviewId: bigint;
  try {
    reviewId = BigInt(review_id);
  } catch {
    return NextResponse.json({ error: "Invalid review id." }, { status: 400 });
  }

  const review = await getLabReviewCore({ reviewId });
  if (!review) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }
  if (review.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { content, recommend, atmos, lectr, paper, salry, persn, guidance, meetFreq, externOk } =
    body;
  if (typeof recommend !== "boolean") {
    return NextResponse.json({ error: "recommend is required." }, { status: 400 });
  }
  if ([atmos, lectr, paper, salry, persn].some((v) => !v || v < 1 || v > 5)) {
    return NextResponse.json({ error: "All score fields are required (1–5)." }, { status: 400 });
  }

  const input: Labatory_Review_Update_Input = {
    content,
    recommend,
    atmos,
    lectr,
    paper,
    salry,
    persn,
    guidance,
    meetFreq,
    externOk,
  };

  try {
    const updated = await UpdateLabReviewCore(reviewId, input);
    if (!updated) throw new Error();
    return NextResponse.json({ ok: true, review: updated }, { status: 200 });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal database error." }, { status: 500 });
  }
}

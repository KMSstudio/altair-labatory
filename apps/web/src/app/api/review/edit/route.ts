// @/app/api/review/edit/route.ts

import { NextResponse } from "next/server";
import { Prisma } from "@labatory/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLabReviewCore, UpdateLabReviewCore } from "@/repository/db/labatory/lab-review";
import type { LabReviewInput } from "@/types/labatory";
import {
  LABATORY_REVIEW_OPTIONAL_SCORE_FIELD_NAMES,
  LABATORY_REVIEW_REQUIRED_SCORE_FIELD_NAMES,
} from "@/util/labatory.constant";

type Body = LabReviewInput & {
  reviewId: string;
};

function parseBigInt(value: unknown) {
  try {
    return BigInt(value as string);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
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

  const reviewId = parseBigInt(body.reviewId);
  if (reviewId === null) {
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

  for (const name of LABATORY_REVIEW_REQUIRED_SCORE_FIELD_NAMES) {
    const v = body[name];
    if (typeof v !== "number" || !Number.isFinite(v) || v < 1 || v > 5) {
      return NextResponse.json(
        { error: `${name} must be a number between 1 and 5.` },
        { status: 400 },
      );
    }
  }

  for (const name of LABATORY_REVIEW_OPTIONAL_SCORE_FIELD_NAMES) {
    const v = body[name];
    if (v == null) {
      continue;
    }
    if (typeof v !== "number") {
      return NextResponse.json({ error: `${name} must be a number.` }, { status: 400 });
    }
    if (!Number.isFinite(v) || v < -3 || v > 3) {
      return NextResponse.json(
        { error: `${name} must be a number between -3 and 3.` },
        { status: 400 },
      );
    }
  }

  const input: LabReviewInput = {
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

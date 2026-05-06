// @/app/api/review/new/route.ts

import { NextResponse } from "next/server";
import { Prisma } from "@labatory/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreateLabReviewCore, getRecentReviewInLab } from "@/repository/db/labatory/lab-review";
import type { LabReviewInput } from "@/types/labatory";
import {
  LABATORY_REVIEW_OPTIONAL_SCORE_FIELD_NAMES,
  LABATORY_REVIEW_REQUIRED_SCORE_FIELD_NAMES,
} from "@/util/labatory.constant";

type Body = {
  labid: number;
  review: LabReviewInput;
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
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (session.user.role === "PI") {
    return NextResponse.json({ error: "PI_FORBIDDEN" }, { status: 403 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const labId = parseBigInt(body.labid);
  if (labId === null) {
    return NextResponse.json({ error: "Invalid lab id." }, { status: 400 });
  }
  if (!body.review || typeof body.review !== "object") {
    return NextResponse.json({ error: "review is required." }, { status: 400 });
  }

  const userId = BigInt(session.user.id);

  const recent = await getRecentReviewInLab(userId, labId);
  if (recent) {
    return NextResponse.json(
      { error: "TOO_SOON", recentReviewId: recent.id.toString() },
      { status: 429 },
    );
  }

  const { review } = body;
  const { content, recommend, atmos, lectr, paper, salry, persn, guidance, meetFreq, externOk } =
    review;

  if (typeof recommend !== "boolean") {
    return NextResponse.json({ error: "recommend is required." }, { status: 400 });
  }

  for (const name of LABATORY_REVIEW_REQUIRED_SCORE_FIELD_NAMES) {
    const v = review[name];
    if (typeof v !== "number" || !Number.isFinite(v) || v < 1 || v > 5) {
      return NextResponse.json(
        { error: `${name} must be a number between 1 and 5.` },
        { status: 400 },
      );
    }
  }

  for (const name of LABATORY_REVIEW_OPTIONAL_SCORE_FIELD_NAMES) {
    const v = review[name];
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
    const newReview = await CreateLabReviewCore(userId, labId, input);
    if (!newReview) throw new Error();
    return NextResponse.json({ ok: true, reviewId: newReview.id }, { status: 201 });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal database error." }, { status: 500 });
  }
}

// @/app/api/lab/[lab_id]/review/new/route.ts

import { NextResponse } from "next/server";
import { Prisma } from "@labatory/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreateLabReviewCore, getRecentReviewInLab } from "@/repository/db/labatory/lab-review";
import type { Labatory_Review_Input } from "@/types/labatory";

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

export async function POST(request: Request, { params }: { params: Promise<{ lab_id: string }> }) {
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

  const { lab_id } = await params;
  let labId: bigint;
  try {
    labId = BigInt(lab_id);
  } catch {
    return NextResponse.json({ error: "Invalid lab id." }, { status: 400 });
  }

  const userId = BigInt(session.user.id);

  const recent = await getRecentReviewInLab(userId, labId);
  if (recent) {
    return NextResponse.json(
      { error: "TOO_SOON", recentReviewId: recent.id.toString() },
      { status: 429 },
    );
  }

  const { content, recommend, atmos, lectr, paper, salry, persn, guidance, meetFreq, externOk } =
    body;

  if (typeof recommend !== "boolean") {
    return NextResponse.json({ error: "recommend is required." }, { status: 400 });
  }

  const requiredScores: [string, unknown][] = [
    ["atmos", atmos],
    ["lectr", lectr],
    ["paper", paper],
    ["salry", salry],
    ["persn", persn],
  ];
  for (const [name, v] of requiredScores) {
    if (typeof v !== "number" || !Number.isFinite(v) || v < 1 || v > 5) {
      return NextResponse.json(
        { error: `${name} must be a number between 1 and 5.` },
        { status: 400 },
      );
    }
  }
 
  const optionalScores: [string, unknown][] = [
    ["guidance", guidance],
    ["meetFreq", meetFreq],
    ["externOk", externOk],
  ];
  for (const [name, v] of optionalScores) {
    if (v !== undefined && v !== null) {
      if (typeof v !== "number" || !Number.isFinite(v) || v < -3 || v > 3) {
        return NextResponse.json(
          { error: `${name} must be a number between -3 and 3.` },
          { status: 400 },
        );
      }
    }
  }

  const input: Labatory_Review_Input = {
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
    const review = await CreateLabReviewCore(userId, labId, input);
    if (!review) throw new Error();
    return NextResponse.json({ ok: true, reviewId: review.id }, { status: 201 });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal database error." }, { status: 500 });
  }
}

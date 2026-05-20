// @/app/api/labaratory/merge/route.ts

import { mergeSubjectCore } from "@/repository/db/labatory/subject";
import { NextResponse } from "next/server";
import { Prisma } from "@labatory/db";
import { parseBigInt } from "@/app/api/_util/parse";

type Body = {
  sourceSubjectId: string;
  destinationSubjectId: string;
};

/**
 * POST /api/labaratory/merge
 *
 * Merges two subjects via JSON request body.
 * This endpoint moves LabSubject edges from `sourceSubjectId` to `destinationSubjectId`.
 *
 * Expected JSON:
 * - sourceSubjectId: string (required; integer string)
 * - destinationSubjectId: string (required; integer string)
 * - deactivateFrom: boolean (optional; defaults to true)
 *
 * @param request - Next.js Request object.
 * @returns JSON response with merge result summary or error.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const sourceSubjectIdRaw = body.sourceSubjectId ?? "";
  const destinationSubjectIdRaw = body.destinationSubjectId ?? "";
  if (!sourceSubjectIdRaw.trim())
    return NextResponse.json({ error: "Source subject id is required." }, { status: 400 });

  if (!destinationSubjectIdRaw.trim())
    return NextResponse.json({ error: "Destination subject id is required." }, { status: 400 });

  let sourceSubjectId: bigint;
  try {
    sourceSubjectId = parseBigInt(sourceSubjectIdRaw, "source subject id");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid parameter.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  let destinationSubjectId: bigint;
  try {
    destinationSubjectId = parseBigInt(destinationSubjectIdRaw, "destination subject id");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid parameter.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    const mergedSubject = await mergeSubjectCore({ sourceSubjectId, destinationSubjectId });
    return NextResponse.json({ ok: true, mergedSubject }, { status: 200 });
  } catch (e: unknown) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal database error." }, { status: 500 });
  }
}

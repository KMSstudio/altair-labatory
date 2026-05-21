// @/app/api/labaratory/subject/delete/route.ts

import { NextResponse } from "next/server";

import { deleteSubjectCore, getSubjectCore } from "@/repository/db/labatory/subject";
import { parseBigInt } from "@/app/api/_util/parse";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Body = {
  subjectId: string;
};

/**
 * Delete a subject
 *
 * This endpoint deletes subject
 *
 * Validation steps:
 * 1. Parse request body
 * 2. Convert ids to bigint
 * 3. Execute deletion
 *
 * @param request - HTTP request containing `{ subjectId }`
 *
 * @returns
 * - `200` `{ ok: true, subjectId }` on success
 * - `400` invalid parameters
 * - `401` if the user is not authenticated
 * - `500` internal server error
 */

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "User must be logged in." }, { status: 401 });
  }

  let subjectId: bigint;
  try {
    subjectId = parseBigInt(body.subjectId, "subject id");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid parameter.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const subject = await getSubjectCore({ subjectId });
  if (!subject) return NextResponse.json({ error: "Subject does not Exist." }, { status: 400 });

  try {
    await deleteSubjectCore({ subjectId });
    return NextResponse.json({ ok: true, subjectId: subjectId.toString() }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

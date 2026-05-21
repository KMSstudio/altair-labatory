// @/app/api/univ/delete/route.ts

import { NextResponse } from "next/server";

import { deleteUniversityCore, getUniversityCore } from "@/repository/db/labatory/university";
import { parseBigInt } from "@/app/api/_util/parse";

type Body = {
  universityId: string;
};

/**
 * Delete a university
 *
 * This endpoint deletes university
 *
 * Validation steps:
 * 1. Parse request body
 * 2. Convert ids to bigint
 * 3. Execute deletion
 *
 * @param request - HTTP request containing `{ universityId }`
 *
 * @returns
 * - `200` `{ ok: true, universityId }` on success
 * - `400` invalid parameters
 * - `500` internal server error
 */

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  let universityId: bigint;
  try {
    universityId = parseBigInt(body.universityId, "university id");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid parameter.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const university = await getUniversityCore({ universityId });
  if (!university)
    return NextResponse.json({ error: "University does not exist." }, { status: 400 });

  try {
    await deleteUniversityCore({ universityId });
    return NextResponse.json({ ok: true, universityId: universityId.toString() }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

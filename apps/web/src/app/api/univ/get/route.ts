// @/app/api/univ/get/route.ts

import { NextResponse } from "next/server";
import { parseBigInt } from "@/app/api/_util/parse";
import { getUniversityCore } from "@/repository/db/labatory/university";

type Params = {
  universityId: string;
};

/**
 * Get university that matches the id of request.
 *
 * @param request - HTTP request containing URL. URL contains universityId.
 * @returns
 * - `200` `{ ok: true, university }` on success
 * - `400` for invalid universityId
 * - `500` for internal server errors
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const param: Params = {
    universityId: searchParams.get("universityId") ?? "",
  };

  let universityId: bigint;
  try {
    universityId = parseBigInt(param.universityId, "university id");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid parameter.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  try {
    const university = await getUniversityCore({ universityId });
    return NextResponse.json({ ok: true, university }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

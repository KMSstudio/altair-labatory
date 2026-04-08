// @/app/api/labatory/get/university/route.ts

import { NextResponse } from "next/server";
import { parseBigInt } from "@/app/api/_util/parse";
import { getLabList } from "@/repository/db/labatory/labatory";

type Params = {
  universityId: string;
};

/**
 * Get labatorys that have university matches the id of request.
 *
 * @param request - HTTP request containing URL. URL contains universityId.
 * @returns
 * - `200` `{ ok: true, labs }` on success
 * - `400` for invaild universityId
 * - `500` for internal server errors
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const param: Params = {
    universityId: searchParams.get("universityId") ?? "",
  };
  if (!param.universityId)
    return NextResponse.json({ error: "university id is required." }, { status: 400 });

  let universityId: bigint;
  try {
    universityId = parseBigInt(param.universityId, "university id");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid parameter.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  try {
    const labs = await getLabList({ univId: universityId });
    return NextResponse.json({ ok: true, labs }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

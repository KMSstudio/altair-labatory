// @/app/api/labatory/get/subject/route.ts

import { NextResponse } from "next/server";
import { parseBigInt } from "@/app/api/_util/parse";
import { getLabList } from "@/repository/db/labatory/labatory";

type Params = {
  subjectId: string;
};

/**
 * Get labatorys that have subject matches the id of request.
 *
 * @param request - HTTP request containing URL. URL contains subjectId.
 * @returns
 * - `200` `{ ok: true, labs }` on success
 * - `400` for invaild subjectId
 * - `500` for internal server errors
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params: Params = {
    subjectId: searchParams.get("subjectId") ?? "",
  };
  if (!params.subjectId)
    return NextResponse.json({ error: "Subject id is required." }, { status: 400 });

  let subjectId: bigint;
  try {
    subjectId = parseBigInt(params.subjectId, "subject id");
  } catch (e) {
    return NextResponse.json({ error: `${e}` }, { status: 400 });
  }
  try {
    const labs = await getLabList({ subjId: subjectId });
    return NextResponse.json({ ok: true, labs }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

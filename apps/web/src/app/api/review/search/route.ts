// @/app/api/review/search/route.ts

import { NextResponse } from "next/server";
import { parseBigInt } from "@/app/api/_util/parse";
import { getLabReviews } from "@/repository/db/labatory/lab-review";

type Params = {
  labId: string;
};

/**
 * Get all reviews of specific lab.
 *
 * @param request - HTTP request containing URL. URL contains searchScope and query.
 * @param  labId - Lab id of target reviews' lab.
 * @returns
 * - `200` `{ ok: true, review }` on success
 * - `400` for Invalid lab id
 * - `500` for internal server errors
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params: Params = {
    labId: searchParams.get("query") ?? "",
  };
  const labIdRaw = params.labId.trim();
  if (!labIdRaw) return NextResponse.json({ error: "Lab id is required." }, { status: 400 });
  let labId: bigint;
  try {
    labId = parseBigInt(labIdRaw, "Lab Id");
  } catch (e) {
    return NextResponse.json({ error: `${e}` }, { status: 400 });
  }
  try {
    const reviews = getLabReviews({ labId });
    return NextResponse.json({ ok: true, reviews }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

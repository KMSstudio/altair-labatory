// @/app/api/labatory/get/route.ts

import { NextResponse } from "next/server";
import { parseBigInt } from "@/app/api/_util/parse";
import { getLabCore } from "@/repository/db/labatory/labatory";

type Params = {
  labId: string;
};

/**
 * Get labatory that matches the id of request.
 *
 * @param request - HTTP request containing URL. URL contains labId.
 * @returns
 * - `200` `{ ok: true, lab }` on success
 * - `400` for invaild labId
 * - `404` when lab does not exist.
 * - `500` for internal server errors
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params: Params = {
    labId: searchParams.get("labId") ?? "",
  };
  if (!params.labId) return NextResponse.json({ error: "Lab id is required." }, { status: 400 });

  let labId: bigint;
  try {
    labId = parseBigInt(params.labId, "lab id");
  } catch (e) {
    return NextResponse.json({ error: `${e}` }, { status: 400 });
  }
  try {
    const lab = await getLabCore({ id: labId });
    if (!lab) return NextResponse.json({ error: "Lab does not exist." }, { status: 404 });
    return NextResponse.json({ ok: true, lab }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

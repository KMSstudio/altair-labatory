// @/app/api/labaratory/pi/get/route.ts

import { NextResponse } from "next/server";
import { parseBigInt } from "@/app/api/_util/parse";
import { getPiCore } from "@/repository/db/labatory/pi";

type Params = {
  piId: string;
};

/**
 * Get pi that matches the id of request.
 *
 * @param request - HTTP request containing URL. URL contains piId.
 * @returns
 * - `200` `{ ok: true, pi }` on success
 * - `400` for invalid piId
 * - `500` for internal server errors
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const param: Params = {
    piId: searchParams.get("piId") ?? "",
  };

  let piId: bigint;
  try {
    piId = parseBigInt(param.piId, "pi id");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid parameter.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  try {
    const pi = await getPiCore({ piId });
    return NextResponse.json({ ok: true, pi }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

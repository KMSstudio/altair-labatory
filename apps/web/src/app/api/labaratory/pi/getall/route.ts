// @/app/api/labaratory/pi/getAll/route.ts

import { NextResponse } from "next/server";
import { getPiLists } from "@/repository/db/labatory/pi";

/**
 * Get all pi.
 *
 * @param request - HTTP request containing URL. URL contains piId.
 * @returns
 * - `200` `{ ok: true, pi }` on success
 * - `500` for internal server errors
 */

export async function GET() {
  try {
    const universities = await getPiLists({});
    return NextResponse.json({ ok: true, pi: universities }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

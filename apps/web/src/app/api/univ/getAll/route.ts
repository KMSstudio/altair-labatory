// @/app/api/univ/getAll/route.ts

import { NextResponse } from "next/server";
import { getUniversityLists } from "@/repository/db/labatory/university";

/**
 * Get all university.
 *
 * @param request - HTTP request containing URL. URL contains universityId.
 * @returns
 * - `200` `{ ok: true, university }` on success
 * - `500` for internal server errors
 */

export async function GET() {
  try {
    const universities = await getUniversityLists({});
    return NextResponse.json({ ok: true, university: universities }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

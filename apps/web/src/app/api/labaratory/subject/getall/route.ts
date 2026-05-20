// @/app/api/subject/getAll/route.ts

import { NextResponse } from "next/server";
import { getSubjects } from "@/repository/db/labatory/subject";

/**
 * Get all subject.
 *
 * @param request - HTTP request containing URL. URL contains subjectId.
 * @returns
 * - `200` `{ ok: true, subject }` on success
 * - `500` for internal server errors
 */

export async function GET() {
  try {
    const universities = await getSubjects({});
    return NextResponse.json({ ok: true, subject: universities }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

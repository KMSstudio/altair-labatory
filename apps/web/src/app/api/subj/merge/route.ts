import { NextResponse } from "next/server";

import {
  mergeSubjects,
  parseMergeInputFromJson,
} from "@/app/subj/subject.service";

/**
 * POST /api/subj/merge
 *
 * Merges two subjects via JSON request body.
 * This endpoint moves LabSubject edges from `fromId` to `toId`.
 *
 * Expected JSON:
 * - fromId: string (required; integer string)
 * - toId: string (required; integer string)
 * - deactivateFrom: boolean (optional; defaults to true)
 *
 * @param request - Next.js Request object.
 * @returns JSON response with merge result summary or error.
 */
export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const input = parseMergeInputFromJson(body);
    const result = await mergeSubjects(input);
    return NextResponse.json({ ok: true, result });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error.";
    const status = message.includes("required") || message.includes("must") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

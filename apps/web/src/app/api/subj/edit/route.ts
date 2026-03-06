import { NextResponse } from "next/server";

import {
  isUniqueViolation,
  parseUpdateInputFromJson,
  updateSubject,
} from "@/util/subj.action";

/**
 * Serializes a Subject record for JSON responses.
 *
 * @param s - Subject record from Prisma.
 * @returns Plain JSON-serializable object.
 */
const serializeSubject = (s: {
  id: bigint;
  nameKo: string;
  nameEn: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: s.id.toString(),
  nameKo: s.nameKo,
  nameEn: s.nameEn,
  description: s.description,
  isActive: s.isActive,
  createdAt: s.createdAt.toISOString(),
  updatedAt: s.updatedAt.toISOString(),
});

/**
 * POST /api/subj/edit
 *
 * Updates an existing subject via JSON request body (partial update).
 *
 * Expected JSON:
 * - id: string (required; integer string)
 * - nameKo/nameEn/description/isActive: optional fields to update
 *
 * @param request - Next.js Request object.
 * @returns JSON response with updated subject or error.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const { id, data } = parseUpdateInputFromJson(body);
    const updated = await updateSubject(id, data);
    return NextResponse.json({ ok: true, subject: serializeSubject(updated) });
  } catch (e: unknown) {
    if (isUniqueViolation(e)) {
      return NextResponse.json(
        { error: "Subject name must be unique (nameKo/nameEn)." },
        { status: 409 },
      );
    }
    const message = e instanceof Error ? e.message : "Internal server error.";
    const status = message.includes("required") || message.includes("must") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

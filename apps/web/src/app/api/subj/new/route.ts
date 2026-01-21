import { NextResponse } from "next/server";

import {
  createSubject,
  isUniqueViolation,
  parseCreateInputFromJson,
} from "@/app/subj/subject.service";

/**
 * Serializes a Subject record for JSON responses.
 *
 * Prisma returns `bigint` for ids; JSON does not support bigint, so we convert.
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
 * POST /api/subj/new
 *
 * Creates a new subject via JSON request body.
 *
 * Expected JSON:
 * - nameKo: string (required)
 * - nameEn: string (required)
 * - description: string | null (optional)
 * - isActive: boolean (optional; defaults to true)
 *
 * @param request - Next.js Request object.
 * @returns JSON response with created subject or error.
 */
export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const data = parseCreateInputFromJson(body);
    const created = await createSubject(data);
    return NextResponse.json({ ok: true, subject: serializeSubject(created) }, { status: 201 });
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

// @/app/api/subject/update/route.ts

import { NextResponse } from "next/server";
import { Prisma } from "@labatory/db";

import { getSubjectCore, getSubjects, updateSubjectCore } from "@/repository/db/labatory/subject";
import { parseBigInt } from "../../../_util/parse";

type Body = {
  subjectId: string;
  nameKo: string;
  nameEn: string;
  description: string | null;
  isActive?: boolean;
};

/**
 * Handle subject update requests.
 *
 * This API endpoint performs all **server-side validation** before
 * delegating the actual database write operation to `updateSubjectCore`.
 *
 * Validation performed here includes:
 * - Request body JSON parsing
 * - Required field check (`nameKo`)
 * - `subjectId` parsing (BigInt) via `parseBigInt`
 * - Subject existence check via `getSubjectCore`
 * - Duplicate name check via `getSubjects` (both Korean and English names
 *   must be unique among non-deleted subjects, excluding the current one)
 *
 * @param request - Incoming HTTP request containing a JSON body with
 *   `subjectId`, `nameKo`, and optional `nameEn`, `description`, and
 *   `isActive` (defaults to `true`).
 *
 * @returns
 * - `200` with `{ ok: true, subject }` if the update succeeds
 * - `400` for validation errors (invalid JSON, missing `nameKo`, invalid
 *   `subjectId`, non-existent subject, or a duplicate Korean/English name)
 * - `500` for internal or database errors
 */

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const nameKo = body.nameKo ?? "";
  const nameEn = body.nameEn ?? "";
  const description = body.description ?? "";
  const isActive = body.isActive ?? true;

  if (!nameKo.trim())
    return NextResponse.json({ error: "Korean name is required." }, { status: 400 });

  let subjectId: bigint;
  try {
    subjectId = parseBigInt(body.subjectId, "subject id");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid parameter.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const subject = await getSubjectCore({ subjectId });
  if (!subject) return NextResponse.json({ error: "Subject does not Exist." }, { status: 400 });

  const where = {
    isDeleted: false,
    id: { not: subjectId },
    OR: [{ nameKo }, { nameEn }],
  };
  const dup = await getSubjects({ where });

  if (dup[0]?.nameKo == nameKo) {
    return NextResponse.json({ error: "Duplicate Korean name is not allowed" }, { status: 400 });
  }
  if (dup[0]?.nameEn == nameEn)
    return NextResponse.json({ error: "Duplicate English name is not allowed" }, { status: 400 });

  try {
    const updatesubject = await updateSubjectCore({
      subjectId,
      input: { nameKo, nameEn, description, isActive },
    });
    if (!updatesubject) throw new Error();
    return NextResponse.json({ ok: true, subject: updatesubject }, { status: 200 });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal database error." }, { status: 500 });
  }
}

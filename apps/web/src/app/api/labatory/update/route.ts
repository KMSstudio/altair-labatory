// @/app/api/labatory/update/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma, Prisma } from "@labatory/db";
import { authOptions } from "@/lib/auth";

import { assertLabPiOrAdmin, mapPermissionError } from "@/app/api/_util/assertPermission";
import { parseBigInt } from "@/app/api/_util/parse";
import { updateLabTransaction } from "@/repository/db/labatory/labatory";
import type { Subject_Input } from "@/types/labatory";
import { createSubjectTransaction } from "@/repository/db/labatory/subject";

type Body = {
  labId: string;
  nameKo: string;
  nameEn: string;
  websiteUrl?: string;
  description?: string;
  universityId?: string;
  subjectIds?: string[];
  newSubjects?: Subject_Input[];
};

/**
 * Update a labatory.
 *
 * This endpoint updates a labatory if user is a PI who is linked to the labatory
 * or an ADMIN user.
 *
Validation performed here includes:
 * - User authentication via NextAuth session(only PI and ADMIN can create a new lab)
 * - Request body validation
 *
 * If validation succeeds, the endpoint calls `updateLabCore`
 * to create the lab and returns the updated labDTO.
 *
 * @param request - Incoming HTTP request containing a JSON body.
 *
 * @returns
 * - `200` with `{ ok: true, lab }` if update succeeds
 * - `400` for validation errors
 * - `401` if the user is not authenticated
 * - `403` permission denied
 * - `500` for internal or database errors
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  let labId: bigint;
  let userId: bigint;
  try {
    labId = parseBigInt(body.labId, "lab id");
    userId = parseBigInt(session.user.id, "user id");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid parameter.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    await assertLabPiOrAdmin(labId, userId, session.user.role);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal server error.";
    const { error, status } = mapPermissionError(msg);
    return NextResponse.json({ error }, { status });
  }

  const nameKo = body.nameKo;
  const nameEn = body.nameEn;
  const websiteUrl = body.websiteUrl?.trim() ?? "";
  const description = body.description ?? "";
  const trimmedUniversityIdRaw = body.universityId?.trim();
  const subjectIdRaw = Array.isArray(body.subjectIds) ? body.subjectIds : [];
  const newSubjectsRaw = body.newSubjects ?? [];

  let subjectIds: bigint[];
  try {
    subjectIds = subjectIdRaw.map((subjectId) => parseBigInt(subjectId.trim(), "subject id"));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid parameter.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  let universityId: bigint | null;
  try {
    universityId = trimmedUniversityIdRaw
      ? parseBigInt(trimmedUniversityIdRaw, "university id")
      : null;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid parameter.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    const updatedLab = await prisma.$transaction(async (tx) => {
      const newSubjectIds = (
        await Promise.all(
          newSubjectsRaw.map(async (newSubject) => {
            return await createSubjectTransaction({
              input: {
                nameKo: newSubject.nameKo,
                nameEn: newSubject.nameEn,
                description: newSubject.description,
              },
              db: tx,
            });
          }),
        )
      )
        .filter((newSubject) => newSubject !== null)
        .map((newSubject) => BigInt(newSubject.id));
      const addedSubjectIds = [...subjectIds, ...newSubjectIds];
      return await updateLabTransaction({
        labId,
        input: { nameKo, nameEn, websiteUrl, description, universityId },
        subjIds: addedSubjectIds,
        db: tx,
      });
    });
    if (!updatedLab) throw new Error();
    return NextResponse.json({ ok: true, lab: updatedLab }, { status: 200 });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
    if (e.code === "P2003")
      return NextResponse.json({ error: "Invalid reference." }, { status: 400 });
    if (e.code === "P2002")
      return NextResponse.json({ error: "Duplicate subjects exist." }, { status: 400 });
    return NextResponse.json({ error: "Internal database error." }, { status: 500 });
  }
}

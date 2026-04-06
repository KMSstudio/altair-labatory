// @/app/api/labatory/new/route.ts

import { NextResponse } from "next/server";
import { prisma, Prisma } from "@labatory/db";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { createLabTransaction } from "@/repository/db/labatory/labatory";
import { parseBigInt } from "@/app/api/_util/parse";
import type { Subject_Input } from "@/types/labatory";
import { createSubjectTransaction } from "@/repository/db/labatory/subject";

type Body = {
  nameKo: string;
  nameEn: string;
  websiteUrl?: string;
  description?: string;
  universityId?: string;
  subjectId?: string[];
  piId?: string;
  newSubjects?: Subject_Input[];
};

/**
 * Handle lab creation requests.
 *
 * This API endpoint performs all **server-side validation** before
 * delegating the actual database write operation to `CreateArticleCore`.
 *
 * Validation performed here includes:
 * - User authentication via NextAuth session(only PI and ADMIN can create a new lab)
 * - Request body validation
 *
 * If validation succeeds, the endpoint calls `createLabCore`
 * to create the lab and returns the created labDTO.
 *
 * @param request - Incoming HTTP request containing a JSON body.
 *
 * @returns
 * - `200` with `{ ok: true, lab }` if creation succeeds
 * - `400` for validation errors
 * - `401` if the user is not authenticated
 * - `500` for internal or database errors
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "PI") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let piId: bigint | null;
  if (role === "PI") {
    let userId: bigint;
    try {
      userId = parseBigInt(session.user.id, "user id");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid parameter.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const pi = await prisma.pI.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        labId: true,
      },
    });
    if (!pi || pi.labId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    piId = pi.id;
  } else {
    const piIdRaw = body.piId ?? null;
    try {
      piId = piIdRaw ? parseBigInt(piIdRaw, "pi id") : null;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid parameter.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    if (piId) {
      const pi = await prisma.pI.findUnique({
        where: {
          id: piId,
        },
        select: {
          id: true,
          labId: true,
        },
      });
      if (!pi || pi.labId) return NextResponse.json({ error: "Invaild PI" }, { status: 403 });
    }
  }

  const nameKo = body.nameKo;
  const nameEn = body.nameEn;
  const websiteUrl = body.websiteUrl?.trim() ?? "";
  const description = body.description ?? "";
  const UniversityIdRaw = body.universityId ?? null;
  const subjectIdRaw = Array.isArray(body.subjectId) ? body.subjectId : [];
  const newSubjectsRaw = body.newSubjects ?? [];

  let subjectIds: bigint[];
  try {
    subjectIds = subjectIdRaw.map((subjectId) => parseBigInt(subjectId, "subject id"));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid parameter.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  let universityId: bigint | null;
  try {
    universityId = UniversityIdRaw ? parseBigInt(UniversityIdRaw, "university id") : null;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid parameter.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  try {
    const newLab = await prisma.$transaction(async (tx) => {
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
      ).map((newSubject) => {
        if (newSubject === null) throw new Error("Fail to create subjects.");
        return BigInt(newSubject.id);
      });
      const addedSubjectIds = [...subjectIds, ...newSubjectIds];
      return await createLabTransaction({
        input: { nameKo, nameEn, websiteUrl, description, universityId, piId },
        subjIds: addedSubjectIds,
        db: tx,
      });
    });
    if (!newLab) throw new Error();
    return NextResponse.json({ ok: true, lab: newLab }, { status: 200 });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
    if (e.code === "P2003")
      return NextResponse.json({ error: "Invaild reference." }, { status: 400 });
    if (e.code === "P2002")
      return NextResponse.json({ error: "Duplicate subjects exist." }, { status: 400 });
    return NextResponse.json({ error: "Internal database error." }, { status: 500 });
  }
}

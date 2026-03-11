import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@labatory/db";
import { authOptions } from "@/lib/auth";
import { SerializeLab } from "@/repository/serialize/SerializeLab";

import {
  isKnownRequestError,
  parseLabUpsertInputFromJson,
  with_transaction,
  create_lab,
  create_subject_for_lab,
} from "@/util/lab.action";

/**
 * POST /api/lab/new
 *
 * Authorization:
 * - ADMIN: allowed
 * - PI: allowed, but the PI is automatically bound to the created lab (PI.labId)
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "PI") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  let data;
  try {
    data = parseLabUpsertInputFromJson(body);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Invalid input";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const userId = BigInt(session.user.id);
  const pi =
    role === "PI"
      ? await prisma.pI.findUnique({ where: { userId }, select: { id: true, labId: true } })
      : null;

  if (role === "PI") {
    if (!pi) {
      return NextResponse.json({ error: "PI profile not found" }, { status: 400 });
    }
    if (pi.labId) {
      return NextResponse.json({ error: "This PI is already linked to a lab" }, { status: 409 });
    }
  }

  try {
    const createdId = await with_transaction(async (tx) => {
      const lab = await create_lab(
        {
          nameKo: data.nameKo,
          nameEn: data.nameEn,
          websiteUrl: data.websiteUrl,
          description: data.description,
          universityId: data.universityId,
        },
        tx,
      );

      const createdSubject = data.newSubject
        ? await create_subject_for_lab(data.newSubject, tx)
        : null;
      const subjectIds = [...data.subjectIds, ...(createdSubject ? [createdSubject.id] : [])];

      if (subjectIds.length) {
        await tx.labSubject.createMany({
          data: subjectIds.map((subjectId) => ({ labId: lab.id, subjectId })),
          skipDuplicates: true,
        });
      }

      if (role === "PI" && pi) {
        await tx.pI.update({ where: { id: pi.id }, data: { labId: lab.id } });
      }
      return lab.id;
    });

    const lab = await prisma.lab.findUnique({
      where: { id: createdId },
      include: {
        subjects: {
          include: { subject: { select: { nameKo: true, nameEn: true, isActive: true } } },
        },
      },
    });

    if (!lab) {
      return NextResponse.json({ error: "Created lab not found" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, lab: SerializeLab(lab) }, { status: 201 });
  } catch (e: unknown) {
    // Unique constraint violations: subject name, PI.labId, etc.
    if (isKnownRequestError(e) && e.code === "P2002") {
      return NextResponse.json({ error: "Unique constraint violation" }, { status: 409 });
    }
    const message = e instanceof Error ? e.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { Prisma, prisma } from "@labatory/db";
import { authOptions } from "@/lib/auth";

import { SerializeLab } from "@/repository/serialize/SerializeLab";
import {
  isKnownRequestError,
  parseLabUpdateInputFromJson,
  with_transaction,
  update_lab,
  create_subject_for_lab,
  replace_lab_subject_links,
} from "@/util/lab.action";

const requireLabEditor = async (labId: bigint, user: { id: string; role: string }) => {
  if (user.role === "ADMIN") return;

  if (user.role === "PI") {
    const userId = BigInt(user.id);
    const pi = await prisma.pI.findUnique({ where: { userId }, select: { labId: true } });
    if (!pi?.labId || pi.labId !== labId) {
      throw new Error("Forbidden");
    }
    return;
  }

  throw new Error("Forbidden");
};

/**
 * POST /api/lab/edit
 *
 * Authorization:
 * - ADMIN: allowed for any lab
 * - PI: allowed only for the lab linked to that PI (PI.labId)
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  let parsed: { id: bigint; data: ReturnType<typeof parseLabUpdateInputFromJson>["data"] };
  try {
    parsed = parseLabUpdateInputFromJson(body);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Invalid input";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    await requireLabEditor(parsed.id, session.user);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await with_transaction(async (tx: Prisma.TransactionClient) => {
      await update_lab(
        parsed.id,
        {
          nameKo: parsed.data.nameKo,
          nameEn: parsed.data.nameEn,
          websiteUrl: parsed.data.websiteUrl,
          description: parsed.data.description,
          universityId: parsed.data.universityId,
        },
        tx,
      );

      const createdSubject = parsed.data.newSubject
        ? await create_subject_for_lab(parsed.data.newSubject, tx)
        : null;

      const nextSubjectIds = [
        ...parsed.data.subjectIds,
        ...(createdSubject ? [createdSubject.id] : []),
      ];

      await replace_lab_subject_links(parsed.id, nextSubjectIds, tx);
    });

    const lab = await prisma.lab.findUnique({
      where: { id: parsed.id },
      include: {
        subjects: {
          include: {
            subject: { select: { nameKo: true, nameEn: true, isActive: true } },
          },
        },
      },
    });
    if (!lab) {
      return NextResponse.json({ error: "Lab not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, lab: SerializeLab(lab) }, { status: 200 });
  } catch (e: unknown) {
    if (isKnownRequestError(e) && e.code === "P2025") {
      return NextResponse.json({ error: "Lab not found" }, { status: 404 });
    }
    if (isKnownRequestError(e) && e.code === "P2002") {
      return NextResponse.json({ error: "Unique constraint violation" }, { status: 409 });
    }

    const message = e instanceof Error ? e.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { prisma } from "@labatory/db";
import { Prisma } from "@labatory/db";
import { authOptions } from "@/lib/auth";

import {
  type LabUpsertInput,
  extractLabDraftFromFormData,
  parseId,
  parseLabUpsertInputFromFormData,
  isKnownRequestError,
  getUniqueTargets,
  with_transaction,
  create_lab,
  update_lab,
  create_subject_for_lab,
  replace_lab_subject_links,
} from "@/util/lab.action";
import { CreateTag, UpdateTag } from "@/repository/db/tag";

export async function getLabs(params: { q: string; scope: "all" | "lab" | "univ" | "subj" }) {
  const where: Prisma.LabWhereInput = {};

  const q = params.q.trim();
  if (q.length) {
    const query = (value: string) =>
      ({ contains: value, mode: Prisma.QueryMode.insensitive }) as const;
    const orGroups = {
      lab: [{ nameKo: query(q) }, { nameEn: query(q) }],
      univ: [{ university: { nameKo: query(q) } }, { university: { nameEn: query(q) } }],
      subj: [
        {
          subjects: {
            some: {
              subject: {
                OR: [{ nameKo: query(q) }, { nameEn: query(q) }],
              },
            },
          },
        },
      ],
    } satisfies Record<"lab" | "univ" | "subj", Prisma.LabWhereInput["OR"]>;
    const scope = params.scope as keyof typeof orGroups | undefined;
    where.OR =
      scope && scope in orGroups
        ? orGroups[scope]
        : [...orGroups.lab, ...orGroups.univ, ...orGroups.subj];
  }

  return prisma.lab.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      nameKo: true,
      nameEn: true,
      websiteUrl: true,
      description: true,
      createdAt: true,
      university: { select: { id: true, nameKo: true, nameEn: true } },
      subjects: {
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          subject: { select: { id: true, nameKo: true, nameEn: true } },
        },
      },
    },
  });
}

type LabDraft = ReturnType<typeof extractLabDraftFromFormData>;

const dbFieldToFormField = (dbField: string): string => {
  if (dbField === "nameKo" || dbField === "name_ko" || dbField.includes("nameKo")) {
    return "newSubjectNameKo";
  }
  if (dbField === "nameEn" || dbField === "name_en" || dbField.includes("nameEn")) {
    return "newSubjectNameEn";
  }
  return dbField;
};

const buildQuery = (
  draft: Partial<LabDraft>,
  error: string,
  fields?: string[],
  message?: string,
): string => {
  const qs = new URLSearchParams();
  qs.set("error", error);
  if (fields?.length) qs.set("fields", fields.join(","));
  if (message) qs.set("message", message);

  const setIf = (k: keyof LabDraft, v: unknown) => {
    if (typeof v === "string") qs.set(k, v);
  };

  setIf("nameKo", draft.nameKo);
  setIf("nameEn", draft.nameEn);
  setIf("websiteUrl", draft.websiteUrl);
  setIf("description", draft.description);
  setIf("universityId", draft.universityId);
  setIf("subjectIds", draft.subjectIds);
  setIf("newSubjectNameKo", draft.newSubjectNameKo);
  setIf("newSubjectNameEn", draft.newSubjectNameEn);
  setIf("newSubjectDescription", draft.newSubjectDescription);

  return qs.toString();
};

const requireLabEditor = async (labId: bigint) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/");

  if (session.user.role === "ADMIN") {
    return { session, mode: "ADMIN" as const, piId: null as bigint | null };
  }

  if (session.user.role === "PI") {
    const userId = BigInt(session.user.id);
    const pi = await prisma.pI.findUnique({ where: { userId }, select: { id: true, labId: true } });
    if (!pi?.labId || pi.labId !== labId) {
      redirect("/");
    }
    return { session, mode: "PI" as const, piId: pi.id };
  }

  redirect("/");
};

/**
 * Server Action: Create a new Lab.
 *
 * Authorization:
 * - ADMIN: allowed
 * - PI: allowed, but PI is automatically bound to the created lab
 */
export async function createLab(formData: FormData) {
  const draft = extractLabDraftFromFormData(formData);

  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/");
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "PI") redirect("/");

  let data: LabUpsertInput;
  try {
    data = parseLabUpsertInputFromFormData(formData);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid input";
    redirect(`/lab/new?${buildQuery(draft, "validation", undefined, message)}`);
  }

  // Preload PI context (needed only for PI role)
  const sessionUserId = BigInt(session.user.id);
  const pi =
    role === "PI"
      ? await prisma.pI.findUnique({
          where: { userId: sessionUserId },
          select: { id: true, labId: true },
        })
      : null;

  if (role === "PI") {
    if (!pi) {
      redirect(`/lab/new?${buildQuery(draft, "validation", undefined, "PI profile not found")}`);
    }
    if (pi.labId) {
      redirect(
        `/lab/new?${buildQuery(draft, "validation", undefined, "This PI is already linked to a lab")}`,
      );
    }
  }

  try {
    const created = await with_transaction(async (tx) => {
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
      await CreateTag({ kind: "LAB", id: lab.id, db: tx });
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
      if (createdSubject) {
        await CreateTag({ kind: "SUBJECT", id: createdSubject.id, db: tx });
      }
      if (role === "PI" && pi) {
        await tx.pI.update({ where: { id: pi.id }, data: { labId: lab.id } });
      }
      return lab;
    });

    revalidatePath("/lab");
    revalidatePath(`/lab/${created.id.toString()}`);
    redirect(`/lab/${created.id.toString()}`);
  } catch (e) {
    // New subject unique constraint (subjects_name_ko_key / subjects_name_en_key)
    if (isKnownRequestError(e) && e.code === "P2002") {
      const fields = getUniqueTargets(e).map(dbFieldToFormField);
      redirect(`/lab/new?${buildQuery(draft, "unique", fields)}`);
    }
    throw e;
  }
}

/**
 * Server Action: Update an existing Lab.
 *
 * Authorization:
 * - ADMIN: allowed for any lab
 * - PI: allowed only when the PI is linked to the target lab
 */
export async function updateLab(formData: FormData) {
  const idRaw = formData.get("id");
  let labId: bigint;
  try {
    labId = parseId(idRaw, "id");
  } catch {
    redirect(`/lab?error=validation&message=${encodeURIComponent("Invalid lab id")}`);
  }

  await requireLabEditor(labId);

  const draft = extractLabDraftFromFormData(formData);
  let data: LabUpsertInput;
  try {
    data = parseLabUpsertInputFromFormData(formData);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid input";
    redirect(
      `/lab/edit/${labId.toString()}?${buildQuery(draft, "validation", undefined, message)}`,
    );
  }

  try {
    await with_transaction(async (tx) => {
      const updatedLab = await update_lab(
        labId,
        {
          nameKo: data.nameKo,
          nameEn: data.nameEn,
          websiteUrl: data.websiteUrl,
          description: data.description,
          universityId: data.universityId,
        },
        tx,
      );
      const tag = await tx.tag.findUnique({
        where: { labId: updatedLab.id },
        select: { id: true },
      });
      if (tag) {
        await UpdateTag({ tagId: tag.id, db: tx });
      } else {
        await CreateTag({ kind: "LAB", id: updatedLab.id, db: tx });
      }
      const createdSubject = data.newSubject
        ? await create_subject_for_lab(data.newSubject, tx)
        : null;
      const nextSubjectIds = [...data.subjectIds, ...(createdSubject ? [createdSubject.id] : [])];
      await replace_lab_subject_links(labId, nextSubjectIds, tx);
      if (createdSubject) {
        await CreateTag({ kind: "SUBJECT", id: createdSubject.id, db: tx });
      }
    });

    const target = `/lab/${labId.toString()}`;
    revalidatePath("/lab");
    revalidatePath(target);
    revalidatePath(`/lab/edit/${labId.toString()}`);
    redirect(target);
  } catch (e) {
    if (isKnownRequestError(e) && e.code === "P2002") {
      const fields = getUniqueTargets(e).map(dbFieldToFormField);
      redirect(`/lab/edit/${labId.toString()}?${buildQuery(draft, "unique", fields)}`);
    }
    if (isKnownRequestError(e) && e.code === "P2025") {
      redirect(`/lab?error=notfound&message=${encodeURIComponent("Lab not found")}`);
    }
    throw e;
  }
}

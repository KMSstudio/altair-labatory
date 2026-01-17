"use server";

import { prisma } from "@labatory/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type SubjectInput = {
  nameKo: string;
  nameEn: string;
  description: string | null;
  isActive: boolean;
};

const normalizeText = (value: FormDataEntryValue | null): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const requireText = (value: FormDataEntryValue | null, field: string): string => {
  const normalized = normalizeText(value);
  if (!normalized) {
    throw new Error(`${field} is required`);
  }
  return normalized;
};

const parseSubjectInput = (formData: FormData): SubjectInput => {
  const isActiveRaw = formData.get("isActive");
  const isActive = isActiveRaw === null ? true : isActiveRaw === "on" || isActiveRaw === "true";

  return {
    nameKo: requireText(formData.get("nameKo"), "Korean name"),
    nameEn: requireText(formData.get("nameEn"), "English name"),
    description: normalizeText(formData.get("description")),
    isActive,
  };
};

export async function createSubject(formData: FormData) {
  const data = parseSubjectInput(formData);
  const created = await prisma.subject.create({ data });
  revalidatePath("/subj/list");
  redirect(`/subj/${created.id.toString()}`);
}

export async function updateSubject(formData: FormData) {
  const idValue = formData.get("id");
  if (typeof idValue !== "string") {
    throw new Error("Missing subject id");
  }
  const id = BigInt(idValue);
  const data = parseSubjectInput(formData);

  await prisma.subject.update({
    where: { id },
    data,
  });

  const target = `/subj/${idValue}`;
  revalidatePath("/subj/list");
  revalidatePath(target);
  redirect(target);
}

export async function mergeSubjects(formData: FormData) {
  const fromValue = formData.get("fromId");
  const toValue = formData.get("toId");

  if (typeof fromValue !== "string" || typeof toValue !== "string") {
    throw new Error("fromId and toId are required");
  }

  const fromId = BigInt(fromValue);
  const toId = BigInt(toValue);

  if (fromId === toId) {
    throw new Error("fromId and toId cannot be the same");
  }

  await prisma.$transaction(async (tx) => {
    const [from, to] = await Promise.all([
      tx.subject.findUnique({ where: { id: fromId } }),
      tx.subject.findUnique({ where: { id: toId } }),
    ]);

    if (!from || !to) {
      throw new Error("Subject not found");
    }

    const links = await tx.labSubject.findMany({
      where: { subjectId: fromId },
      select: { labId: true },
    });

    if (links.length) {
      await tx.labSubject.createMany({
        data: links.map((l) => ({ labId: l.labId, subjectId: toId })),
        skipDuplicates: true,
      });

      await tx.labSubject.deleteMany({ where: { subjectId: fromId } });
    }

    await tx.subject.update({ where: { id: fromId }, data: { isActive: false } });
  });

  revalidatePath("/subj/list");
  revalidatePath(`/subj/${fromValue}`);
  revalidatePath(`/subj/${toValue}`);
  redirect(`/subj/${toValue}`);
}

export async function updateSubjectLabLinks(formData: FormData) {
  const subjectValue = formData.get("subjectId");
  if (typeof subjectValue !== "string") {
    throw new Error("Missing subjectId");
  }
  const subjectId = BigInt(subjectValue);

  const selectedLabIds = formData
    .getAll("labIds")
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((v) => BigInt(v));

  await prisma.$transaction(async (tx) => {
    const current = await tx.labSubject.findMany({
      where: { subjectId },
      select: { labId: true },
    });

    const currentSet = new Set(current.map((x) => x.labId.toString()));
    const nextSet = new Set(selectedLabIds.map((x) => x.toString()));

    const toAdd = selectedLabIds.filter((id) => !currentSet.has(id.toString()));

    const toRemove = current
      .map((x) => x.labId)
      .filter((id) => !nextSet.has(id.toString()));

    if (toRemove.length) {
      await tx.labSubject.deleteMany({
        where: {
          subjectId,
          labId: { in: toRemove },
        },
      });
    }

    if (toAdd.length) {
      await tx.labSubject.createMany({
        data: toAdd.map((labId) => ({ labId, subjectId })),
        skipDuplicates: true,
      });
    }
  });

  const target = `/subj/${subjectValue}`;
  revalidatePath("/subj/list");
  revalidatePath(target);
  redirect(target);
}

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
  // checkbox는 체크 시 "on"인 경우가 많음
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

    // LabSubject 링크를 from -> to 로 이동
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

    // 병합 소스는 soft-delete(비활성화)
    await tx.subject.update({ where: { id: fromId }, data: { isActive: false } });
  });

  revalidatePath("/subj/list");
  revalidatePath(`/subj/${fromValue}`);
  revalidatePath(`/subj/${toValue}`);
  redirect(`/subj/${toValue}`);
}

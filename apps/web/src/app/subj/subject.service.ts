import "server-only";

import { prisma } from "@labatory/db";
import { Prisma } from "@prisma/client";

export type SubjectCreateInput = {
  nameKo: string;
  nameEn: string;
  description: string | null;
  isActive: boolean;
};

export type SubjectMergeInput = {
  fromId: bigint;
  toId: bigint;
  deactivateFrom: boolean;
};

const normalizeText = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const requireText = (value: unknown, field: string): string => {
  const normalized = normalizeText(value);
  if (!normalized) throw new Error(`${field} is required`);
  return normalized;
};

const parseId = (raw: unknown, field: string): bigint => {
  if (typeof raw !== "string") throw new Error(`${field} must be a string`);
  const trimmed = raw.trim();
  if (!trimmed) throw new Error(`${field} is required`);
  try {
    return BigInt(trimmed);
  } catch {
    throw new Error(`${field} must be an integer string`);
  }
};

const parseCheckbox = (raw: unknown, defaultValue: boolean): boolean => {
  if (typeof raw !== "string") return defaultValue;
  return raw === "on" || raw === "true" || raw === "1";
};

export const parseCreateInputFromFormData = (formData: FormData): SubjectCreateInput => {
  return {
    nameKo: requireText(formData.get("nameKo"), "nameKo"),
    nameEn: requireText(formData.get("nameEn"), "nameEn"),
    description: normalizeText(formData.get("description")),
    isActive: parseCheckbox(formData.get("isActive"), true),
  };
};

export const parseUpdateInputFromFormData = (
  formData: FormData,
): { id: bigint; data: SubjectCreateInput } => {
  const idValue = formData.get("id");
  const id = parseId(idValue, "id");
  const data = parseCreateInputFromFormData(formData);
  return { id, data };
};

export const parseMergeInputFromFormData = (formData: FormData): SubjectMergeInput => {
  const fromId = parseId(formData.get("fromId"), "fromId");
  const toId = parseId(formData.get("toId"), "toId");
  if (fromId === toId) throw new Error("fromId and toId must be different");

  return {
    fromId,
    toId,
    deactivateFrom: parseCheckbox(formData.get("deactivateFrom"), true),
  };
};

export const parseCreateInputFromJson = (body: any): SubjectCreateInput => {
  return {
    nameKo: requireText(body?.nameKo, "nameKo"),
    nameEn: requireText(body?.nameEn, "nameEn"),
    description: normalizeText(body?.description),
    isActive: typeof body?.isActive === "boolean" ? body.isActive : true,
  };
};

export const parseUpdateInputFromJson = (
  body: any,
): { id: bigint; data: Partial<SubjectCreateInput> } => {
  const id = parseId(body?.id, "id");

  const data: Partial<SubjectCreateInput> = {};

  if (body?.nameKo !== undefined) data.nameKo = requireText(body.nameKo, "nameKo");
  if (body?.nameEn !== undefined) data.nameEn = requireText(body.nameEn, "nameEn");
  if (body?.description !== undefined) data.description = normalizeText(body.description);
  if (body?.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") throw new Error("isActive must be boolean");
    data.isActive = body.isActive;
  }

  if (Object.keys(data).length === 0) throw new Error("No fields to update");
  return { id, data };
};

export const parseMergeInputFromJson = (body: any): SubjectMergeInput => {
  const fromId = parseId(body?.fromId, "fromId");
  const toId = parseId(body?.toId, "toId");
  if (fromId === toId) throw new Error("fromId and toId must be different");

  return {
    fromId,
    toId,
    deactivateFrom: typeof body?.deactivateFrom === "boolean" ? body.deactivateFrom : true,
  };
};

export async function createSubject(data: SubjectCreateInput) {
  return prisma.subject.create({ data });
}

export async function updateSubject(id: bigint, data: Partial<SubjectCreateInput>) {
  return prisma.subject.update({ where: { id }, data });
}

export async function mergeSubjects(input: SubjectMergeInput) {
  const { fromId, toId, deactivateFrom } = input;

  return prisma.$transaction(async (tx) => {
    const from = await tx.subject.findUnique({ where: { id: fromId } });
    const to = await tx.subject.findUnique({ where: { id: toId } });

    if (!from) throw new Error("from subject not found");
    if (!to) throw new Error("to subject not found");

    // Move lab-subject edges from -> to
    const edges = await tx.labSubject.findMany({
      where: { subjectId: fromId },
      select: { labId: true },
    });

    if (edges.length) {
      await tx.labSubject.createMany({
        data: edges.map((e) => ({ labId: e.labId, subjectId: toId })),
        skipDuplicates: true,
      });
    }

    await tx.labSubject.deleteMany({ where: { subjectId: fromId } });

    if (deactivateFrom) {
      await tx.subject.update({ where: { id: fromId }, data: { isActive: false } });
    }

    if (!to.description && from.description) {
      await tx.subject.update({ where: { id: toId }, data: { description: from.description } });
    }

    return { ok: true, mergedFrom: fromId, mergedTo: toId };
  });
}

export const isUniqueViolation = (e: unknown) =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";

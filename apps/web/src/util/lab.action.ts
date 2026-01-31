import { prisma } from "@labatory/db";
import { Prisma } from "@prisma/client";

export type LabUpsertInput = {
  nameKo: string;
  nameEn: string | null;
  websiteUrl: string | null;
  description: string | null;
  universityId: bigint | null;
  subjectIds: bigint[];
  newSubject: {
    nameKo: string;
    nameEn: string;
    description: string | null;
  } | null;
};

/**
 * Normalizes an arbitrary input into a trimmed string.
 */
const normalizeText = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

/**
 * Reads a required text field.
 */
const requireText = (value: unknown, field: string): string => {
  const normalized = normalizeText(value);
  if (!normalized) throw new Error(`${field} is required`);
  return normalized;
};

/**
 * Parses an integer id represented as a string into `bigint`.
 */
export const parseId = (raw: unknown, field: string): bigint => {
  if (typeof raw !== "string") throw new Error(`${field} must be a string`);
  const trimmed = raw.trim();
  if (!trimmed) throw new Error(`${field} is required`);
  try {
    return BigInt(trimmed);
  } catch {
    throw new Error(`${field} must be an integer string`);
  }
};

/**
 * Parses an optional id.
 */
const parseOptionalId = (raw: unknown): bigint | null => {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== "string") {
    // JSON payloads may explicitly pass null; any non-string is invalid.
    throw new Error("universityId must be an integer string");
  }
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return BigInt(trimmed);
  } catch {
    throw new Error("universityId must be an integer string");
  }
};

const isValidUrlOrNull = (raw: unknown): string | null => {
  const v = normalizeText(raw);
  if (!v) return null;
  try {
    // Accept http/https and other absolute URLs.
    new URL(v);
    return v;
  } catch {
    throw new Error("websiteUrl must be a valid URL");
  }
};

/**
 * Parses subject ids from FormData entries.
 */
const parseSubjectIdsFromFormData = (formData: FormData, fieldName: string): bigint[] => {
  const raw = formData
    .getAll(fieldName)
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  const ids: bigint[] = [];
  for (const v of raw) {
    ids.push(parseId(v, fieldName));
  }
  // Deduplicate
  return Array.from(new Set(ids.map((x) => x.toString()))).map((s) => BigInt(s));
};

/**
 * Parses subject ids from JSON.
 */
const parseSubjectIdsFromJson = (raw: unknown, fieldName: string): bigint[] => {
  if (raw === null || raw === undefined) return [];
  if (!Array.isArray(raw)) throw new Error(`${fieldName} must be an array of integer strings`);
  const ids: bigint[] = [];
  for (const v of raw) {
    if (typeof v !== "string") throw new Error(`${fieldName} must be an array of integer strings`);
    const trimmed = v.trim();
    if (!trimmed) continue;
    ids.push(parseId(trimmed, fieldName));
  }
  return Array.from(new Set(ids.map((x) => x.toString()))).map((s) => BigInt(s));
};

const parseNewSubjectFromJson = (
  raw: unknown,
): { nameKo: string; nameEn: string; description: string | null } | null => {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== "object") throw new Error("newSubject must be an object or null");
  const b = raw as Record<string, unknown>;
  const nameKo = normalizeText(b.nameKo);
  const nameEn = normalizeText(b.nameEn);
  const description = normalizeText(b.description);

  const hasAny = !!nameKo || !!nameEn || !!description;
  if (!hasAny) return null;
  return {
    nameKo: requireText(nameKo, "newSubject.nameKo"),
    nameEn: requireText(nameEn, "newSubject.nameEn"),
    description,
  };
};

/**
 * Parses a Lab create/update payload from JSON.
 *
 * Expected JSON:
 * - nameKo: string (required)
 * - nameEn: string | null (optional)
 * - websiteUrl: string | null (optional)
 * - description: string | null (optional)
 * - universityId: string | null (optional; bigint string)
 * - subjectIds: string[] (optional; bigint strings)
 * - newSubject: { nameKo, nameEn, description? } | null (optional)
 */
export const parseLabUpsertInputFromJson = (body: unknown): LabUpsertInput => {
  if (body === null || typeof body !== "object") throw new Error("Body must be an object");
  const b = body as Record<string, unknown>;

  const nameKo = requireText(b.nameKo, "nameKo");
  const nameEn = normalizeText(b.nameEn);
  const websiteUrl = isValidUrlOrNull(b.websiteUrl);
  const description = normalizeText(b.description);
  const universityId = parseOptionalId(b.universityId);
  const subjectIds = parseSubjectIdsFromJson(b.subjectIds, "subjectIds");
  const newSubject = parseNewSubjectFromJson(b.newSubject);

  return {
    nameKo,
    nameEn,
    websiteUrl,
    description,
    universityId,
    subjectIds,
    newSubject,
  };
};

/**
 * Parses a Lab update payload from JSON.
 *
 * This expects a full lab payload (same as create) plus an `id`.
 */
export const parseLabUpdateInputFromJson = (
  body: unknown,
): { id: bigint; data: LabUpsertInput } => {
  if (body === null || typeof body !== "object") throw new Error("Body must be an object");
  const b = body as Record<string, unknown>;
  const id = parseId(b.id, "id");

  // Reuse the create parser for the rest
  const data = parseLabUpsertInputFromJson(b);
  return { id, data };
};

/**
 * Parses a Lab create/update payload from FormData.
 */
export const parseLabUpsertInputFromFormData = (formData: FormData): LabUpsertInput => {
  const nameKo = requireText(formData.get("nameKo"), "nameKo");
  const nameEn = normalizeText(formData.get("nameEn"));
  const websiteUrl = isValidUrlOrNull(formData.get("websiteUrl"));
  const description = normalizeText(formData.get("description"));
  const universityId = parseOptionalId(formData.get("universityId"));
  const subjectIds = parseSubjectIdsFromFormData(formData, "subjectIds");

  const newSubjectNameKo = normalizeText(formData.get("newSubjectNameKo"));
  const newSubjectNameEn = normalizeText(formData.get("newSubjectNameEn"));
  const newSubjectDescription = normalizeText(formData.get("newSubjectDescription"));

  const hasAnyNewSubjectField = !!newSubjectNameKo || !!newSubjectNameEn || !!newSubjectDescription;
  const newSubject = hasAnyNewSubjectField
    ? {
        nameKo: requireText(newSubjectNameKo, "newSubjectNameKo"),
        nameEn: requireText(newSubjectNameEn, "newSubjectNameEn"),
        description: newSubjectDescription,
      }
    : null;

  return {
    nameKo,
    nameEn,
    websiteUrl,
    description,
    universityId,
    subjectIds,
    newSubject,
  };
};

/**
 * Extracts a best-effort draft from FormData for UX-friendly redirects.
 */
export const extractLabDraftFromFormData = (
  formData: FormData,
): {
  nameKo: string;
  nameEn: string;
  websiteUrl: string;
  description: string;
  universityId: string;
  subjectIds: string;
  newSubjectNameKo: string;
  newSubjectNameEn: string;
  newSubjectDescription: string;
} => {
  const subjectIds = formData
    .getAll("subjectIds")
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .join(",");

  return {
    nameKo: normalizeText(formData.get("nameKo")) ?? "",
    nameEn: normalizeText(formData.get("nameEn")) ?? "",
    websiteUrl: normalizeText(formData.get("websiteUrl")) ?? "",
    description: normalizeText(formData.get("description")) ?? "",
    universityId: normalizeText(formData.get("universityId")) ?? "",
    subjectIds,
    newSubjectNameKo: normalizeText(formData.get("newSubjectNameKo")) ?? "",
    newSubjectNameEn: normalizeText(formData.get("newSubjectNameEn")) ?? "",
    newSubjectDescription: normalizeText(formData.get("newSubjectDescription")) ?? "",
  };
};

export const isKnownRequestError = (e: unknown): e is Prisma.PrismaClientKnownRequestError =>
  e instanceof Prisma.PrismaClientKnownRequestError;

export const getUniqueTargets = (e: Prisma.PrismaClientKnownRequestError): string[] => {
  const target = (e.meta as { target?: unknown } | undefined)?.target;
  if (Array.isArray(target)) return target.map(String);
  if (typeof target === "string") return [target];
  return [];
};

type DbClient = Prisma.TransactionClient | typeof prisma;

export const with_transaction = async <T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> => {
  return prisma.$transaction(fn);
};

export const find_lab_unique = async (id: bigint, db: DbClient = prisma) => {
  return db.lab.findUnique({ where: { id } });
};

export const create_lab = async (
  data: Omit<LabUpsertInput, "subjectIds" | "newSubject">,
  db: DbClient = prisma,
) => {
  return db.lab.create({
    data: {
      nameKo: data.nameKo,
      nameEn: data.nameEn,
      websiteUrl: data.websiteUrl,
      description: data.description,
      universityId: data.universityId,
    },
  });
};

export const update_lab = async (
  id: bigint,
  data: Omit<LabUpsertInput, "subjectIds" | "newSubject">,
  db: DbClient = prisma,
) => {
  return db.lab.update({
    where: { id },
    data: {
      nameKo: data.nameKo,
      nameEn: data.nameEn,
      websiteUrl: data.websiteUrl,
      description: data.description,
      universityId: data.universityId,
    },
  });
};

export const create_subject_for_lab = async (
  data: { nameKo: string; nameEn: string; description: string | null },
  db: DbClient = prisma,
) => {
  return db.subject.create({
    data: {
      nameKo: data.nameKo,
      nameEn: data.nameEn,
      description: data.description,
      isActive: true,
    },
  });
};

export const find_lab_subject_links_by_lab = async (labId: bigint, db: DbClient = prisma) => {
  return db.labSubject.findMany({ where: { labId }, select: { subjectId: true } });
};

export const replace_lab_subject_links = async (
  labId: bigint,
  nextSubjectIds: bigint[],
  db: DbClient = prisma,
) => {
  const current = await find_lab_subject_links_by_lab(labId, db);
  const currentSet = new Set(current.map((x) => x.subjectId.toString()));
  const nextSet = new Set(nextSubjectIds.map((x) => x.toString()));

  const toAdd = nextSubjectIds.filter((id) => !currentSet.has(id.toString()));
  const toRemove = current.map((x) => x.subjectId).filter((id) => !nextSet.has(id.toString()));

  if (toRemove.length) {
    await db.labSubject.deleteMany({
      where: {
        labId,
        subjectId: { in: toRemove },
      },
    });
  }

  if (toAdd.length) {
    await db.labSubject.createMany({
      data: toAdd.map((subjectId) => ({ labId, subjectId })),
      skipDuplicates: true,
    });
  }
};

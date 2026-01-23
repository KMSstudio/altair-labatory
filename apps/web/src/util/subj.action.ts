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

/**
 * Normalizes an arbitrary input into a trimmed string.
 *
 * @param value - Unknown input.
 * @returns Trimmed string if non-empty; otherwise `null`.
 */
const normalizeText = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

/**
 * Reads a required text field.
 *
 * @param value - Unknown input.
 * @param field - Field name (used in error messages).
 * @throws {Error} If missing or empty.
 * @returns Non-empty trimmed string.
 */
const requireText = (value: unknown, field: string): string => {
  const normalized = normalizeText(value);
  if (!normalized) throw new Error(`${field} is required`);
  return normalized;
};

/**
 * Parses an integer id represented as a string into `bigint`.
 *
 * @param raw - Raw input (expected string).
 * @param field - Field name (used in error messages).
 * @throws {Error} If not a string, empty, or not a valid integer string.
 * @returns Parsed bigint.
 */
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

/**
 * Parses checkbox-like inputs.
 *
 * For FormData, checkboxes are typically submitted as "on" when checked,
 * and omitted (null/undefined) when unchecked.
 *
 * @param raw - Raw input.
 * @param defaultValue - Value returned when input is not a string.
 * @returns Boolean interpretation of the input.
 */
const parseCheckbox = (raw: unknown, defaultValue: boolean): boolean => {
  if (typeof raw !== "string") return defaultValue;
  return raw === "on" || raw === "true" || raw === "1";
};

/**
 * Parses a create payload from FormData.
 *
 * @param formData - FormData submitted from the browser.
 * @throws {Error} On missing required fields.
 * @returns SubjectCreateInput.
 */
export const parseCreateInputFromFormData = (formData: FormData): SubjectCreateInput => {
  return {
    nameKo: requireText(formData.get("nameKo"), "nameKo"),
    nameEn: requireText(formData.get("nameEn"), "nameEn"),
    description: normalizeText(formData.get("description")),
    // NOTE: unchecked checkbox => key omitted => should be false
    isActive: parseCheckbox(formData.get("isActive"), false),
  };
};

/**
 * Parses an update payload from FormData.
 *
 * This expects a full subject payload (same fields as create) plus an `id`.
 * If you want partial updates, use {@link parseUpdateInputFromJson}.
 *
 * @param formData - FormData submitted from the browser.
 * @throws {Error} If the id is invalid or required fields are missing.
 * @returns Object containing `{ id, data }`.
 */
export const parseUpdateInputFromFormData = (
  formData: FormData,
): { id: bigint; data: SubjectCreateInput } => {
  const idValue = formData.get("id");
  const id = parseId(idValue, "id");
  const data = parseCreateInputFromFormData(formData);
  return { id, data };
};

/**
 * Parses a merge payload from FormData.
 *
 * @param formData - FormData submitted from the browser.
 * @throws {Error} If ids are missing/invalid or equal.
 * @returns SubjectMergeInput.
 */
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

/**
 * Parses a create payload from JSON.
 *
 * @param body - Parsed JSON request body.
 * @throws {Error} On missing required fields.
 * @returns SubjectCreateInput.
 */
export const parseCreateInputFromJson = (body: any): SubjectCreateInput => {
  return {
    nameKo: requireText(body?.nameKo, "nameKo"),
    nameEn: requireText(body?.nameEn, "nameEn"),
    description: normalizeText(body?.description),
    isActive: typeof body?.isActive === "boolean" ? body.isActive : true,
  };
};

/**
 * Parses an update payload from JSON.
 *
 * @param body - Parsed JSON request body.
 * @throws {Error} If id is invalid, field types are invalid, or no fields are provided.
 * @returns Object containing `{ id, data }`.
 */
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

/**
 * Parses a merge payload from JSON.
 *
 * @param body - Parsed JSON request body.
 * @throws {Error} If ids are invalid or equal.
 * @returns SubjectMergeInput.
 */
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

/**
 * Creates a Subject row.
 *
 * @param data - SubjectCreateInput.
 * @returns The created Subject record.
 */
export async function createSubject(data: SubjectCreateInput) {
  return prisma.subject.create({ data });
}

/**
 * Updates a Subject row.
 *
 * @param id - Subject id.
 * @param data - Partial update data.
 * @returns The updated Subject record.
 */
export async function updateSubject(id: bigint, data: Partial<SubjectCreateInput>) {
  return prisma.subject.update({ where: { id }, data });
}

/**
 * Merges two subjects.
 *
 * Behavior:
 * - Moves all LabSubject edges from `fromId` to `toId`.
 * - Deletes edges pointing to `fromId`.
 * - Optionally deactivates the `fromId` subject (soft delete).
 * - If destination has no description and source has one, copies it.
 *
 * @param input - Merge parameters.
 * @returns Transaction result summary.
 */
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

/**
 * Checks whether an error is a Prisma unique constraint violation (P2002).
 *
 * @param e - Unknown caught value.
 * @returns True when the error is P2002.
 */
export const isUniqueViolation = (e: unknown) =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";

/**
 * Type guard for Prisma "known" request errors.
 *
 * @param e - Unknown caught value.
 * @returns True when `e` is a PrismaClientKnownRequestError.
 */
export const isKnownRequestError = (e: unknown): e is Prisma.PrismaClientKnownRequestError =>
  e instanceof Prisma.PrismaClientKnownRequestError;

/**
 * Extracts the Prisma unique-constraint targets from an error meta payload.
 *
 * @param e - Prisma known request error (P2002).
 * @returns List of DB column names reported as the unique target(s).
 */
export const getUniqueTargets = (e: Prisma.PrismaClientKnownRequestError): string[] => {
  const target = (e.meta as { target?: unknown } | undefined)?.target;
  if (Array.isArray(target)) return target.map(String);
  if (typeof target === "string") return [target];
  return [];
};

type DbClient = Prisma.TransactionClient | typeof prisma;

export const with_transaction = async <T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> => {
  return prisma.$transaction(fn);
};

export const create_subject = async (data: SubjectCreateInput, db: DbClient = prisma) => {
  return db.subject.create({ data });
};

export const update_subject = async (id: bigint, data: SubjectCreateInput, db: DbClient = prisma) => {
  return db.subject.update({ where: { id }, data });
};

export const find_subject_unique = async (id: bigint, db: DbClient = prisma) => {
  return db.subject.findUnique({ where: { id } });
};

export const find_lab_subject_links_by_subject = async (subjectId: bigint, db: DbClient = prisma) => {
  return db.labSubject.findMany({
    where: { subjectId },
    select: { labId: true },
  });
};

export const find_subject_first_by_name = async (
  input: Pick<SubjectCreateInput, "nameKo" | "nameEn">,
  excludeId?: bigint,
  db: DbClient = prisma,
) => {
  return db.subject.findFirst({
    where: {
      ...(excludeId !== undefined ? { id: { not: excludeId } } : {}),
      OR: [{ nameKo: input.nameKo }, { nameEn: input.nameEn }],
    },
    select: { nameKo: true, nameEn: true },
  });
};
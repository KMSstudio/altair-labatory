import { prisma, Prisma } from "@labatory/db";

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
 * @param value - unknown input value
 * @returns A trimmed string; returns empty string if value is invaild or empty string when trimmed
 *
 * @example
 * normalizeText(" hello ")
 * // → "hello"
 * normalizeText("   ");
 * // → ""
 * normalizeText(123);
 * // → ""
 */
const normalizeText2String = (value: unknown): string => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed.length ? trimmed : "";
};

/**
 * Reads a required text field.
 * @param value - unknown input value
 * @param field - Field name used in the error message.
 * @returns A trimmed string; throw error if value is null, or empty string, or invalid
 * @throws {Error} value is required
 * @example
 * requireText(" hello ", "field1")
 * // → "hello"
 * requireText("   ", "field2");
 * // → throw Error: field2 is required
 * requireText(123, "field3");
 * // → throw Error: field3 is required
 */
const requireText = (value: unknown, field: string): string => {
  const normalized = normalizeText2String(value);
  if (!normalized) throw new Error(`${field} is required`);
  return normalized;
};

/**
 * Parses an integer id represented as a string into `bigint`.
 * @param raw - unknown input value
 * @param field - Field name used in the error message.
 * @returns A bigint parsed from the trimmed string; throw Error if invaild
 * @throws {Error} If input value is invaild or not a string
 * @example
 * requireText("123", "field1");
 * // → 123: bigint
 * requireText(" hello ", "field2")
 * // → throw Error: field2 must be an integer string
 * requireText("   ", "field3");
 * // → throw Error: field3 is required
 * requireText(1234, "field4");
 * // → throw Error: field4 must be a string
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
 * @param raw - unknown input value
 * @returns A bigint parsed from the trimmed string; throw Error if invaild
 * @throws {Error} If input value is invaild or not a string
 * @example
 * requireText("123", "field1");
 * // → 123: bigint
 * requireText(" hello ", "field2")
 * // → throw Error: universityId must be an integer string
 * requireText("   ", "field3");
 * // → throw Error: field3 is required
 * requireText(1234, "field4");
 * // → throw Error: field4 must be a string
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
/**
 * Check whether input value is a vaild Url
 * @param raw = unknown input value
 * @returns trimmed input value; null if input value is invalid
 * @throws {Error} if input value is not an Url
 * @example
 * isValidUrlOrNull("http://example.com")
 * "http://example.com"
 * isValidUrlOrNull("  ")
 * null
 * isValidUrlOrNull(123)
 * null
 * isValidUrlOrNull("example")
 * throw Error: websiteUrl must be a valid URL
 */
const isValidUrlOrNull = (raw: unknown): string | null => {
  const v = normalizeText2String(raw);
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
 * @param formData - input value
 * @param fieldName - name of field in formData
 * @returns List of deduplicated bigint subject IDs parsed from the given FormData field.
 * List of map
 * @example
 * const fd = new FormData();
 * fd.append("subjectIds", "1");
 * fd.append("subjectIds", "2");
 * fd.append("subjectIds", "1");
 * parseSubjectIdsFromFormData(fd,"subjectIds");
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
 * @param raw - unknown input value
 * @param fieldName - Name of field displayed in Error message
 * @throws If input value is not Array type or input value's item is not string type
 * @returns List of deduplicated bigint subject IDs parsed from the given FormData field.
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
  const nameKo = normalizeText2String(b.nameKo);
  const nameEn = normalizeText2String(b.nameEn);
  const description = normalizeText2String(b.description);

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
 *@param body - serialized data:
 * Expected JSON:
 * - nameKo: string (required)
 * - nameEn: string | null (optional)
 * - websiteUrl: string | null (optional)
 * - description: string | null (optional)
 * - universityId: string | null (optional; bigint string)
 * - subjectIds: string[] (optional; bigint strings)
 * - newSubject: { nameKo, nameEn, description? } | null (optional)
 * @return List of string type
 * @example
 * const fd = new FormData();
 * fd.append("nameKo", "홍길동");
 * fd.append("nameEn", "Hong gil dong");
 * fd.append("subjectIds", "1");
 * fd.append("subjectIds", "2");
 *
 * parseLabUpsertInputFromJson(fd);
 */
export const parseLabUpsertInputFromJson = (body: unknown): LabUpsertInput => {
  if (body === null || typeof body !== "object") throw new Error("Body must be an object");
  const b = body as Record<string, unknown>;

  const nameKo = requireText(b.nameKo, "nameKo");
  const nameEn = normalizeText2String(b.nameEn);
  const websiteUrl = isValidUrlOrNull(b.websiteUrl);
  const description = normalizeText2String(b.description);
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
 * @param body - serialized data:
 * - `nameKo` — Korean name
 * - `nameEn` — English name
 * - `websiteUrl` — Website URL
 * - `description` — Lab description
 * - `universityId` — University ID as string
 * - `subjectIds` — subject IDs; List of string types
 * - `newSubjectNameKo` — New subject Korean name
 * - `newSubjectNameEn` — New subject English name
 * - `newSubjectDescription` — New subject description
 * @returns id and List of string type
 * @example
 * const fd = new FormData();
 * fd.append("id",1)
 * fd.append("nameKo", "홍길동");
 * fd.append("nameEn", "Hong gil dong");
 * fd.append("subjectIds", "1");
 * fd.append("subjectIds", "2");
 *
 * parseLabUpsertInputFromJson(fd);
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
 * @param formData - Submission data:
 * - `nameKo` — Korean name
 * - `nameEn` — English name
 * - `websiteUrl` — Website URL
 * - `description` — Lab description
 * - `universityId` — University ID as string
 * - `subjectIds` — subject IDs; List of string types
 * - `newSubjectNameKo` — New subject Korean name
 * - `newSubjectNameEn` — New subject English name
 * - `newSubjectDescription` — New subject description
 * @returns List of string types
 * @example
 * const fd = new FormData();
 * fd.append("nameKo", "홍길동");
 * fd.append("nameEn", "Hong gil dong");
 * fd.append("subjectIds", "1");
 * fd.append("subjectIds", "2");
 * fd.append("newSubjectNameKo","이름");
 * fd.append("newSubjectNameEn","Name");
 * fd.append("newSubjectDescription","discription");
 *
 * parseLabUpsertInputFromJson(fd);
 */
export const parseLabUpsertInputFromFormData = (formData: FormData): LabUpsertInput => {
  const nameKo = requireText(formData.get("nameKo"), "nameKo");
  const nameEn = normalizeText2String(formData.get("nameEn"));
  const websiteUrl = isValidUrlOrNull(formData.get("websiteUrl"));
  const description = normalizeText2String(formData.get("description"));
  const universityId = parseOptionalId(formData.get("universityId"));
  const subjectIds = parseSubjectIdsFromFormData(formData, "subjectIds");

  const newSubjectNameKo = normalizeText2String(formData.get("newSubjectNameKo"));
  const newSubjectNameEn = normalizeText2String(formData.get("newSubjectNameEn"));
  const newSubjectDescription = normalizeText2String(formData.get("newSubjectDescription"));

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
 * @param formData - Submission data:
 * - `nameKo` — Korean name
 * - `nameEn` — English name
 * - `websiteUrl` — Website URL
 * - `description` — Lab description
 * - `universityId` — University ID as string
 * - `subjectIds` — Comma-separated subject IDs
 * - `newSubjectNameKo` — New subject Korean name
 * - `newSubjectNameEn` — New subject English name
 * - `newSubjectDescription` — New subject description
 * @returns List of string types
 * @example
 * const fd = new FormData();
 * fd.append("nameKo", "홍길동");
 * fd.append("nameEn", "Hong gil dong");
 * fd.append("subjectIds", "1");
 * fd.append("subjectIds", "2");
 * fd.append("newSubjectNameKo","이름");
 * fd.append("newSubjectNameEn","Name");
 * fd.append("newSubjectDescription","discription");
 *
 * parseLabUpsertInputFromJson(fd);
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
    nameKo: normalizeText2String(formData.get("nameKo")) ?? "",
    nameEn: normalizeText2String(formData.get("nameEn")) ?? "",
    websiteUrl: normalizeText2String(formData.get("websiteUrl")) ?? "",
    description: normalizeText2String(formData.get("description")) ?? "",
    universityId: normalizeText2String(formData.get("universityId")) ?? "",
    subjectIds,
    newSubjectNameKo: normalizeText2String(formData.get("newSubjectNameKo")) ?? "",
    newSubjectNameEn: normalizeText2String(formData.get("newSubjectNameEn")) ?? "",
    newSubjectDescription: normalizeText2String(formData.get("newSubjectDescription")) ?? "",
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

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  SubjectCreateInput,
  isKnownRequestError,
  getUniqueTargets,
  with_transaction,
  create_subject,
  update_subject,
  find_subject_unique,
  find_lab_subject_links_by_subject,
  find_subject_first_by_name,
} from "@/util/subj.action";
import { prisma } from "@labatory/db";
import { CreateTag, UpdateTag } from "@/repository/db/article/tag";
import { normalizeText } from "@/util/util";

/**
 * Reads a required text field from FormData.
 *
 * @param value - Raw FormData entry.
 * @param field - Human-readable field name for error messages.
 * @throws {Error} When the value is missing/empty.
 * @returns A non-empty trimmed string.
 */
const requireText = (value: FormDataEntryValue | null, field: string): string => {
  const normalized = normalizeText(value);
  if (!normalized) {
    throw new Error(`${field} is required`);
  }
  return normalized;
};

/**
 * Parses the subject payload submitted via `<form>`.
 *
 * Note: HTML checkbox inputs submit a value only when checked.
 * This function treats `isActive` as true only when the field is present.
 *
 * @param formData - FormData from the browser.
 * @throws {Error} When required fields are missing.
 * @returns Parsed SubjectCreateInput.
 */
const parseSubjectInput = (formData: FormData): SubjectCreateInput => {
  const isActiveRaw = formData.get("isActive");
  const isActive = isActiveRaw === "on" || isActiveRaw === "true";

  return {
    nameKo: requireText(formData.get("nameKo"), "Korean name"),
    nameEn: requireText(formData.get("nameEn"), "English name"),
    description: normalizeText(formData.get("description")),
    isActive,
  };
};

/**
 * Extracts a best-effort draft from FormData for UX-friendly redirects.
 *
 * When validation fails, we redirect back to the page with the draft values
 * encoded in the query string so the form can be pre-filled.
 *
 * @param formData - Raw FormData from the browser.
 * @returns Draft values (strings default to empty string).
 */
const extractSubjectDraft = (formData: FormData): SubjectCreateInput => {
  const isActiveRaw = formData.get("isActive");
  return {
    nameKo: normalizeText(formData.get("nameKo")) ?? "",
    nameEn: normalizeText(formData.get("nameEn")) ?? "",
    description: normalizeText(formData.get("description")) ?? "",
    isActive: isActiveRaw === "on" || isActiveRaw === "true",
  };
};

/**
 * Maps DB column names (snake_case) to form field names (camelCase).
 *
 * This is used to show more user-friendly "which field is duplicated" hints.
 *
 * @param dbField - DB column name.
 * @returns Corresponding form field name.
 */
const dbFieldToFormField = (dbField: string): string => {
  if (dbField === "name_ko") return "nameKo";
  if (dbField === "name_en") return "nameEn";
  return dbField;
};

/**
 * Builds a query string used to redirect back to a form page with:
 * - error metadata (type, fields, message)
 * - preserved draft values (so the form can be pre-filled)
 *
 * @param draft - Draft values collected from a previous submission.
 * @param error - Error category string.
 * @param fields - Optional list of field names involved in the error.
 * @param message - Optional human-readable message.
 * @returns URL-encoded query string.
 */
const buildQuery = (
  draft: SubjectCreateInput,
  error: string,
  fields?: string[],
  message?: string,
): string => {
  const qs = new URLSearchParams();
  qs.set("error", error);
  if (fields?.length) qs.set("fields", fields.join(","));
  if (message) qs.set("message", message);
  if (typeof draft.nameKo === "string") qs.set("nameKo", draft.nameKo);
  if (typeof draft.nameEn === "string") qs.set("nameEn", draft.nameEn);
  if (typeof draft.description === "string") qs.set("description", draft.description);
  if (typeof draft.isActive === "boolean") qs.set("isActive", draft.isActive ? "true" : "false");
  return qs.toString();
};

/**
 * Server Action: Create a new Subject.
 *
 * Fail-safe behavior:
 * - Validates input; on validation failure redirects back with error params.
 * - Preflights uniqueness and also catches Prisma P2002 for race conditions.
 * - Keeps user-entered draft values through redirects.
 *
 * @param formData - Form payload posted by the browser.
 * @returns Never returns normally; redirects on both success and handled errors.
 */
export async function createSubject(formData: FormData) {
  const draft = extractSubjectDraft(formData);
  let data: SubjectCreateInput;
  try {
    data = parseSubjectInput(formData);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid input";
    redirect(`/subj/new?${buildQuery(draft, "validation", undefined, message)}`);
  }

  const dup = await findDuplicateFields(data);
  if (dup) {
    redirect(`/subj/new?${buildQuery({ ...draft, ...data }, "unique", dup.fields)}`);
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const created = await create_subject({ ...data, isActive: true }, tx);
      await CreateTag({ kind: "SUBJECT", id: created.id, db: tx });
      return created;
    });
    revalidatePath("/subj/list");
    redirect(`/subj/${created.id.toString()}`);
  } catch (e) {
    if (isKnownRequestError(e) && e.code === "P2002") {
      const fields = getUniqueTargets(e).map(dbFieldToFormField);
      redirect(`/subj/new?${buildQuery({ ...draft, ...data }, "unique", fields)}`);
    }
    throw e;
  }
}

/**
 * Server Action: Update an existing Subject.
 *
 * Fail-safe behavior mirrors {@link createSubject}:
 * - Validates input; on failure redirects back to the detail page.
 * - Preflights uniqueness and also catches Prisma P2002.
 * - Handles Prisma P2025 (record not found) by redirecting to the list.
 *
 * @param formData - Form payload posted by the browser.
 * @returns Never returns normally; redirects on both success and handled errors.
 */
export async function updateSubject(formData: FormData) {
  const idValue = formData.get("id");
  if (typeof idValue !== "string") {
    throw new Error("Missing subject id");
  }
  const target = `/subj/${idValue}`;

  let id: bigint;
  try {
    id = BigInt(idValue);
  } catch {
    redirect(`/subj/list?error=validation&message=${encodeURIComponent("Invalid subject id")}`);
  }

  const draft = extractSubjectDraft(formData);
  let data: SubjectCreateInput;
  try {
    data = parseSubjectInput(formData);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid input";
    redirect(`${target}?${buildQuery(draft, "validation", undefined, message)}`);
  }

  const dup = await findDuplicateFields(data, id);
  if (dup) {
    redirect(`${target}?${buildQuery({ ...draft, ...data }, "unique", dup.fields)}`);
  }

  try {
    await prisma.$transaction(async (tx) => {
      const updateSubj = await update_subject(id, data);
      const tag = await tx.tag.findUnique({
        where: {
          subjId: updateSubj.id,
        },
      });
      if (tag) {
        await UpdateTag({ tagId: tag.id, db: tx });
      } else {
        await CreateTag({ kind: "SUBJECT", id: updateSubj.id, db: tx });
      }
    });

    revalidatePath("/subj/list");
    revalidatePath(target);
    redirect(target);
  } catch (e) {
    if (isKnownRequestError(e) && e.code === "P2002") {
      const fields = getUniqueTargets(e).map(dbFieldToFormField);
      redirect(`${target}?${buildQuery({ ...draft, ...data }, "unique", fields)}`);
    }
    if (isKnownRequestError(e) && e.code === "P2025") {
      redirect(`/subj/list?error=notfound&message=${encodeURIComponent("Subject not found")}`);
    }
    throw e;
  }
}

/**
 * Server Action: Merge two Subjects.
 *
 * Semantics:
 * - Moves all LabSubject edges from `fromId` to `toId`.
 * - Deactivates the source subject (`fromId`) via `isActive=false` (soft delete).
 *
 * @param formData - Form payload containing `fromId` and `toId`.
 * @throws {Error} If ids are missing or equal.
 * @returns Never returns normally; redirects to the destination subject page.
 */
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

  await with_transaction(async (tx) => {
    const [from, to] = await Promise.all([
      find_subject_unique(fromId, tx),
      find_subject_unique(toId, tx),
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

/**
 * Server Action: Update LabSubject links for a Subject.
 *
 * This implements a “replace set” operation:
 * - Reads the checked `labIds[]` from the form.
 * - Adds missing (labId, subjectId) pairs.
 * - Removes existing links not present in the submitted set.
 *
 * @param formData - Form payload containing `subjectId` and zero or more `labIds` entries.
 * @returns Never returns normally; redirects back to the subject detail page.
 */
export async function updateSubjectLabLinks(formData: FormData) {
  const subjectValue = formData.get("subjectId");
  if (typeof subjectValue !== "string" || !subjectValue.trim()) {
    throw new Error("Missing subjectId");
  }

  const subjectId = BigInt(subjectValue);
  const selectedLabIds = formData
    .getAll("labIds")
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((v) => BigInt(v));

  await with_transaction(async (tx) => {
    const current = await find_lab_subject_links_by_subject(subjectId, tx);

    const currentSet = new Set(current.map((x) => x.labId.toString()));
    const nextSet = new Set(selectedLabIds.map((x) => x.toString()));

    const toAdd = selectedLabIds.filter((id) => !currentSet.has(id.toString()));
    const toRemove = current.map((x) => x.labId).filter((id) => !nextSet.has(id.toString()));

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

/**
 * Best-effort duplicate pre-check to provide a fail-safe UX.
 *
 * This avoids a hard 500 on unique constraint errors by proactively detecting
 * duplicates and redirecting with an error payload. Note that this does NOT
 * replace the P2002 catch (race conditions can still occur).
 *
 * @param input - Subject input.
 * @param excludeId - Optional subject id to exclude (useful for updates).
 * @returns Field list that duplicates an existing row, or null.
 */
const findDuplicateFields = async (
  input: SubjectCreateInput,
  excludeId?: bigint,
): Promise<{ fields: Array<"nameKo" | "nameEn"> } | null> => {
  const existing = await find_subject_first_by_name(input, excludeId);

  if (!existing) return null;
  const fields: Array<"nameKo" | "nameEn"> = [];
  if (existing.nameKo === input.nameKo) fields.push("nameKo");
  if (existing.nameEn === input.nameEn) fields.push("nameEn");
  return fields.length ? { fields } : null;
};

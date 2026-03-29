// @/repository/db/labatory/subject.ts

import { getSubjectSelect, type SubjectDbShape, type SubjectDTO } from "@/repository/dto/labatory";
import { serializeSubject } from "@/repository/serialize/labatory";
import type { Subject_Input } from "@/types/labatory";
import { prisma, Prisma } from "@labatory/db";
import { CreateTag, UpdateTag } from "../article/tag";
import type { DbClient } from "@/types/db";

/**
 * Retrieve a specific (not deleted) subject by id.
 *
 * This is a DB-only function. No authentication/authorization is performed here.
 *
 * @param subjectId - Target subject id.
 * @param db - Client where query will be performed. Default is prisma.
 * @returns Subject DB shape if found and not deleted, otherwise null.
 */
export async function getSubjectCore({
  subjectId,
  db = prisma,
}: {
  subjectId: bigint;
  db?: DbClient;
}): Promise<SubjectDTO | null> {
  const subject = (await db.subject.findUnique({
    where: {
      isDeleted: false,
      id: subjectId,
    },
    select: getSubjectSelect,
  })) as SubjectDbShape;
  if (!subject) return null;
  else return serializeSubject(subject);
}

/**
 * Create new Subject.
 *
 * The update runs in a single transaction:
 * 1) Create subject.
 * 2) Create tag associated with that subject.
 *
 * @param input - korean name, english name, and description of new subject.
 * @returns Subject DTO of new subject.
 */
export async function createSubjectCore({
  input,
}: {
  input: Subject_Input;
}): Promise<SubjectDTO | null> {
  return await prisma.$transaction(async (tx) => {
    const newSubj = (await tx.subject.create({
      data: {
        nameKo: input.nameKo,
        nameEn: input.nameEn,
        description: input.description,
      },
      select: {
        id: true,
      },
    })) as SubjectDbShape;
    await CreateTag({ kind: "SUBJECT", id: newSubj.id, db: tx });
    return await getSubjectCore({ subjectId: newSubj.id, db: tx });
  });
}

/**
 * Update an existing subject's korean name, english name, description, and whether it is active.
 *
 * This is a **DB-only function**. Caller must ensure:
 * - Authentication/authorization (e.g., requester is allowed to update this subject)
 * - Input validation (non-empty names, etc.)
 *
 * The update runs in a single transaction:
 * 1) Check whether the subject with input id exists.
 * 2) Update subject fields.
 * 3) Update tag name associated with subject.
 *
 * @param subjectId - Target subject id to update.
 * @param input - Update payload (nameKo,nameEn,description,isActive).
 *
 * @returns Subject DB shape when the subject is successfully updated.
 *
 * @throws {Error}
 * If a database constraint violation occurs.
 *
 * @throws {Prisma.PrismaClientKnownRequestError}
 * If the target subject does not exist.
 */
export async function updateSubjectCore({
  subjectId,
  input,
}: {
  subjectId: bigint;
  input: Subject_Input;
}): Promise<SubjectDTO | null> {
  return prisma.$transaction(async (tx) => {
    try {
      const updatedSubject = await tx.subject.update({
        where: {
          id: subjectId,
          isDeleted: false,
        },
        data: {
          nameKo: input.nameKo,
          nameEn: input.nameEn,
          description: input.description,
        },
        select: {
          id: true,
          tag: {
            select: {
              id: true,
            },
          },
        },
      });
      if (updatedSubject.tag) await UpdateTag({ tagId: updatedSubject.tag.id, db: tx });
      else await CreateTag({ kind: "SUBJECT", id: updatedSubject.id, db: tx });
      return await getSubjectCore({ subjectId: updatedSubject.id, db: tx });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code == "P2025") {
        throw new Error("Subject does not exists or was deleted during update.");
      } else throw e;
    }
  });
}

/**
 * Soft-deletes a subject.
 *
 * Marks the subject deleted by setting `isDeleted = true` and recording
 * the deletion timestamp in `deletedAt`. This function performs DB-only
 * logic and assumes that authorization (e.g., author/admin validation)
 * has already been handled by the caller.
 *
 * To prevent race conditions during concurrent delete requests, the final
 * write operation is guarded with `isDeleted: false`. If another request
 * deletes the subject between the read and the write, the update will
 * affect zero rows and an error will be thrown.
 *
 * @param subjectId - Target subject id.
 * @param db - Client where query will be performed. Default is prisma.
 * @throws If subject id is invalid.
 * @returns Subject DB shape of deleted subject.
 */
export async function deleteSubjectCore({
  subjectId,
  db = prisma,
}: {
  subjectId: bigint;
  db?: DbClient;
}): Promise<SubjectDTO | null> {
  const subj = await db.subject.findUnique({
    where: {
      id: subjectId,
      isDeleted: false,
    },
  });
  if (!subj) throw new Error("Subject does not exist or already deleted.");

  try {
    const deletedSubject = (await db.subject.update({
      where: {
        id: subjectId,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
      select: getSubjectSelect,
    })) as SubjectDbShape;
    return serializeSubject(deletedSubject);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025")
      throw new Error("Subject already deleted.");
    else throw e;
  }
}

/**
 * Merge two Subjects into one.
 *
 * Semantics:
 * - Moves all LabSubject edges from `fromId` to `toId`.
 * - Move all ArticleTag edges from 'fromId' to 'toId'.
 * - Deactivates the source subject (`fromId`) via `deleteSubjectCore` (soft delete).
 *
 * @param sourceSubjectId - Id of source subject.
 * @param destinationSubjectId - Id of destination subject.
 * @throws if either subject does not exist, or already deleted, or destination subject was deleted during merge.
 * @returns subjectDTO of merged destination subject.
 */
export async function mergeSubjectCore({
  sourceSubjectId,
  destinationSubjectId,
}: {
  sourceSubjectId: bigint;
  destinationSubjectId: bigint;
}): Promise<SubjectDTO | null> {
  if (sourceSubjectId == destinationSubjectId) {
    throw new Error("You cannot merge same subjects.");
  }
  return await prisma.$transaction(async (tx) => {
    const fromSubj = await tx.subject.findUnique({
      where: {
        id: sourceSubjectId,
      },
      select: {
        id: true,
        isDeleted: true,
        tag: {
          select: { id: true },
        },
      },
    });
    if (!fromSubj) {
      throw new Error("Invalid source subject id.");
    }
    if (fromSubj.isDeleted) {
      throw new Error("source subject is deleted.");
    }
    const toSubj = await tx.subject.findUnique({
      where: {
        id: destinationSubjectId,
      },
      select: {
        id: true,
        isDeleted: true,
        tag: {
          select: { id: true },
        },
      },
    });
    if (!toSubj) {
      throw new Error("Invalid destination subject id.");
    }
    if (toSubj.isDeleted) {
      throw new Error("Destination subject is deleted.");
    }

    const labLinks = await tx.labSubject.findMany({
      where: { subjectId: sourceSubjectId },
      select: { labId: true },
    });
    if (labLinks.length) {
      await tx.labSubject.createMany({
        data: labLinks.map((l) => ({ labId: l.labId, subjectId: destinationSubjectId })),
        skipDuplicates: true,
      });

      await tx.labSubject.deleteMany({ where: { subjectId: sourceSubjectId } });
    }

    const fromTagId = fromSubj.tag?.id ?? null;
    if (fromTagId != null) {
      let toTagId = toSubj.tag?.id ?? null;
      if (!toTagId) {
        toTagId = BigInt(
          (await CreateTag({ kind: "SUBJECT", id: destinationSubjectId, db: tx })).id,
        );
      }
      const tagLinks = await tx.articleTag.findMany({
        where: { tagId: fromTagId },
        select: { articleId: true },
      });
      await tx.articleTag.createMany({
        data: tagLinks.map((l) => ({ articleId: l.articleId, tagId: toTagId })),
        skipDuplicates: true,
      });
      await tx.articleTag.deleteMany({ where: { tagId: fromTagId } });
    }
    await deleteSubjectCore({ subjectId: sourceSubjectId, db: tx });
    const mergedSubject = await getSubjectCore({ subjectId: destinationSubjectId, db: tx });
    if (!mergedSubject) throw new Error("Destination subject was deleted during merge process.");
    return mergedSubject;
  });
}

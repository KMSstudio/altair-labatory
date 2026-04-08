import { getLabselect, type LabDbShape, type LabDTO } from "@/repository/dto/labatory";
import { Prisma, prisma } from "@labatory/db";
import type { DbClient } from "@/types/db";
import { serializeLab } from "@/repository/serialize/labatory";
import type { Labatory_Input, Labatory_Update_Input } from "@/types/labatory";
import { CreateTag, UpdateTag } from "../article/tag";

export enum LabSearchScope {
  ALL = "ALL",
  UNIV = "UNIV",
  SUBJ = "SUBJ",
  LAB = "LAB",
}

/**
 * Retrieve a specific (not deleted) labatory by id.
 *
 * This is a DB-only function. No authentication/authorization is performed here.
 *
 * @param labatoryId - Target labatory id.
 * @param db - Client where query will be performed. Default is prisma.
 * @returns labatory DTO if found, otherwise null.
 */
export async function getLabCore({
  id,
  db = prisma,
}: {
  id: bigint;
  db?: DbClient;
}): Promise<LabDTO | null> {
  const lab = (await db.lab.findUnique({
    where: {
      isDeleted: false,
      id,
    },
    select: getLabselect,
  })) as LabDbShape;
  if (!lab) return null;
  return serializeLab(lab);
}

/**
 * Retrieve a entire list of (not deleted) labatory.
 *
 * This is a DB-only function. No authentication/authorization is performed here.
 *
 * @param db - Client where query will be performed. Default is prisma.
 * @returns list of labatory DTO.
 */
export async function getLabsCore({ db = prisma }: { db?: DbClient }): Promise<LabDTO[]> {
  const labs = (await db.lab.findMany({
    where: {
      isDeleted: false,
    },
    select: getLabselect,
  })) as LabDbShape[];
  return labs.map(serializeLab);
}

/**
 * Retrieves a list of non-deleted labatory entries filtered by university, subject, or both.
 * If both `univId` and `subjId` are provided, only labatory entries that satisfy both conditions are returned.
 *
 * This is a DB-only function. No authentication or authorization is performed.
 *
 * @param univId - The target university ID.
 * @param subjId - The target subject ID.
 * @param db - The database client used to perform the query. Default is prisma.
 * @throws If neither `univId` nor `subjId` is provided.
 * @returns A list of labatory DTOs.
 */
export async function getLabList({
  univId,
  subjId,
  db = prisma,
}: {
  univId?: bigint;
  subjId?: bigint;
  db?: DbClient;
}) {
  if (!univId && !subjId) throw new Error("Either univId or subjId is needed");
  const andConditions: Prisma.LabWhereInput[] = [{ isDeleted: false }];
  if (univId) {
    andConditions.push({
      universityId: univId,
    });
  }
  if (subjId) {
    andConditions.push({
      subjects: {
        some: {
          subjectId: subjId,
        },
      },
    });
  }
  const labs = await db.lab.findMany({
    where: {
      AND: andConditions,
    },
    select: getLabselect,
  });
  return labs.map(serializeLab);
}

/**
 * Retrieve a list of (not deleted) labatory by query.
 * this function will try to find all labs who has query as substring of:
 * itself's english name or korean name (LAB)
 * it's subject's english name or korean name (SUBJ)
 * it's university's english name or korean name (SUBJ)
 * If the query is empty, return list of all (not delete) labs.
 *
 * This is a DB-only function. No authentication/authorization is performed here.
 *
 * @param searchScope - scope of search. can be LAB, SUBJ, UNIV, or ALL
 * @param query - search query.
 * @param db - Client where query will be performed. Default is prisma.
 * @returns list of labatory DTO.
 */
export async function searchLab({
  searchScope,
  query,
  db = prisma,
}: {
  searchScope: LabSearchScope;
  query: string;
  db?: DbClient;
}): Promise<LabDTO[]> {
  const where: Prisma.LabWhereInput = {
    AND: [{ isDeleted: false }],
  };

  if (query.length) {
    const prismaQuery = (value: string) =>
      ({ contains: value, mode: Prisma.QueryMode.insensitive }) as const;
    const orGroups = {
      lab: [{ nameKo: prismaQuery(query) }, { nameEn: prismaQuery(query) }],
      univ: [
        { university: { nameKo: prismaQuery(query) } },
        { university: { nameEn: prismaQuery(query) } },
      ],
      subj: [
        {
          subjects: {
            some: {
              subject: {
                OR: [{ nameKo: prismaQuery(query) }, { nameEn: prismaQuery(query) }],
              },
            },
          },
        },
      ],
    } satisfies Record<"lab" | "univ" | "subj", Prisma.LabWhereInput["OR"]>;
    const map = {
      [LabSearchScope.LAB]: orGroups.lab,
      [LabSearchScope.UNIV]: orGroups.univ,
      [LabSearchScope.SUBJ]: orGroups.subj,
      [LabSearchScope.ALL]: [...orGroups.lab, ...orGroups.univ, ...orGroups.subj],
    };
    where.OR = map[searchScope];
  }
  const labs = await db.lab.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    select: getLabselect,
  });
  return labs.map(serializeLab);
}

/**
 * Create new lab, its tag relations, and its subject relations in the database.
 *
 * This is a DB-only function. No authentication/authorization is performed here.
 *
 * The function inserts a new lab row and creates
 * corresponding entries in `labSubject` and tag using a single transaction.
 *
 * To prevent race conditions during concurrent pi update requests, the final
 * write operation of pi is guarded with `labId: null`. If another request
 * updates the pi between the read and the write, the creation will
 * affect zero rows and an error will be thrown.
 *
 * @param input - Labatory data payload (nameKo, nameEn, websiteUrl, description, universityId, piId)
 * @param subjIds - list of subject ids who will be linked with created lab.
 * @throws If pi id is invalid.
 * @returns labatory DTO of created labatory.
 */
export async function createLabCore({
  input,
  subjIds,
}: {
  input: Labatory_Input;
  subjIds: bigint[];
}): Promise<LabDTO | null> {
  return await prisma.$transaction(async (tx) => {
    const newLab = (await tx.lab.create({
      data: {
        nameKo: input.nameKo,
        nameEn: input.nameEn,
        description: input.description,
        websiteUrl: input.websiteUrl,
        universityId: input.universityId,
      },
      select: getLabselect,
    })) as LabDbShape;

    const pi = await tx.pI.updateMany({
      where: {
        id: input.piId,
        labId: null,
      },
      data: {
        labId: newLab.id,
      },
    });
    if (pi.count !== 1) {
      throw new Error("Invalid PI id.");
    }
    const data: Prisma.LabSubjectCreateManyInput[] = subjIds.map((subjectId) => ({
      labId: newLab.id,
      subjectId,
    }));
    await tx.labSubject.createMany({
      data,
    });
    await CreateTag({ kind: "LAB", id: newLab.id, db: tx });
    return await getLabCore({ id: newLab.id, db: tx });
  });
}

/**
 * Update new lab, its tag relations, and its subject relations in the database.
 *
 * This is a DB-only function. No authentication/authorization is performed here.
 *
 * @param labId - Id of labatory being updated.
 * @param input - Labatory data payload (nameKo, nameEn, websiteUrl, description, universityId)
 * @param subjIds - list of subject ids who will be linked with updated lab.
 * @throw if lab id or subject id is invalid.
 * @returns labatory DTO of updated labatory.
 */
export async function updateLabCore({
  labId,
  input,
  subjIds,
}: {
  labId: bigint;
  input: Labatory_Update_Input;
  subjIds: bigint[];
}): Promise<LabDTO | null> {
  return await prisma.$transaction(async (tx) => {
    try {
      const updatedLab = await tx.lab.update({
        where: {
          id: labId,
          isDeleted: false,
        },
        data: {
          nameKo: input.nameKo,
          nameEn: input.nameEn,
          description: input.description,
          websiteUrl: input.websiteUrl,
          universityId: input.universityId,
        },
        select: {
          id: true,
          tag: {
            select: { id: true },
          },
        },
      });
      if (updatedLab.tag) await UpdateTag({ tagId: updatedLab.tag.id, db: tx });
      else await CreateTag({ id: updatedLab.id, kind: "LAB", db: tx });
      if (!updatedLab) throw new Error("Invalid lab id.");
      await tx.labSubject.deleteMany({
        where: {
          labId,
        },
      });
      const data: Prisma.LabSubjectCreateManyInput[] = subjIds.map((subjectId) => ({
        labId,
        subjectId,
      }));
      await tx.labSubject.createMany({
        data,
      });
      return await getLabCore({ id: labId, db: tx });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        throw new Error("Lab does not exist.");
      } else {
        throw e;
      }
    }
  });
}

/**
 * Soft-deletes a labatory.
 * This includes un-linking all subjects, university, and PI related to the labatory.
 * This action will be performed by set universityId to null, update PI information, and delete all labSubject related to the labatory.
 *
 * Marks the labatory deleted by setting `isDeleted = true` and recording
 * the deletion timestamp in `deletedAt`. This function performs DB-only
 * logic and assumes that authorization (e.g., pi/admin validation)
 * has already been handled by the caller.
 *
 * To prevent race conditions during concurrent delete requests, the final
 * write operation is guarded with `isDeleted: false`. If another request
 * deletes the labatory between the read and the write, the update will
 * affect zero rows and an error will be thrown.
 *
 * @param labId - Target lab id.
 * @throws If lab id is invalid.
 * @returns Lab DB shape of deleted lab.
 */
export async function deleteLab({ labId }: { labId: bigint }): Promise<LabDTO> {
  return await prisma.$transaction(async (tx) => {
    const lab = await tx.lab.findUnique({
      where: {
        id: labId,
        isDeleted: false,
      },
      select: {
        id: true,
      },
    });
    if (!lab) throw new Error("Lab does not exist.");
    try {
      const deletedLab = (await tx.lab.update({
        where: {
          id: labId,
          isDeleted: false,
        },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          universityId: null,
        },
        select: getLabselect,
      })) as LabDbShape;
      await tx.labSubject.deleteMany({
        where: {
          labId: deletedLab.id,
        },
      });
      if (deletedLab.pi) {
        await tx.pI.update({
          where: {
            id: deletedLab.pi.id,
          },
          data: {
            labId: null,
          },
        });
      }
      return serializeLab(deletedLab);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025")
        throw new Error("Lab already deleted.");
      else throw e;
    }
  });
}

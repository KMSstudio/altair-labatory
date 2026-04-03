// @/repository/db/university.ts

import { getUniversitySelect, UniversityDbShape, UniversityDTO } from "@/repository/dto/labatory";
import { serializeUniversity } from "@/repository/serialize/labatory";
import type { University_Input } from "@/types/labatory";
import { prisma, Prisma } from "@labatory/db";
import { CreateTag, UpdateTag } from "../article/tag";
import type { DbClient } from "@/types/db";

/**
 * Retrieve a specific university by id.
 *
 * This is a DB-only function. No authentication/authorization is performed here.
 *
 * @param universityId - Target university id.
 * @param db - Client where query will be performed. Default is prisma.
 * @returns university DTO if found, otherwise null.
 */
export async function getUniversityCore({
  universityId,
  db = prisma,
}: {
  universityId: bigint;
  db?: DbClient;
}): Promise<UniversityDTO | null> {
  const univ = await db.university.findUnique({
    where: {
      id: universityId,
    },
    select: getUniversitySelect,
  });
  if (!univ) return null;
  else return serializeUniversity(univ);
}

/**
 * Create new University.
 *
 * The create runs in a single transaction:
 * 1) Create university.
 * 2) Create tag associated with university.
 *
 * @param input - korean name, english name, websiteUrl, and country of new university.
 * @returns University DTO of new University.
 */
export async function createUniversityCore({
  input,
}: {
  input: University_Input;
}): Promise<UniversityDTO> {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const univ = (await tx.university.create({
      data: {
        nameKo: input.nameKo,
        nameEn: input.nameEn,
        websiteUrl: input.websiteUrl,
        country: input.country,
      },
      select: getUniversitySelect,
    })) as UniversityDbShape;
    await CreateTag({ kind: "UNIV", id: univ.id, db: tx });
    return serializeUniversity(univ);
  });
}

/**
 * Update existing university's korean name, english name, websiteUrl, and country.
 *
 * The update runs in a single transaction:
 * 1) Create university.
 * 2) Update tag associated with university. If tag does not exists for some reason, create one.
 *
 * @param universityId - Target university id.
 * @param input - korean name, english name, websiteUrl, and country of updated university.
 * @throws If university id is invalid.
 * @returns University DTO of updated University.
 */
export async function updateUniversityCore({
  universityId,
  input,
}: {
  universityId: bigint;
  input: University_Input;
}): Promise<UniversityDTO | null> {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    try {
      const univ = await tx.university.update({
        where: {
          id: universityId,
        },
        data: {
          nameKo: input.nameKo,
          nameEn: input.nameEn,
          websiteUrl: input.websiteUrl,
          country: input.country,
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
      if (!univ.tag) await CreateTag({ kind: "UNIV", id: univ.id, db: tx });
      else await UpdateTag({ tagId: univ.tag.id, db: tx });
      return await getUniversityCore({ universityId: univ.id, db: tx });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025")
        throw new Error("University does not exists.");
      else throw e;
    }
  });
}

/**
 * Hard-delete existing university
 *
 * @param universityId - Target university id.
 * @throws If university id is invalid.
 * @returns University DTO of deleted University.
 */
export async function deleteUniversityCore({
  universityId,
}: {
  universityId: bigint;
}): Promise<UniversityDTO> {
  try {
    const univ = await prisma.university.delete({
      where: {
        id: universityId,
      },
      select: getUniversitySelect,
    });
    return serializeUniversity(univ);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025")
      throw new Error("University does not exists.");
    else throw e;
  }
}

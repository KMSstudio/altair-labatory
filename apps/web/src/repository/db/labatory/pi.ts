// @/repository/db/pi.ts

import { getPiSelect, type PiDbShape, type PiDTO } from "@/repository/dto/labatory";
import { serializePi } from "@/repository/serialize/labatory";
import type { Pi_Input } from "@/types/labatory";
import { Prisma, prisma } from "@labatory/db";
import type { DbClient } from "@/types/db";

/**
 * Retrieve a specific pi by id.
 *
 * This is a DB-only function. No authentication/authorization is performed here.
 *
 * @param piId - Target pi id.
 * @param db - Client where query will be performed. Default is prisma.
 * @returns Pi DTO if found, otherwise null.
 */
export async function getPiCore({
  piId,
  db = prisma,
}: {
  piId: bigint;
  db: DbClient;
}): Promise<PiDTO | null> {
  const pi = await db.pI.findUnique({
    where: { id: piId },
    select: getPiSelect,
  });
  if (!pi) return null;
  else return serializePi(pi);
}

/**
 * Create new PI.
 *
 * @param input - new name, email, scholarUrl, labId, and userId of Pi.
 * @param db - Client where query will be performed. Default is prisma.
 * @returns Pi DTO of newly create pi.
 */
export async function createPiCore({
  input,
  db = prisma,
}: {
  input: Pi_Input;
  db: DbClient;
}): Promise<PiDTO> {
  const createdPi = (await db.pI.create({
    data: {
      name: input.name,
      email: input.email,
      scholarUrl: input.scholarUrl,
      labId: input.labId,
      userId: input.userId,
    },
  })) as PiDbShape;
  return serializePi(createdPi);
}
/**
 * Update PI info.
 *
 * @param piId - Id of pi whose information will be changed
 * @param input - new name, email, scholarUrl, labId, and userId of Pi.
 * @returns Pi DTO of updated pi.
 * @throws Pi id is invaild, or internal server error occurs.
 */
export async function updatePiCore({
  piId,
  input,
}: {
  piId: bigint;
  input: Pi_Input;
}): Promise<PiDTO> {
  try {
    const updatedPi = (await prisma.pI.update({
      where: { id: piId },
      data: {
        name: input.name,
        email: input.email,
        scholarUrl: input.scholarUrl,
        labId: input.labId,
        userId: input.userId,
      },
    })) as PiDbShape;
    return serializePi(updatedPi);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025")
      throw new Error("Pi does not exists.");
    else throw e;
  }
}

/**
 * Delete a specific pi by id (hard-delete).
 *
 * This is a DB-only function. No authentication/authorization is performed here.
 *
 * @param piId - Target pi id.
 * @param db - Client where query will be performed. Default is prisma.
 * @throws if pi id is invaild.
 * @returns Pi DTO of deleted pi.
 */
export async function deletePiCore({
  piId,
  db = prisma,
}: {
  piId: bigint;
  db: DbClient;
}): Promise<PiDTO | null> {
  try {
    const pi = (await db.pI.delete({
      where: { id: piId },
      select: getPiSelect,
    })) as PiDbShape;
    return serializePi(pi);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025")
      throw new Error("Pi already deleted or does not exist.");
    else throw e;
  }
}

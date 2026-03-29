// @/repository/db/pi-application.ts

import {
  getPiApplicationSelect,
  type PiApplicationDbShape,
  type PiApplicationDTO,
} from "@/repository/dto/labatory";
import { serializePiApplication } from "@/repository/serialize/labatory";
import type { Pi_Application_Input } from "@/types/labatory";
import { PIApplicationStatus, prisma, Prisma } from "@labatory/db";
import type { DbClient } from "@/types/db";

/**
 * Retrieve a specific pi application by id.
 *
 * This is a DB-only function. No authentication/authorization is performed here.
 *
 * @param piApplicationId - Target pi application id.
 * @param db - Client where query will be performed. Default is prisma.
 * @returns Pi application DTO if found, otherwise null.
 */
export async function getPiApplication({
  piApplicationId,
  db = prisma,
}: {
  piApplicationId: bigint;
  db: DbClient;
}): Promise<PiApplicationDTO | null> {
  const piApplication = (await db.pIApplication.findUnique({
    where: {
      id: piApplicationId,
    },
    select: getPiApplicationSelect,
  })) as PiApplicationDbShape;
  if (!piApplication) return null;
  else return serializePiApplication(piApplication);
}

/**
 * Create PI Application.
 *
 * This is a DB-only function. Caller must ensure:
 * - Authentication/authorization (e.g., user did not submit application more than once)
 * - Input validation (vaild scholarUrl, valid labId, etc.)
 *
 * @param userId - Id of user how are submitting this pi application.
 * @param input - pi application payload(requestedName, labId, schoolEmail, ScholarUrl, note)
 * @param db - Client where query will be performed. Default is prisma.
 * @returns Pi application DTO of new application.
 */
export async function createPiApplication({
  userId,
  input,
  db = prisma,
}: {
  userId: bigint;
  input: Pi_Application_Input;
  db: DbClient;
}): Promise<PiApplicationDTO> {
  const newPiApplication = (await db.pIApplication.create({
    data: {
      userId,
      requestedName: input.requestedName,
      labId: input.labId,
      schoolEmail: input.schoolEmail,
      ScholarUrl: input.ScholarUrl,
      note: input.note,
    },
    select: getPiApplicationSelect,
  })) as PiApplicationDbShape;
  return serializePiApplication(newPiApplication);
}

/**
 * Update Pending PI Application.
 *
 * This is a DB-only function. Caller must ensure:
 * - Input validation (vaild scholarUrl, valid labId, etc.)
 *
 * @param userId - Id of user how are submitting this pi application.
 * @param input - pi application payload(requestedName, labId, schoolEmail, ScholarUrl, note)
 * @throws if pi application id is invalid.
 * @returns updated Pi application DTO.
 */
export async function updatePiApplication({
  piApplicationId,
  input,
}: {
  piApplicationId: bigint;
  input: Pi_Application_Input;
}): Promise<PiApplicationDTO> {
  try {
    const updatedPiApplication = (await prisma.pIApplication.update({
      where: {
        id: piApplicationId,
        status: "PENDING",
      },
      data: {
        requestedName: input.requestedName,
        labId: input.labId,
        schoolEmail: input.schoolEmail,
        ScholarUrl: input.ScholarUrl,
        note: input.note,
      },
      select: getPiApplicationSelect,
    })) as PiApplicationDbShape;
    return serializePiApplication(updatedPiApplication);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025")
      throw new Error("Pending Pi application does not exists.");
    else throw e;
  }
}

/**
 * Change PI Application status of Pending PI Application.
 *
 * This is a DB-only function.  No authentication/authorization is performed here.
 *
 * @param userId - Id of user how are submitting this pi application.
 * @param input - pi application payload(requestedName, labId, schoolEmail, ScholarUrl, note)
 * @param db - Client where query will be performed. Default is prisma.
 * @throws if pi application id is invalid.
 * @returns updated Pi application DTO.
 */
export async function changePiApplicationStatus({
  piApplicationId,
  newStatus,
  db = prisma,
}: {
  piApplicationId: bigint;
  newStatus: PIApplicationStatus;
  db: DbClient;
}): Promise<PiApplicationDTO> {
  try {
    const updatedPiApplication = (await db.pIApplication.update({
      where: {
        id: piApplicationId,
        status: "PENDING",
      },
      data: {
        status: newStatus,
      },
      select: getPiApplicationSelect,
    })) as PiApplicationDbShape;
    return serializePiApplication(updatedPiApplication);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025")
      throw new Error("Pending Pi application does not exists.");
    else throw e;
  }
}

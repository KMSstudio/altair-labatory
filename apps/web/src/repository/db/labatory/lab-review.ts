// src/repository/db/labatory/lab-review.ts

import { Prisma, prisma } from "@labatory/db";
import type { DbClient } from "@/types/db";
import { getLabReviewSelect } from "@/repository/dto/labatory";
import { serializeLabReview } from "@/repository/serialize/labatory";
import type { LabReviewDTO, LabReviewDbShape } from "@/repository/dto/labatory";
import type { LabReviewInput } from "@/types/labatory";

/**
 * Retrieve a specific lab review by review id.
 *
 * This is a DB-only function. No authentication/authorization is performed here.
 *
 * @param reviewId - Target review id.
 * @param db - Client where query will be performed. Default is prisma.
 *
 * @returns lab review DTO if found, otherwise null.
 */
export async function getLabReviewCore({
  reviewId,
  db = prisma,
}: {
  reviewId: bigint;
  db?: DbClient;
}): Promise<LabReviewDTO | null> {
  const review = (await db.labReview.findUnique({
    where: { id: reviewId },
    select: getLabReviewSelect,
  })) as LabReviewDbShape;
  if (!review) return null;
  return serializeLabReview(review);
}

/**
 * Retrieve all lab reviews authored by a specific user by user id.
 *
 * This is a DB-only function. No authentication/authorization is performed here.
 *
 * @param userId - ID of the author.
 * @param db - Client where query will be performed. Default is prisma.
 *
 * @returns lab review list.
 */
type LabReviewWithLab = LabReviewDbShape & { lab: { id: bigint; nameKo: string } };

export async function getLabReviewsByAuthor({
  userId,
  db = prisma,
}: {
  userId: bigint;
  db?: DbClient;
}): Promise<(LabReviewDTO & { lab: { id: string; nameKo: string } })[]> {
  const reviews = (await db.labReview.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      ...getLabReviewSelect,
      lab: {
        select: {
          id: true,
          nameKo: true,
        },
      },
    },
  })) as LabReviewWithLab[];
  return reviews.map((r) => ({
    ...serializeLabReview(r),
    lab: {
      id: r.lab.id.toString(),
      nameKo: r.lab.nameKo,
    },
  }));
}

/**
 * Retrieve the most recent lab review written by a specific user for a specific lab within the last 7 days.
 *
 * This is a DB-only function. No authentication/authorization is performed here.
 *
 * @param userId - ID of the author.
 * @param labId - ID of the target lab.
 * @returns review id and createdAt if found within 7 days, otherwise null.
 */
export async function getRecentReviewInLab(userId: bigint, labId: bigint, db: DbClient = prisma) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return db.labReview.findFirst({
    where: {
      authorId: userId,
      labId,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true },
  });
}

/**
 * Create a new lab review in the database.
 *
 * This function performs only database operations and assumes that
 * all authentication and authorization have already been completed by the caller.
 *
 * Enforces the 7-day duplicate-review rule inside the transaction to prevent
 * race conditions between the pre-flight check in the route and the actual insert.
 *
 * @param authorId - ID of the user creating the review.
 * @param labId - ID of the target laboratory.
 * @param input - Review data payload (content, scores, etc.).
 *
 * @returns Review DTO of the new review, or null if a recent review already exists.
 *
 * @throws Prisma.PrismaClientKnownRequestError
 * If a database constraint violation occurs (e.g., invalid foreign key,
 * duplicate entries, etc.).
 */
export async function CreateLabReviewCore(
  authorId: bigint,
  labId: bigint,
  input: LabReviewInput,
): Promise<LabReviewDTO | null> {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentReview = await tx.labReview.findFirst({
      where: {
        authorId,
        labId,
        createdAt: { gte: since },
      },
      select: { id: true },
    });
    if (recentReview) return null;

    const newReview = await tx.labReview.create({
      data: {
        authorId: authorId,
        labId: labId,
        content: input.content,
        recommend: input.recommend,
        atmos: input.atmos,
        lectr: input.lectr,
        paper: input.paper,
        salry: input.salry,
        persn: input.persn,
        guidance: input.guidance,
        meetFreq: input.meetFreq,
        externOk: input.externOk,
      },
      select: { id: true },
    });

    return await getLabReviewCore({ reviewId: newReview.id, db: tx });
  });
}

/**
 * Update an existing lab review and store the previous version in history.
 * This is a **DB-only function**.
 *
 * @param reviewId - Target review id to update.
 * @param input - Update payload (content, scores, etc.).
 *
 * @returns review DB shape when the review is successfully updated.
 *
 * @throws Error
 * If the target review does not exist.
 *
 * @throws Prisma.PrismaClientKnownRequestError
 * If a database constraint violation occurs.
 */
export async function UpdateLabReviewCore(
  reviewId: bigint,
  input: LabReviewInput,
): Promise<LabReviewDTO | null> {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const review = await tx.labReview.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new Error("Review not found");

    await tx.labReview.update({
      where: { id: reviewId },
      data: input,
    });

    return await getLabReviewCore({ reviewId, db: tx });
  });
}

/**
 * Retrieve all lab reviews of single lab by lab id.
 *
 * This is a DB-only function. No authentication/authorization is performed here.
 *
 * @param labId - ID of the lab.
 * @param db - Client where query will be performed. Default is prisma.
 *
 * @returns lab review list.
 */
export async function getLabReviews({
  labId,
  db = prisma,
}: {
  labId: bigint;
  db?: DbClient;
}): Promise<LabReviewDTO[]> {
  const labReviews = (await db.labReview.findMany({
    where: { labId },
    orderBy: { createdAt: "desc" },
    select: getLabReviewSelect,
  })) as LabReviewDbShape[];
  return labReviews.map(serializeLabReview);
}

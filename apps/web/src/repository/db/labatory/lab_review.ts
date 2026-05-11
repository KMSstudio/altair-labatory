import { getLabReviewSelect, LabReviewDbShape, LabReviewDTO } from "@/repository/dto/labatory";
import { serializeLabReview } from "@/repository/serialize/labatory";
import { prisma, type PrismaClient } from "@labatory/db";

export async function getLabReviewCore({
  id,
  db = prisma,
}: {
  id: bigint;
  db?: PrismaClient;
}): Promise<LabReviewDTO | null> {
  const labReview = (await db.labReview.findUnique({
    where: { id },
    select: getLabReviewSelect,
  })) as LabReviewDbShape | null;
  if (!labReview) return null;
  return serializeLabReview(labReview);
}

export async function getLabReviews({
  labId,
  db = prisma,
}: {
  labId: bigint;
  db?: PrismaClient;
}): Promise<LabReviewDTO[]> {
  const labReviews = (await db.labReview.findMany({
    where: { labId },
    select: getLabReviewSelect,
  })) as LabReviewDbShape[];
  return labReviews.map(serializeLabReview);
}

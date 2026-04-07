// src/app/lab/[lab_id]/review/actions.ts
"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@labatory/db";
import { authOptions } from "@/lib/auth";
import type { CreateLabReviewInput, UpdateLabReviewInput } from "@/repository/dto/labatory";

// -------------------------------------------------------
// QUERIES
// -------------------------------------------------------

export async function getLabReview(reviewId: bigint) {
  return prisma.labReview.findUnique({
    where: { id: reviewId },
    select: {
      id: true,
      labId: true,
      authorId: true,
      content: true,
      recommend: true,
      atmos: true,
      lectr: true,
      paper: true,
      salry: true,
      persn: true,
      guidance: true,
      meetfreq: true,
      externok: true,
      visib: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getLabReviews(labId: bigint) {
  return prisma.labReview.findMany({
    where: { labId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      labId: true,
      authorId: true,
      content: true,
      recommend: true,
      atmos: true,
      lectr: true,
      paper: true,
      salry: true,
      persn: true,
      guidance: true,
      meetfreq: true,
      externok: true,
      visib: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getMyReviews(userId: bigint) {
  return prisma.labReview.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      labId: true,
      authorId: true,
      content: true,
      recommend: true,
      atmos: true,
      lectr: true,
      paper: true,
      salry: true,
      persn: true,
      guidance: true,
      meetfreq: true,
      externok: true,
      visib: true,
      createdAt: true,
      updatedAt: true,
      lab: {
        select: { id: true, nameKo: true },
      },
    },
  });
}

export async function getRecentReviewInLab(userId: bigint, labId: bigint) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return prisma.labReview.findFirst({
    where: {
      authorId: userId,
      labId,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true },
  });
}

export async function getMyLatestReviewInLab(userId: bigint, labId: bigint) {
  return prisma.labReview.findFirst({
    where: { authorId: userId, labId },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
}

// -------------------------------------------------------
// MUTATIONS
// -------------------------------------------------------

type CreateResult =
  | { ok: true; reviewId: string }
  | { ok: false; error: "UNAUTHORIZED" | "PI_FORBIDDEN" | "TOO_SOON"; recentReviewId?: string };

export async function createLabReview(
  labId: string,
  input: CreateLabReviewInput,
): Promise<CreateResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };

  if (session.user.role === "PI") {
    return { ok: false, error: "PI_FORBIDDEN" };
  }

  const userId = BigInt(session.user.id);
  const labIdBig = BigInt(labId);

  const recent = await getRecentReviewInLab(userId, labIdBig);
  if (recent) {
    return { ok: false, error: "TOO_SOON", recentReviewId: recent.id.toString() };
  }

  const review = await prisma.labReview.create({
    data: {
      labId: labIdBig,
      authorId: userId,
      content: input.content,
      recommend: input.recommend,
      atmos: input.atmos,
      lectr: input.lectr,
      paper: input.paper,
      salry: input.salry,
      persn: input.persn,
      guidance: input.guidance ?? null,
      meetfreq: input.meetfreq ?? null,
      externok: input.externok ?? null,
    },
    select: { id: true },
  });

  return { ok: true, reviewId: review.id.toString() };
}

type UpdateResult = { ok: true } | { ok: false; error: "UNAUTHORIZED" | "NOT_FOUND" | "FORBIDDEN" };

export async function updateLabReview(
  reviewId: string,
  input: UpdateLabReviewInput,
): Promise<UpdateResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };

  const review = await getLabReview(BigInt(reviewId));
  if (!review) return { ok: false, error: "NOT_FOUND" };

  const userId = BigInt(session.user.id);
  const isAdmin = session.user.role === "ADMIN";
  const isAuthor = review.authorId === userId;

  if (!isAdmin && !isAuthor) return { ok: false, error: "FORBIDDEN" };

  await prisma.labReview.update({
    where: { id: BigInt(reviewId) },
    data: {
      ...(input.content !== undefined && { content: input.content }),
      ...(input.recommend !== undefined && { recommend: input.recommend }),
      ...(input.atmos !== undefined && { atmos: input.atmos }),
      ...(input.lectr !== undefined && { lectr: input.lectr }),
      ...(input.paper !== undefined && { paper: input.paper }),
      ...(input.salry !== undefined && { salry: input.salry }),
      ...(input.persn !== undefined && { persn: input.persn }),
      ...(input.guidance !== undefined && { guidance: input.guidance }),
      ...(input.meetfreq !== undefined && { meetfreq: input.meetfreq }),
      ...(input.externok !== undefined && { externok: input.externok }),
    },
  });

  return { ok: true };
}

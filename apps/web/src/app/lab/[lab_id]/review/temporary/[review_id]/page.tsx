// src/app/lab/[lab_id]/review/temporary/[review_id]/page.tsx

import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@labatory/db";
import { getLabReview } from "../../actions";
import { LabReviewCard } from "./_components/LabReviewCard";

type Props = {
  params: Promise<{ lab_id: string; review_id: string }>;
};

export default async function TemporaryReviewPage({ params }: Props) {
  const { lab_id, review_id } = await params;

  let reviewId: bigint;
  try {
    reviewId = BigInt(review_id);
  } catch {
    notFound();
  }

  const [session, review] = await Promise.all([
    getServerSession(authOptions),
    getLabReview(reviewId),
  ]);

  if (!review) notFound();

  const lab = await prisma.lab.findUnique({
    where: { id: review.labId },
    select: { id: true, nameKo: true },
  });
  if (!lab) notFound();

  return (
    <LabReviewCard
      review={{
        id: review.id.toString(),
        labId: review.labId.toString(),
        authorId: review.authorId.toString(),
        content: review.content,
        recommend: review.recommend,
        atmos: review.atmos,
        lectr: review.lectr,
        paper: review.paper,
        salry: review.salry,
        persn: review.persn,
        guidance: review.guidance,
        meetfreq: review.meetfreq,
        externok: review.externok,
        visib: review.visib,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
      }}
      labName={lab.nameKo}
      labId={lab_id}
      currentUserId={session?.user?.id ?? null}
    />
  );
}

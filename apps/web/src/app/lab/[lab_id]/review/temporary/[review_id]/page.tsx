// src/app/lab/[lab_id]/review/temporary/[review_id]/page.tsx

import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLabReviewCore } from "@/repository/db/labatory/lab-review";
import { getLabCore } from "@/repository/db/labatory/labatory";
import { LabReviewCard } from "./_components/LabReviewCard";

type Params = {
  params: Promise<{ lab_id: string; review_id: string }>;
};

export default async function TemporaryReviewPage({ params }: Params) {
  const { lab_id, review_id } = await params;

  let labId: bigint;
  try {
    labId = BigInt(lab_id);
  } catch {
    notFound();
  }

  let reviewId: bigint;
  try {
    reviewId = BigInt(review_id);
  } catch {
    notFound();
  }

  const [session, lab, review] = await Promise.all([
    getServerSession(authOptions),
    getLabCore({ id: labId }),
    getLabReviewCore({ reviewId }),
  ]);

  if (!lab || !review || BigInt(review.labId) !== labId) notFound();

  return (
    <LabReviewCard review={review} labName={lab.nameKo} currentUserId={session?.user?.id ?? null} />
  );
}

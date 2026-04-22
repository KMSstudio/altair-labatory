// src/app/lab/[lab_id]/review/edit/[review_id]/page.tsx

import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLabReviewCore } from "@/repository/db/labatory/lab-review";
import { EditReviewForm } from "./_components/EditReviewForm";

type Params = {
  params: Promise<{ lab_id: string; review_id: string }>;
};

export default async function EditReviewPage({ params }: Params) {
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

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  const review = await getLabReviewCore({ reviewId });

  if (!review || BigInt(review.labId) !== labId) notFound();

  const isAdmin = session.user.role === "ADMIN";
  const isAuthor = review.authorId === session.user.id;

  if (!isAdmin && !isAuthor) {
    redirect("/");
  }

  return <EditReviewForm review={review} />;
}

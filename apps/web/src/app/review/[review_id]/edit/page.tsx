// src/app/review/[review_id]/edit/page.tsx

import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLabReviewCore } from "@/repository/db/labatory/lab-review";
import { EditReviewForm } from "./_components/EditReviewForm";

type Params = {
  params: Promise<{ review_id: string }>;
};

function parseBigInt(value: unknown) {
  try {
    return BigInt(value as string);
  } catch {
    return null;
  }
}

export default async function EditReviewPage({ params }: Params) {
  const { review_id } = await params;

  const reviewId = parseBigInt(review_id);
  if (reviewId === null) {
    notFound();
  }

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  const review = await getLabReviewCore({ reviewId });

  if (!review) notFound();

  const isAdmin = session.user.role === "ADMIN";
  const isAuthor = review.authorId === session.user.id;

  if (!isAdmin && !isAuthor) {
    redirect("/");
  }

  return <EditReviewForm review={review} />;
}

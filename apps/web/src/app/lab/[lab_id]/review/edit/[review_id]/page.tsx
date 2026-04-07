// src/app/lab/[lab_id]/review/edit/[review_id]/page.tsx

import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLabReview } from "../../actions";
import { EditReviewForm } from "./_components/EditReviewForm";

type Props = {
  params: Promise<{ lab_id: string; review_id: string }>;
};

export default async function EditReviewPage({ params }: Props) {
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

  // 비로그인
  if (!session?.user) {
    return <EditReviewForm review={null} unauthorized labId={lab_id} reviewId={review_id} />;
  }

  const userId = BigInt(session.user.id);
  const isAdmin = session.user.role === "ADMIN";
  const isAuthor = review.authorId === userId;

  // 수정 권한 없음
  if (!isAdmin && !isAuthor) {
    return <EditReviewForm review={null} forbidden labId={lab_id} reviewId={review_id} />;
  }

  return (
    <EditReviewForm
      review={{
        id: review.id.toString(),
        labId: review.labId.toString(),
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
      }}
      labId={lab_id}
      reviewId={review_id}
    />
  );
}

// src/app/lab/[lab_id]/review/new/page.tsx

import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@labatory/db";
import { getRecentReviewInLab } from "../actions";
import { ReviewForm } from "./_components/ReviewForm";

type Props = {
  params: Promise<{ lab_id: string }>;
};

export default async function NewReviewPage({ params }: Props) {
  const { lab_id } = await params;

  let labId: bigint;
  try {
    labId = BigInt(lab_id);
  } catch {
    notFound();
  }

  const [session, lab] = await Promise.all([
    getServerSession(authOptions),
    prisma.lab.findUnique({
      where: { id: labId },
      select: { id: true, nameKo: true },
    }),
  ]);

  if (!lab) notFound();

  // 비로그인은 페이지 자체를 열어주지 않음
  if (!session?.user) {
    return (
      <ReviewForm
        labId={lab_id}
        labName={lab.nameKo}
        isPi={false}
        recentReviewId={null}
        unauthorized
      />
    );
  }

  const isPi = session.user.role === "PI";

  // PI면 recentReview 조회 불필요
  if (isPi) {
    return <ReviewForm labId={lab_id} labName={lab.nameKo} isPi recentReviewId={null} />;
  }

  const userId = BigInt(session.user.id);
  const recentReview = await getRecentReviewInLab(userId, labId);

  return (
    <ReviewForm
      labId={lab_id}
      labName={lab.nameKo}
      isPi={false}
      recentReviewId={recentReview?.id.toString() ?? null}
    />
  );
}

// src/app/lab/[lab_id]/review/new/page.tsx

import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLabCore } from "@/repository/db/labatory/labatory";
import { getRecentReviewInLab } from "@/repository/db/labatory/lab-review";
import { CreateReviewForm } from "./_components/CreateReviewForm";

type Params = {
  params: Promise<{ lab_id: string }>;
};

export default async function NewReviewPage({ params }: Params) {
  const { lab_id } = await params;

  let labId: bigint;
  try {
    labId = BigInt(lab_id);
  } catch {
    notFound();
  }

  const [session, lab] = await Promise.all([
    getServerSession(authOptions),
    getLabCore({ id: labId }),
  ]);

  if (!lab) notFound();

  if (!session?.user) {
    redirect("/");
  }

  const isPi = session.user.role === "PI";

  if (isPi) {
    redirect("/");
  }

  const userId = BigInt(session.user.id);
  const recentReview = await getRecentReviewInLab(userId, labId);

  return (
    <CreateReviewForm
      labId={lab_id}
      labName={lab.nameKo}
      recentReviewId={recentReview?.id.toString() ?? null}
    />
  );
}

// @/app/lab/[lab_id]/review/edit/[review_id]/_components/EditReviewForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ReviewForm } from "@/app/lab/_components/ReviewForm";
import styles from "../../../../../lab.module.css";
import type { LabReviewDTO } from "@/repository/dto/labatory";

type Props = {
  review: LabReviewDTO | null;
};

export function EditReviewForm({ review }: Props) {
  const router = useRouter();

  const labId = review!.labId;
  const reviewId = review!.id;
  const [content, setContent] = useState(review!.content);
  const [recommend, setRecommend] = useState<boolean | null>(review!.recommend);
  const [score, setScore] = useState({
    atmos: review!.atmos,
    lectr: review!.lectr,
    paper: review!.paper,
    salry: review!.salry,
    persn: review!.persn,
  });
  const [neutral, setNeutral] = useState({
    guidance: review!.guidance,
    meetFreq: review!.meetFreq,
    externOk: review!.externOk,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (recommend === null) {
      setError("추천 여부를 선택해주세요.");
      return;
    }
    if (Object.values(score).some((v) => v === 0)) {
      setError("모든 항목을 평가해주세요.");
      return;
    }

    setSubmitting(true);
    setError(null);

    let res: Response;
    try {
      res = await fetch(`/api/lab/${labId}/review/edit/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, recommend, ...score, ...neutral }),
      });
    } catch {
      setSubmitting(false);
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
      return;
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.ok) {
      setSubmitting(false);
      if (res.status === 404) {
        router.replace(`/lab/${labId}`);
        return;
      }
      setError("오류가 발생했습니다. 다시 시도해주세요.");
      return;
    }

    router.replace(`/lab/${labId}/review/temporary/${reviewId}`);
  };

  return (
    <main className={styles.labShell}>
      <header className={styles.labHeader}>
        <div>
          <p className={styles.eyebrow}>
            /lab/{labId}/review/edit/{reviewId}
          </p>
          <h1>리뷰 수정</h1>
        </div>
        <Link href={`/lab/${labId}`} className={styles.ghost}>
          ← Back
        </Link>
      </header>

      <ReviewForm
        recommend={recommend}
        onRecommendChange={setRecommend}
        score={score}
        onScoreChange={(field, value) => setScore((prev) => ({ ...prev, [field]: value }))}
        neutral={neutral}
        onNeutralChange={(field, value) => setNeutral((prev) => ({ ...prev, [field]: value }))}
        content={content}
        onContentChange={setContent}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
        submitLabel="수정 완료"
      />
    </main>
  );
}

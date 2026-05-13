// src/app/lab/[lab_id]/review/_components/CreateReviewForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ReviewForm } from "@/app/review/_components/ReviewForm";
import styles from "../../../lab.module.css";

type Props = {
  labId: string;
  labName: string;
  recentReviewId: string | null;
};

export function CreateReviewForm({ labId, labName, recentReviewId }: Props) {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [score, setScore] = useState({ atmos: 0, lectr: 0, paper: 0, salry: 0, persn: 0 });
  const [neutral, setNeutral] = useState({
    guidance: null as number | null,
    meetFreq: null as number | null,
    externOk: null as number | null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBlocked = recentReviewId !== null;

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
      res = await fetch("/api/review/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labid: Number(labId),
          review: { content, recommend, ...score, ...neutral },
        }),
      });
    } catch {
      setSubmitting(false);
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
      return;
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.ok) {
      setSubmitting(false);
      if (data.error === "TOO_SOON") {
        alert("같은 랩에 7일 이내 연속하여 리뷰를 쓸 수 없습니다.");
        if (data.recentReviewId) {
          router.replace(`/review/${data.recentReviewId}/edit`);
        }
        return;
      }
      setError("오류가 발생했습니다. 다시 시도해주세요.");
      return;
    }

    router.replace(`/lab/${labId}/review/temporary/${data.reviewId}`);
  };

  return (
    <main
      className={styles.labShell}
      style={isBlocked ? { pointerEvents: "none", opacity: 0.5 } : {}}
    >
      <header className={styles.labHeader}>
        <div>
          <p className={styles.eyebrow}>/lab/{labId}/review</p>
          <h1>{labName} 리뷰 작성</h1>
        </div>
        <Link href={`/lab/${labId}`} className={styles.ghost}>
          ← Back
        </Link>
      </header>

      {isBlocked && (
        <section className={styles.panel} style={{ pointerEvents: "auto" }}>
          <p style={{ color: "#b91c1c", fontWeight: 600 }}>
            같은 랩에 7일 이내 연속하여 리뷰를 쓸 수 없습니다.
          </p>
          <Link
            href={`/review/${recentReviewId}/edit`}
            className={styles.primary}
            style={{ marginTop: "0.5rem", display: "inline-flex" }}
          >
            최근 리뷰 수정하러 가기 →
          </Link>
        </section>
      )}

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
        submitLabel="리뷰 작성"
      />
    </main>
  );
}

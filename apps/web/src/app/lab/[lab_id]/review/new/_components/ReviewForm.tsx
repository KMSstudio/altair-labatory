// src/app/lab/[lab_id]/review/new/_components/ReviewForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createLabReview } from "../../actions";
import styles from "../../../../lab.module.css";
import type { CreateLabReviewInput } from "@/repository/dto/labatory";

type Props = {
  labId: string;
  labName: string;
  isPi: boolean;
  recentReviewId: string | null;
  unauthorized?: boolean;
};

const SCORE_FIELDS: {
  field: keyof Pick<CreateLabReviewInput, "atmos" | "lectr" | "paper" | "salry" | "persn">;
  label: string;
}[] = [
  { field: "atmos", label: "연구실 분위기" },
  { field: "lectr", label: "강의 전달력" },
  { field: "paper", label: "논문 지도력" },
  { field: "salry", label: "실질 인건비" },
  { field: "persn", label: "인품" },
];

const SCORE_LABELS: Record<number, string> = {
  1: "매우 나쁨",
  2: "나쁨",
  3: "보통",
  4: "좋음",
  5: "매우 좋음",
};

const NEUTRAL_FIELDS: {
  field: "guidance" | "meetfreq" | "externok";
  label: string;
  left: string;
  right: string;
}[] = [
  { field: "guidance", label: "지도 개입 정도", left: "간섭형", right: "방임형" },
  { field: "meetfreq", label: "미팅 주기", left: "없음", right: "주 3회" },
  { field: "externok", label: "외부 활동 허용", left: "비선호", right: "권장" },
];

export function ReviewForm({ labId, labName, isPi, recentReviewId, unauthorized }: Props) {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [scores, setScores] = useState({ atmos: 0, lectr: 0, paper: 0, salry: 0, persn: 0 });
  const [neutral, setNeutral] = useState<{
    guidance: number | null;
    meetfreq: number | null;
    externok: number | null;
  }>({ guidance: null, meetfreq: null, externok: null });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PI 진입 시 alert + redirect
  useEffect(() => {
    if (isPi) {
      alert("PI는 리뷰를 작성할 수 없습니다.");
      router.replace("/");
    }
  }, [isPi, router]);

  // 비로그인 진입 시 redirect
  useEffect(() => {
    if (unauthorized) {
      router.replace("/");
    }
  }, [unauthorized, router]);

  const isBlocked = recentReviewId !== null;

  const handleSubmit = async () => {
    if (recommend === null) {
      setError("추천 여부를 선택해주세요.");
      return;
    }
    if (Object.values(scores).some((v) => v === 0)) {
      setError("모든 항목을 평가해주세요.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await createLabReview(labId, {
      content,
      recommend,
      ...scores,
      guidance: neutral.guidance,
      meetfreq: neutral.meetfreq,
      externok: neutral.externok,
    });

    if (!result.ok) {
      setSubmitting(false);
      if (result.error === "PI_FORBIDDEN") {
        alert("PI는 리뷰를 작성할 수 없습니다.");
        router.replace("/");
        return;
      }
      if (result.error === "TOO_SOON") {
        alert("같은 랩에 7일 이내 연속하여 리뷰를 달 수 없습니다.");
        if (result.recentReviewId) {
          router.replace(`/lab/${labId}/review/edit/${result.recentReviewId}`);
        }
        return;
      }
      if (result.error === "UNAUTHORIZED") {
        router.replace("/");
        return;
      }
      setError("오류가 발생했습니다. 다시 시도해주세요.");
      return;
    }

    router.replace(`/lab/${labId}/review/temporary/${result.reviewId}`);
  };

  // PI / 비로그인은 렌더링 최소화
  if (isPi || unauthorized) return null;

  return (
    <main
      className={styles.labShell}
      style={isBlocked ? { pointerEvents: "none", opacity: 0.5 } : {}}
    >
      <header className={styles.labHeader}>
        <div>
          <p className={styles.eyebrow}>/lab/{labId}/review/new</p>
          <h1>{labName} 리뷰 작성</h1>
        </div>
        <Link href={`/lab/${labId}`} className={styles.ghost}>
          ← Back
        </Link>
      </header>

      {/* 7일 이내 중복 안내 */}
      {isBlocked && (
        <section className={styles.panel} style={{ pointerEvents: "auto" }}>
          <p style={{ color: "#b91c1c", fontWeight: 600 }}>
            같은 랩에 7일 이내 연속하여 리뷰를 달 수 없습니다.
          </p>
          <Link
            href={`/lab/${labId}/review/edit/${recentReviewId}`}
            className={styles.primary}
            style={{ marginTop: "0.5rem", display: "inline-flex" }}
          >
            최근 리뷰 수정하러 가기 →
          </Link>
        </section>
      )}

      {/* 추천 여부 */}
      <section className={styles.panel}>
        <p className={styles.eyebrow}>추천 여부</p>
        <div className={styles.actions}>
          <button
            className={recommend === true ? styles.primary : styles.ghost}
            onClick={() => setRecommend(true)}
          >
            👍 추천
          </button>
          <button
            className={recommend === false ? styles.danger : styles.ghost}
            onClick={() => setRecommend(false)}
          >
            👎 비추천
          </button>
        </div>
      </section>

      {/* 5단계 평가 */}
      <section className={styles.panel}>
        <p className={styles.eyebrow}>항목별 평가</p>
        <div style={{ display: "grid", gap: "1rem" }}>
          {SCORE_FIELDS.map(({ field, label }) => (
            <div key={field}>
              <p className={styles.eyebrow}>{label}</p>
              <div className={styles.actions}>
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => setScores((prev) => ({ ...prev, [field]: v }))}
                    className={scores[field] === v ? styles.primary : styles.ghost}
                  >
                    {v}
                  </button>
                ))}
                {scores[field] > 0 && (
                  <span className={styles.muted}>{SCORE_LABELS[scores[field]]}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 중립 슬라이더 */}
      <section className={styles.panel}>
        <p className={styles.eyebrow}>정보성 평가 (선택)</p>
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {NEUTRAL_FIELDS.map(({ field, label, left, right }) => (
            <div key={field}>
              <p className={styles.eyebrow}>{label}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span className={styles.muted}>{left}</span>
                <input
                  type="range"
                  min={-3}
                  max={3}
                  step={0.1}
                  value={neutral[field] ?? 0}
                  onChange={(e) =>
                    setNeutral((prev) => ({ ...prev, [field]: Number(e.target.value) }))
                  }
                  style={{ flex: 1 }}
                />
                <span className={styles.muted}>{right}</span>
                <span style={{ minWidth: "2rem", textAlign: "center", fontWeight: 600 }}>
                  {neutral[field] ?? 0}
                </span>
              </div>
              <button
                className={styles.ghost}
                style={{ marginTop: "0.35rem", fontSize: "0.8rem" }}
                onClick={() => setNeutral((prev) => ({ ...prev, [field]: null }))}
              >
                응답 안함
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 한줄평 */}
      <section className={styles.panel}>
        <p className={styles.eyebrow}>한줄평 (선택)</p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="자유롭게 작성해주세요."
          rows={5}
          style={{
            padding: "0.7rem 0.8rem",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "1rem",
            resize: "vertical",
            width: "100%",
          }}
        />
      </section>

      {/* 에러 및 제출 */}
      <div className={`${styles.actions} ${styles.actionsEnd}`}>
        {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
        <button className={styles.primary} onClick={handleSubmit} disabled={submitting}>
          {submitting ? "제출 중..." : "리뷰 작성"}
        </button>
      </div>
    </main>
  );
}

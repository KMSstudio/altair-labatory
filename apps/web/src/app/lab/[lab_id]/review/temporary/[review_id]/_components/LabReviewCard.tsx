// src/app/lab/[lab_id]/review/temporary/[review_id]/_components/LabReviewCard.tsx

import Link from "next/link";
import type { LabReviewDTO } from "@/repository/dto/labatory";
import styles from "../../../../../lab.module.css";

type Props = {
  review: LabReviewDTO;
  labName: string;
  labId: string;
  currentUserId: string | null;
};

const SCORE_META: {
  field: keyof Pick<LabReviewDTO, "atmos" | "lectr" | "paper" | "salry" | "persn">;
  label: string;
}[] = [
  { field: "atmos", label: "연구실 분위기" },
  { field: "lectr", label: "강의 전달력" },
  { field: "paper", label: "논문 지도력" },
  { field: "salry", label: "실질 인건비" },
  { field: "persn", label: "인품" },
];

const NEUTRAL_META: {
  field: keyof Pick<LabReviewDTO, "guidance" | "meetfreq" | "externok">;
  label: string;
  left: string;
  right: string;
}[] = [
  { field: "guidance", label: "지도 개입 정도", left: "간섭형", right: "방임형" },
  { field: "meetfreq", label: "미팅 주기", left: "없음", right: "주 3회" },
  { field: "externok", label: "외부 활동 허용", left: "비선호", right: "권장" },
];

function ScoreBar({ value }: { value: number }) {
  return (
    <div style={{ display: "flex", gap: "0.25rem" }}>
      {[1, 2, 3, 4, 5].map((v) => (
        <div
          key={v}
          style={{
            width: "1.5rem",
            height: "1.5rem",
            borderRadius: "4px",
            background: v <= value ? "#111827" : "#e5e7eb",
          }}
        />
      ))}
    </div>
  );
}

function NeutralBar({ value, left, right }: { value: number; left: string; right: string }) {
  // -3 ~ 3 을 0 ~ 100% 로 변환
  const percent = ((value + 3) / 6) * 100;
  return (
    <div style={{ display: "grid", gap: "0.25rem" }}>
      <div
        style={{
          position: "relative",
          height: "8px",
          background: "#e5e7eb",
          borderRadius: "999px",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${percent}%`,
            transform: "translateX(-50%)",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "#111827",
            top: "-3px",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span className={styles.muted} style={{ fontSize: "0.75rem" }}>
          {left}
        </span>
        <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{value}</span>
        <span className={styles.muted} style={{ fontSize: "0.75rem" }}>
          {right}
        </span>
      </div>
    </div>
  );
}

export function LabReviewCard({ review, labName, labId, currentUserId }: Props) {
  const isAuthor = currentUserId !== null && currentUserId === review.authorId;
  const hasNeutral =
    review.guidance !== null || review.meetfreq !== null || review.externok !== null;

  return (
    <main className={styles.labShell}>
      <header className={styles.labHeader}>
        <div>
          <p className={styles.eyebrow}>/lab/{labId}/review</p>
          <h1>{labName}</h1>
        </div>
        <div className={styles.actions}>
          <Link href={`/lab/${labId}`} className={styles.ghost}>
            ← Back
          </Link>
          {isAuthor && (
            <Link href={`/lab/${labId}/review/edit/${review.id}`} className={styles.primary}>
              수정
            </Link>
          )}
        </div>
      </header>

      {/* 추천 여부 */}
      <section className={styles.panel}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "2rem" }}>{review.recommend ? "👍" : "👎"}</span>
          <div>
            <p className={styles.eyebrow}>추천 여부</p>
            <p className={styles.value}>{review.recommend ? "추천" : "비추천"}</p>
          </div>
        </div>
      </section>

      {/* 5단계 평가 */}
      <section className={styles.panel}>
        <p className={styles.eyebrow}>항목별 평가</p>
        <div className={styles.grid}>
          {SCORE_META.map(({ field, label }) => (
            <div key={field} style={{ display: "grid", gap: "0.4rem" }}>
              <p className={styles.eyebrow}>{label}</p>
              <ScoreBar value={review[field]} />
            </div>
          ))}
        </div>
      </section>

      {/* 중립 평가 */}
      {hasNeutral && (
        <section className={styles.panel}>
          <p className={styles.eyebrow}>정보성 평가</p>
          <div style={{ display: "grid", gap: "1.25rem" }}>
            {NEUTRAL_META.map(({ field, label, left, right }) =>
              review[field] !== null ? (
                <div key={field} style={{ display: "grid", gap: "0.35rem" }}>
                  <p className={styles.eyebrow}>{label}</p>
                  <NeutralBar value={review[field]!} left={left} right={right} />
                </div>
              ) : null,
            )}
          </div>
        </section>
      )}

      {/* 한줄평 */}
      {review.content && (
        <section className={styles.panel}>
          <p className={styles.eyebrow}>한줄평</p>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{review.content}</p>
        </section>
      )}

      {/* 메타 */}
      <section className={`${styles.panel} ${styles.grid}`}>
        <div>
          <p className={styles.eyebrow}>작성일</p>
          <p className={styles.value}>{new Date(review.createdAt).toLocaleDateString("ko-KR")}</p>
        </div>
        <div>
          <p className={styles.eyebrow}>수정일</p>
          <p className={styles.value}>{new Date(review.updatedAt).toLocaleDateString("ko-KR")}</p>
        </div>
        <div>
          <p className={styles.eyebrow}>공개 여부</p>
          <p className={styles.value}>{review.visib === "PUBLIC" ? "공개" : "비공개"}</p>
        </div>
      </section>
    </main>
  );
}

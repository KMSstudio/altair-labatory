// src/app/lab/[lab_id]/review/temporary/[review_id]/_components/LabReviewCard.tsx

import Link from "next/link";
import type { LabReviewDTO } from "@/repository/dto/labatory";
import styles from "../../../../../lab.module.css";
import {
  LABATORY_REVIEW_SCORE_FIELDS,
  LABATORY_REVIEW_NEUTRAL_FIELDS,
} from "@/util/labatory.constant";

type Props = {
  review: LabReviewDTO;
  labName: string;
  currentUserId: string | null;
};

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

export function LabReviewCard({ review, labName, currentUserId }: Props) {
  const isAuthor = currentUserId !== null && currentUserId === review.authorId;
  const hasNeutral =
    review.guidance !== null || review.meetFreq !== null || review.externOk !== null;

  return (
    <main className={styles.labShell}>
      <header className={styles.labHeader}>
        <div>
          <p className={styles.eyebrow}>/lab/{review.labId}/review</p>
          <h1>{labName}</h1>
        </div>
        <div className={styles.actions}>
          <Link href={`/lab/${review.labId}`} className={styles.ghost}>
            ← Back
          </Link>
          {isAuthor && (
            <Link href={`/review/${review.id}/edit`} className={styles.primary}>
              수정
            </Link>
          )}
        </div>
      </header>

      <section className={styles.panel}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "2rem" }}>{review.recommend ? "추천" : "비추천"}</span>
          <div>
            <p className={styles.eyebrow}>추천 여부</p>
            <p className={styles.value}>{review.recommend ? "추천" : "비추천"}</p>
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <p className={styles.eyebrow}>항목별 평가</p>
        <div className={styles.grid}>
          {LABATORY_REVIEW_SCORE_FIELDS.map(({ field, label }) => (
            <div key={field} style={{ display: "grid", gap: "0.4rem" }}>
              <p className={styles.eyebrow}>{label}</p>
              <ScoreBar value={review[field]} />
            </div>
          ))}
        </div>
      </section>

      {hasNeutral && (
        <section className={styles.panel}>
          <p className={styles.eyebrow}>정보성 평가</p>
          <div style={{ display: "grid", gap: "1.25rem" }}>
            {LABATORY_REVIEW_NEUTRAL_FIELDS.map(({ field, label, left, right }) =>
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

      {review.content && (
        <section className={styles.panel}>
          <p className={styles.eyebrow}>한줄평</p>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{review.content}</p>
        </section>
      )}

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

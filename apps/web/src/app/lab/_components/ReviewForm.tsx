// @/app/lab/[lab_id]/review/_components/ReviewForm.tsx

"use client";

import styles from "../lab.module.css";
import {
  LABATORY_REVIEW_SCORE_FIELDS,
  LABATORY_REVIEW_SCORE_LABELS,
  LABATORY_REVIEW_NEUTRAL_FIELDS,
} from "@/util/labatory.constant";

type ScoreState = {
  atmos: number;
  lectr: number;
  paper: number;
  salry: number;
  persn: number;
};

type NeutralState = {
  guidance: number | null;
  meetFreq: number | null;
  externOk: number | null;
};

type Props = {
  recommend: boolean | null;
  onRecommendChange: (value: boolean) => void;
  score: ScoreState;
  onScoreChange: (field: keyof ScoreState, value: number) => void;
  neutral: NeutralState;
  onNeutralChange: (field: keyof NeutralState, value: number | null) => void;
  content: string;
  onContentChange: (value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
};

export function ReviewForm({
  recommend,
  onRecommendChange,
  score,
  onScoreChange,
  neutral,
  onNeutralChange,
  content,
  onContentChange,
  onSubmit,
  submitting,
  error,
  submitLabel,
}: Props) {
  return (
    <>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>추천 여부</p>
        <div className={styles.actions}>
          <button
            className={recommend === true ? styles.primary : styles.ghost}
            onClick={() => onRecommendChange(true)}
          >
            추천
          </button>
          <button
            className={recommend === false ? styles.danger : styles.ghost}
            onClick={() => onRecommendChange(false)}
          >
            비추천
          </button>
        </div>
      </section>

      <section className={styles.panel}>
        <p className={styles.eyebrow}>항목별 평가</p>
        <div style={{ display: "grid", gap: "1rem" }}>
          {LABATORY_REVIEW_SCORE_FIELDS.map(({ field, label }) => (
            <fieldset key={field} style={{ border: "none", padding: 0, margin: 0 }}>
              <legend className={styles.eyebrow}>{label}</legend>
              <div className={styles.actions}>
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => onScoreChange(field, v)}
                    className={score[field] === v ? styles.primary : styles.ghost}
                  >
                    {v}
                  </button>
                ))}
                {score[field] > 0 && (
                  <span className={styles.muted}>{LABATORY_REVIEW_SCORE_LABELS[score[field]]}</span>
                )}
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <p className={styles.eyebrow}>정보성 평가 (선택)</p>
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {LABATORY_REVIEW_NEUTRAL_FIELDS.map(({ field, label, left, right }) => {
            const inputId = `neutral-${field}`;
            return (
              <div key={field}>
                <label htmlFor={inputId} className={styles.eyebrow}>
                  {label}
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span className={styles.muted}>{left}</span>
                  <input
                    id={inputId}
                    type="range"
                    min={-3}
                    max={3}
                    step={0.5}
                    value={neutral[field] ?? 0}
                    onChange={(e) => onNeutralChange(field, Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <span className={styles.muted}>{right}</span>
                  <span style={{ minWidth: "2rem", textAlign: "center", fontWeight: 600 }}>
                    {neutral[field] ?? "응답 안함"}
                  </span>
                </div>
                <button
                  className={styles.ghost}
                  style={{ marginTop: "0.35rem", fontSize: "0.8rem" }}
                  onClick={() => onNeutralChange(field, null)}
                >
                  응답 안함
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.panel}>
        <label htmlFor="review-content" className={styles.eyebrow}>
          한줄평 (선택)
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
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

      <div className={`${styles.actions} ${styles.actionsEnd}`}>
        {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
        <button className={styles.primary} onClick={onSubmit} disabled={submitting}>
          {submitting ? "처리 중..." : submitLabel}
        </button>
      </div>
    </>
  );
}
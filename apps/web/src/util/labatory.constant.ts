import type { LabReviewInput } from "@/types/labatory";

type LabatoryReviewRequiredScoreField = keyof Pick<
  LabReviewInput,
  "atmos" | "lectr" | "paper" | "salry" | "persn"
>;

type LabatoryReviewOptionalScoreField = keyof Pick<
  LabReviewInput,
  "guidance" | "meetFreq" | "externOk"
>;

/**
 * Numeric lab review score fields that are required on create/update.
 * Each value is stored as a 1-5 rating.
 */
export const LABATORY_REVIEW_REQUIRED_SCORE_FIELD_NAMES: readonly LabatoryReviewRequiredScoreField[] =
  ["atmos", "lectr", "paper", "salry", "persn"] as const;

/**
 * Optional lab review score fields that are submitted on create/update.
 * Each value may be null, or a -3 to 3 rating when answered.
 */
export const LABATORY_REVIEW_OPTIONAL_SCORE_FIELD_NAMES: readonly LabatoryReviewOptionalScoreField[] =
  ["guidance", "meetFreq", "externOk"] as const;

export const LABATORY_REVIEW_SCORE_FIELDS: {
  field: LabatoryReviewRequiredScoreField;
  label: string;
}[] = [
  { field: "atmos", label: "연구실 분위기" },
  { field: "lectr", label: "강의 전달력" },
  { field: "paper", label: "논문 지도력" },
  { field: "salry", label: "실질 인건비" },
  { field: "persn", label: "인품" },
] as const;

export const LABATORY_REVIEW_SCORE_LABELS: Record<number, string> = {
  1: "매우 나쁨",
  2: "나쁨",
  3: "보통",
  4: "좋음",
  5: "매우 좋음",
} as const;

export const LABATORY_REVIEW_NEUTRAL_FIELDS: {
  field: LabatoryReviewOptionalScoreField;
  label: string;
  left: string;
  right: string;
}[] = [
  { field: "guidance", label: "지도 개입 정도", left: "간섭형", right: "방임형" },
  { field: "meetFreq", label: "미팅 주기", left: "없음", right: "주 3회" },
  { field: "externOk", label: "외부 활동 허용", left: "비선호", right: "권장" },
] as const;

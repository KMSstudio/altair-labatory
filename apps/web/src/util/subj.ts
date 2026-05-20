import { requireText, normalizeText2String } from "@/util/util";

export type SubjectInput = {
  nameKo: string;
  nameEn: string;
  description: string | null;
  isActive: boolean;
};

/**
 * Convert form data into the subject input DTO.
 * @param formData - Submitted form data.
 * @returns Parsed subject input.
 */
export const parseSubjectInput = (formData: FormData): SubjectInput => ({
  nameKo: requireText(formData.get("nameKo"), "name_ko"),
  nameEn: requireText(formData.get("nameEn"), "name_en"),
  description: normalizeText2String(formData.get("description")),
  isActive: formData.get("isActive") === "on",
});

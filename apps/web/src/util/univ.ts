import { requireText, normalizeText2String } from "@/util/util";

export type UnivInput = {
  nameKo: string;
  nameEn: string | null;
  country: string | null;
  websiteUrl: string | null;
  domain: string | null;
};

/**
 * Convert form data into the university input DTO.
 * @param formData - Submitted form data.
 * @returns Parsed university input.
 */
export const parseUnivInput = (formData: FormData): UnivInput => ({
  nameKo: requireText(formData.get("nameKo"), "Korean name"),
  nameEn: normalizeText2String(formData.get("nameEn")),
  country: normalizeText2String(formData.get("country")),
  websiteUrl: normalizeText2String(formData.get("websiteUrl")),
  domain: normalizeText2String(formData.get("domain")),
});

import { requireText, normalizeText2String } from "@/util/util";

export type PiInput = {
  name: string;
  email: string;
  scholarUrl: string;
};

export type PiApplicationInput = {
  requestedName: string;
  scholarUrl: string;
  note: string | null;
};

/**
 * Convert form data into the Pi input DTO.
 * @param formData - Submitted form data.
 * @returns Parsed Pi input.
 */
export const parsePiInput = (formData: FormData): PiInput => ({
  name: requireText(formData.get("name"), "name"),
  email: requireText(formData.get("email"), "email"),
  scholarUrl: requireText(formData.get("scholarUrl"), "scholar_url"),
});

/**
 * Convert form data into the Pi input DTO.
 * @param formData - Submitted form data.
 * @returns Parsed Pi application input.
 */
export const parsePiApplicationInput = (formData: FormData): PiApplicationInput => ({
  requestedName: requireText(formData.get("requestedName"), "requested_name"),
  scholarUrl: requireText(formData.get("scholarUrl"), "scholar_url"),
  note: normalizeText2String(formData.get("note")),
});

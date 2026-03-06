// @/util/util.ts

import { headers } from "next/headers";

export const name2Text = (nameKo: string, nameEn: string | null) => `${nameKo}(${nameEn ?? ""})`;

/**
 * Normalizes a text field from FormData.
 *
 * - If the value is not a string, returns `null`.
 * - If the trimmed string is empty, returns `null`.
 *
 * @param value - Raw FormData entry.
 * @returns A trimmed string or `null`.
 */
export const normalizeText = (value: FormDataEntryValue | null): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

/**
 * Normalizes an arbitrary input into a trimmed string.
 * @param value - unknown input value
 * @returns A trimmed string; returns empty string if value is invaild or empty string when trimmed
 *
 * @example
 * normalizeText(" hello ")
 * // → "hello"
 * normalizeText("   ");
 * // → ""
 * normalizeText(123);
 * // → ""
 */
export const normalizeText2String = (value: unknown): string => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed.length ? trimmed : "";
};


/**
 * Extract client IP from request headers.
 */
export async function getClientIp(): Promise<string | null> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return h.get("x-real-ip");
}

// @/util/util.ts
export const name2Text = (nameKo: string, nameEn: string | null) => `${nameKo}(${nameEn ?? ""})`;

export type FormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; error: string };
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
export const normalizeText2String = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

/**
 * Require a non-empty string field and throw when missing.
 * @param value - Raw form field value.
 * @param field - Field label used in the error message.
 * @returns Normalized string.
 */
export const requireText = (value: FormDataEntryValue | null, field: string): string => {
  const normalized = normalizeText2String(value);
  if (!normalized) {
    throw new Error(`${field} is required`);
  }
  return normalized;
};

/**
 * Type guard that checks whether a value is a valid URL string.
 *
 * Returns `true` if the value is a string and can be successfully parsed
 * by the `URL` constructor. When `true`, `v` is narrowed to `string` in
 * the calling scope.
 *
 * @param v - The value to check (of unknown type)
 * @returns `true` if `v` is a string and `new URL(v)` succeeds; otherwise `false`
 *
 * @example
 * isValidUrl("https://example.com"); // true
 * isValidUrl("not a url");           // false
 * isValidUrl(null);                  // false
 */
export const isValidUrl = (v: unknown): v is string => {
  if (typeof v !== "string") return false;
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
};

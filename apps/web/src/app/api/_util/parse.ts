// @/app/api/_util/parse.ts

/**
 * Parse a value into a bigint.
 *
 * The function converts the given value to string, trims it,
 * and attempts to convert it into a `bigint`.
 *
 * @param value - The raw value to parse (typically a request body field).
 * @param name - Field name used in error messages.
 *
 * @returns Parsed bigint value.
 *
 * @throws Error
 * - If the value is empty → `"${name} is required."`
 * - If the value cannot be converted to bigint → `"Invalid ${name}."`
 */
export function parseBigInt(value: unknown, name: string): bigint {
  const raw = value?.toString().trim();
  if (!raw) {
    throw new Error(`${name} is required.`);
  }
  try {
    return BigInt(raw);
  } catch {
    throw new Error(`Invalid ${name}.`);
  }
}

/**
 * Parse a string value into a valid enum member.
 *
 * This function validates that the provided value is included
 * in the given enum object and returns it as a strongly typed enum value.
 *
 * @typeParam T - Enum-like object (`Record<string, string>`).
 *
 * @param enumObj - The enum object to validate against.
 * @param value - The raw value to parse.
 * @param name - Field name used in error messages.
 *
 * @returns The parsed enum value.
 *
 * @throws Error
 * - If the value is empty → `"${name} is required."`
 * - If the value is not part of the enum → `"Invalid ${name}."`
 */
export function parseEnumValue<T extends Record<string, string>>(
  enumObj: T,
  value: unknown,
  name: string,
): T[keyof T] {
  const raw = value?.toString().trim();
  if (!raw) {
    throw new Error(`${name} is required.`);
  }
  if (!Object.values(enumObj).includes(raw as T[keyof T])) {
    throw new Error(`Invalid ${name}.`);
  }
  return raw as T[keyof T];
}

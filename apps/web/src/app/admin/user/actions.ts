"use server";

import { prisma, UserRole } from "@labatory/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {UserDTO} from "./page";
type UserInput = {
  displayName: string;
  primaryEmail: string | null;
  role: UserRole|undefined;
};

/**
 * Normalize a form field to a trimmed string or null.
 * @param value - Raw form field value.
 * @returns Trimmed string when present; otherwise null.
 * @example
 * normalizeText("  Seoul  ")
 * // "Seoul"
 */
const normalizeText = (value: FormDataEntryValue | null): string | null => {
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
const requireText = (value: FormDataEntryValue | null, field: string): string => {
  const normalized = normalizeText(value);
  if (!normalized) {
    throw new Error(`${field} is required`);
  }
  return normalized;
};

/**
 * Parse and validate UserRole from form data.
 * @param value - Raw form field value.
 * @returns UserRole enum value.
 */
const requireUserRole = (value: FormDataEntryValue | null): UserRole => {
  if (typeof value !== "string") {
    throw new Error("Role is required");
  }
  const trimmed = value.trim();
  const roles = Object.values(UserRole) as string[];
  if (!roles.includes(trimmed)) {
    throw new Error(`Invalid role: ${trimmed}`);
  }
  return trimmed as UserRole;
};

/**
 * Convert form data into the user input DTO.
 * @param formData - Submitted form data.
 * @returns Parsed user input.
 */
const parseUserInput = (formData: FormData): UserInput => (formData.get("role")?{
  displayName: requireText(formData.get("displayName"), "Display name"),
  primaryEmail: normalizeText(formData.get("primaryEmail")),
  role: requireUserRole(formData.get("role")),
}:{
  displayName: requireText(formData.get("displayName"), "Display name"),
  primaryEmail: normalizeText(formData.get("primaryEmail")),
  role:undefined,
});

/**
 * Update a user, revalidate related pages, then redirect to the detail page.
 * @param formData - Submitted form data.
 */
export async function updateUser(formData: FormData) {
  const idValue = formData.get("id");
  if (typeof idValue !== "string") {
    throw new Error("Missing user id");
  }
  const id = BigInt(idValue);
  const data = parseUserInput(formData);

  await prisma.user.update({
    where: { id },
    data,
  });

  const target = `/admin/user/`;
  revalidatePath("/admin/user");
  redirect(target);
}

/**
 * Delete a user, revalidate the list, then redirect to the list page.
 * @param formData - Submitted form data.
 */
export async function deleteUser(formData: FormData) {
  const idValue = formData.get("id");
  if (typeof idValue !== "string") {
    throw new Error("Missing user id");
  }
  const id = BigInt(idValue);

  await prisma.user.delete({ where: { id } });

  revalidatePath("/admin/user");
  redirect("/admin/user");
}
export async function promoteToAdminAction(params: { userId: string }) {
  const id = BigInt(params.userId);

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");
  if (user.role === UserRole.ADMIN) throw new Error("Already ADMIN");

  await prisma.user.update({
    where: { id },
    data: { role: UserRole.ADMIN },
  });

  // make page render again
  revalidatePath("/admin/user");
}

export async function demoteAdminToUserAction(params: { userId: string }) {
  const id = BigInt(params.userId);

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");
  if (user.role !== UserRole.ADMIN) throw new Error("Not ADMIN");

  await prisma.user.update({
    where: { id },
    data: { role: UserRole.USER },
  });

  revalidatePath("/admin/user");
}
// @/app/admin/user/actions.ts

"use server";

import { prisma, UserRole, type User } from "@labatory/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type UserInput = {
  displayName: string;
  primaryEmail: string | null;
};

const normalizeText = (value: FormDataEntryValue | null): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const requireText = (value: FormDataEntryValue | null, field: string): string => {
  const normalized = normalizeText(value);
  if (!normalized) throw new Error(`${field} is required`);
  return normalized;
};

const parseUserInput = (formData: FormData): UserInput => ({
  displayName: requireText(formData.get("displayName"), "Display name"),
  primaryEmail: normalizeText(formData.get("primaryEmail")),
});

/**
 * Fetch users filtered by a given role.
 *
 * @param params - Query parameters.
 * @param params.userRole - Role to filter users by.
 * @returns A list of users sorted by `createdAt` descending.
 */
export async function getUserByRole(params: { userRole: UserRole }): Promise<User[]> {
  const users = await prisma.user.findMany({
    where: { role: params.userRole },
    orderBy: { createdAt: "desc" },
  });
  return users;
}

/**
 * Update a user profile (display name / primary email), then refresh cache and redirect.
 *
 * Expects `formData` to contain:
 * - `id` (string, bigint-compatible)
 * - `displayName` (string, non-empty)
 * - `primaryEmail` (optional string)
 *
 * Side effects:
 * - Updates DB row
 * - Revalidates `/admin/user`
 * - Redirects to `/admin/user`
 *
 * @param formData - Submitted form data.
 * @throws If required fields are missing/invalid.
 */
export async function updateUser(formData: FormData): Promise<never> {
  const idValue = formData.get("id");
  if (typeof idValue !== "string") throw new Error("Missing user id");

  const id = BigInt(idValue);
  const data = parseUserInput(formData);

  await prisma.user.update({ where: { id }, data });

  revalidatePath("/admin/user");
  redirect("/admin/user");
}

/**
 * Promote (or change) a user's role.
 *
 * @param params - Target user and the new role.
 * @param params.userId - User id as a string (bigint-compatible).
 * @param params.userRole - Role to set for the user.
 * @throws If user does not exist.
 */
export async function promoteToAction(params: {
  userId: string;
  userRole: UserRole;
}): Promise<void> {
  const id = BigInt(params.userId);

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");

  await prisma.user.update({ where: { id }, data: { role: params.userRole } });

  revalidatePath("/admin/user");
}

/**
 * Demote a user back to the default USER role.
 *
 * @param params - Target user.
 * @param params.userId - User id as a string (bigint-compatible).
 * @throws If user does not exist.
 */
export async function demoteToUserAction(params: { userId: string }): Promise<void> {
  const id = BigInt(params.userId);

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");

  await prisma.user.update({ where: { id }, data: { role: UserRole.USER } });

  revalidatePath("/admin/user");
}

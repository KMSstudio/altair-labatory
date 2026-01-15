"use server";

import { prisma, UserRole } from "@labatory/db";
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
  if (!normalized) {
    throw new Error(`${field} is required`);
  }
  return normalized;
};

const parseUserInput = (formData: FormData): UserInput => ({
  displayName: requireText(formData.get("displayName"), "Display name"),
  primaryEmail: normalizeText(formData.get("primaryEmail")),
});

/**
 * Update a user, revalidate related pages, then redirect to the detail page.
 * @param formData - Submitted form data. Need to contain "id", "displayName" field. Can contain "primaryEmail" field
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

  revalidatePath("/admin/user");
  redirect("/admin/user");
}

export async function promoteToAction(params: { userId: string,userRole: UserRole }) {
  const id = BigInt(params.userId);

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");

  await prisma.user.update({
    where: { id },
    data: { role: params.userRole },
  });

  revalidatePath("/admin/user");
}

export async function demoteToUserAction(params: { userId: string }) {
  const id = BigInt(params.userId);

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");

  await prisma.user.update({
    where: { id },
    data: { role: UserRole.USER },
  });

  revalidatePath("/admin/user");
}

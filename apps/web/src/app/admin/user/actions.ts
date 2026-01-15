"use server";

import { prisma, UserRole } from "@labatory/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
type UserInput = {
  displayName: string;
  primaryEmail: string | null;
  role: UserRole|undefined;
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

const parseUserInput = (formData: FormData): UserInput => (formData.get("role")?{
  displayName: requireText(formData.get("displayName"), "Display name"),
  primaryEmail: normalizeText(formData.get("primaryEmail")),
  role: requireUserRole(formData.get("role")),
}:{
  displayName: requireText(formData.get("displayName"), "Display name"),
  primaryEmail: normalizeText(formData.get("primaryEmail")),
  role:undefined,
});

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
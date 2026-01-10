"use server";

import { prisma } from "@labatory/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type UnivInput = {
  nameKo: string;
  nameEn: string | null;
  country: string | null;
  websiteUrl: string | null;
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

const parseUnivInput = (formData: FormData): UnivInput => ({
  nameKo: requireText(formData.get("nameKo"), "Korean name"),
  nameEn: normalizeText(formData.get("nameEn")),
  country: normalizeText(formData.get("country")),
  websiteUrl: normalizeText(formData.get("websiteUrl")),
});

export async function createUniversity(formData: FormData) {
  const data = parseUnivInput(formData);

  const created = await prisma.university.create({ data });

  revalidatePath("/univ");
  redirect(`/univ/${created.id.toString()}`);
}

export async function updateUniversity(formData: FormData) {
  const idValue = formData.get("id");
  if (typeof idValue !== "string") {
    throw new Error("Missing university id");
  }

  const id = BigInt(idValue);
  const data = parseUnivInput(formData);

  await prisma.university.update({
    where: { id },
    data,
  });

  const target = `/univ/${idValue}`;
  revalidatePath("/univ");
  revalidatePath(target);
  redirect(target);
}

export async function deleteUniversity(formData: FormData) {
  const idValue = formData.get("id");
  if (typeof idValue !== "string") {
    throw new Error("Missing university id");
  }

  const id = BigInt(idValue);

  await prisma.university.delete({ where: { id } });

  revalidatePath("/univ");
  redirect("/univ");
}

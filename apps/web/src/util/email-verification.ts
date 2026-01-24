"use server";

import { Prisma } from "@labatory/db";
import { prisma } from "@labatory/db";
import { passwordHashing } from "@/lib/auth";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export async function EmailVerificationAction(params: { email: string; tokenHash: string }) {
  const email = params.email ? normalizeEmail(params.email) : "";
  const tokenHash = params.tokenHash ? params.tokenHash.trim() : "";

  if (!email || !tokenHash) {
    throw new Error("Email and token hash are required.");
  }

  const tokens = await prisma.verificationToken.findMany({
    where: { tokenHash },
  });

  for (const token of tokens) {
    if (token.sendEmail !== email) continue;
    if (token.usedAt !== null) continue;
    if (token.expireAt.getTime() < Date.now()) continue;

    if (!token.stringVal) {
      throw new Error("Invalid register info.");
    }

    let payload: { password?: string; displayName?: string };
    try {
      payload = JSON.parse(token.stringVal);
    } catch {
      throw new Error("Invalid register info.");
    }

    const password = payload.password ?? "";
    const displayName = payload.displayName?.trim() ?? "";

    if (!password || !displayName) {
      throw new Error("Password and display name are required.");
    }

    try {
      const passwordHash = await passwordHashing(password);

      await prisma.$transaction(async (tx) => {
        const anyCredSameEmail = await tx.userCredential.findFirst({
          where: { email },
        });

        let userId: bigint;

        if (anyCredSameEmail) {
          userId = anyCredSameEmail.userId;
        } else {
          const user = await tx.user.create({
            data: { displayName, primaryEmail: email },
          });
          userId = user.id;
        }

        await tx.userCredential.create({
          data: {
            userId,
            provider: "credentials",
            providerUserId: email,
            email,
            emailVerified: true,
            isPrimary: false,
            passwordHash,
          },
        });

        await tx.verificationToken.update({
          where: { id: token.id },
          data: { usedAt: new Date() },
        });
      });

      return token.stringVal;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new Error("Email already in use.");
      }
      throw e instanceof Error ? e : new Error("Unknown server error.");
    }
  }

  throw new Error("Token does not exist or is invalid.");
}

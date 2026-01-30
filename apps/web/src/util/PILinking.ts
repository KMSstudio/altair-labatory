"use server";

import { prisma } from "@labatory/db";

export async function LinkUserWithPIByEmail({ userId }: { userId: bigint }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw Error("Invaild user id.");
  }
  const userEmail = user.primaryEmail;
  if (!userEmail) {
    return false;
  }

  const piWithSameEmail = await prisma.pI.findMany({
    where: { email: userEmail },
  });
  if (piWithSameEmail.length == 0) return false;
  if (piWithSameEmail.length != 1) {
    throw Error("Multiple PI data detected.");
  }

  const pi = piWithSameEmail[0];

  try {
    await prisma.$transaction(async (tx) => {
      await tx.pI.update({
        where: { id: pi.id },
        data: {
          userId,
        },
      });
      await tx.user.update({
        where: { id: userId },
        data: {
          pi: {
            connect: { id: pi.id },
          },
        },
      });
    });
  } catch {
    throw Error("Internal server error.");
  }
  return true;
}

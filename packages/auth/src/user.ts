import "server-only";
import { prisma } from "@labatory/db";
import type { SessionUser } from "./types.js";

export async function getUserById(id: bigint): Promise<SessionUser | null> {
  const u = await prisma.user.findUnique({
    where: { id },
    select: { id: true, displayName: true, role: true, primaryEmail: true, piId: true }
  });
  if (!u) return null;
  return { id: u.id, displayName: u.displayName, role: u.role as any, primaryEmail: u.primaryEmail, piId: u.piId };
}

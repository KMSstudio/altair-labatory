import type { SessionUser, UserRole } from "./types.js";

export const roleRank: Record<UserRole, number> = { USER: 1, PI: 2, ADMIN: 3 };

export function hasRole(user: SessionUser | null | undefined, min: UserRole): boolean {
  if (!user) return false;
  return roleRank[user.role] >= roleRank[min];
}

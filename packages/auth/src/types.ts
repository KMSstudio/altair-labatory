export type UserRole = "USER" | "PI" | "ADMIN";

export type SessionUser = {
  id: bigint;
  displayName: string;
  role: UserRole;
  primaryEmail: string | null;
  piId: bigint | null;
};

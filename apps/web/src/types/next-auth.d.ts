import type { DefaultSession } from "next-auth";

export type AppUserRole = "USER" | "PI" | "ADMIN";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      displayName: string;
      role: AppUserRole;
      primaryEmail: string | null;
      piId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    displayName?: string;
    role?: AppUserRole;
    primaryEmail?: string | null;
    piId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    displayName?: string;
    role?: AppUserRole;
    primaryEmail?: string | null;
    piId?: string | null;
  }
}

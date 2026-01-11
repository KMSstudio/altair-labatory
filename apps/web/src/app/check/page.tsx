// @/app/check/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * CHECK PAGE (EXAMPLE)
 *
 * This page is a minimal example for beginners to learn how to read the "current user" info
 * managed by NextAuth.
 *
 * Key points:
 * 1) This is just an example page for demonstration (not production UI).
 * 2) This approach uses `getServerSession()`, so it works in a Server Component only.
 * 3) If you need user info in a Client Component, use `useSession()` + `SessionProvider` instead.
 */
export default async function Page() {
  /**
   * SERVER-ONLY:
   * `getServerSession(authOptions)` reads the session on the server using cookies from the request.
   * This is the recommended way when you render user-dependent UI on the server.
   */
  const session = await getServerSession(authOptions);

  if (!session) return <div>Not signed in</div>;

  const { id, displayName, role, primaryEmail, piId } = session.user;

  return (
    <div>
      {id} {displayName} ({role}) - {primaryEmail} {piId}
    </div>
  );
}

/**
 * CLIENT COMPONENT ALTERNATIVE (REFERENCE)
 *
 * If you need session info in a Client Component (e.g., interactive header UI),
 * you must:
 *  - Wrap your app with <SessionProvider> somewhere above (usually in app/layout.tsx via a client Providers component)
 *  - Use `useSession()` inside the client component
 *
 * Example:
 *
 * ```tsx
 * "use client";
 *
 * import { useSession } from "next-auth/react";
 *
 * export function ClientUserBadge() {
 *   const { data: session, status } = useSession();
 *   if (status === "loading") return <div>Loading...</div>;
 *   if (!session) return <div>Not signed in</div>;
 *   return <div>{session.user.displayName}</div>;
 * }
 * ```
 */

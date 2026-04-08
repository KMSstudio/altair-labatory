// @/app/auth/me/page.tsx

import { prisma } from "@labatory/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import styles from "../auth.module.css";

async function getCurrentUser(userId: bigint) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      pi: true,
      credentials: {
        select: {
          id: true,
          provider: true,
          providerUserId: true,
          email: true,
          emailVerified: true,
          isPrimary: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/auth/login");

  const userId = BigInt(session.user.id);

  const user = await getCurrentUser(userId);
  if (!user) return <div>존재하지 않는 유저 세션입니다.</div>;

  return (
    <main className={styles.meShell}>
      <header></header>

      <section className={styles.panel}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Name:</span>
          <span className={styles.rowValue}>{user.displayName}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Role:</span>
          <span className={styles.rowValue}>{user.role}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Primary Email:</span>
          <span className={styles.rowValue}>{user.primaryEmail ?? "No email"}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Created:</span>
          <span className={styles.rowValue}>{user.createdAt.toDateString()}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>PI:</span>
          <span className={styles.rowValue}>{user.pi ? "Linked" : "Not linked"}</span>
        </div>
      </section>

      <section className={styles.panel}>
        <header>
          <h3 className={styles.panelTitle}>PI info</h3>
        </header>

        {!user.pi ? (
          <p className={styles.emptyNote}>Not PI user.</p>
        ) : (
          <>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Name:</span>
              <span className={styles.rowValue}>{user.pi.name}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Email:</span>
              <span className={styles.rowValue}>{user.pi.email}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>ScholarUrl:</span>
              <span className={styles.rowValue}>{user.pi.scholarUrl}</span>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

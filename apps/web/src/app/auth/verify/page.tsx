// @/app/verify/page.tsx

import { Prisma, prisma } from "@labatory/db";
import styles from "../auth.module.css";

export default async function Page({
  searchParams,
}: {
  searchParams: { token?: string; email?: string };
}) {
  const tokenParams = await searchParams;
  const now = new Date();
  if (!tokenParams.token || !tokenParams.email) {
    return <div>잘못된 접근입니다.</div>;
  }

  const tokens = await prisma.verificationToken.findMany({
    where: { tokenHash: tokenParams.token },
  });

  for (const token of tokens) {
    if (token.sendEmail !== tokenParams.email) continue;

    if (!token) {
      return <div className={styles.errorNote}>유효하지 않은 접근입니다.</div>;
    }
    if (token.expireAt < now) {
      return <div className={styles.errorNote}>메일이 만료되었습니다.</div>;
    }
    if (token.usedAt !== null) {
      return <div className={styles.errorNote}>이미 이메일을 인증하였습니다.</div>;
    }
    if (!token.credentialId) {
      return <div className={styles.errorNote}>무언가 잘못되었습니다.</div>;
    }

    try {
      const id = token.credentialId;
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.userCredential.update({
          where: {
            id,
          },
          data: { emailVerified: true },
        });

        await tx.verificationToken.updateMany({
          where: {
            tokenHash: tokenParams.token,
          },
          data: {
            usedAt: new Date(now),
          },
        });
      });
    } catch {
      return (
        <main className={styles.authShell}>
          <h1 className={styles.pageTitle}>이메일 검증에 실패했습니다.</h1>
        </main>
      );
    }

    return (
      <main className={styles.authShell}>
        <h1 className={styles.pageTitle}>이메일 검증이 완료되었습니다.</h1>
      </main>
    );
  }

  return <div className={styles.errorNote}>잘못된 접근입니다.</div>;
}

// @/app/reset-password/page.tsx

import { prisma } from "@labatory/db";
import { ResetPassword } from "./ResetPassword";
import styles from '../auth.module.css'

export default async function Page({
  searchParams,
}: {
  searchParams: { token?: string; email?: string };
}) {
  const tokenparams = await searchParams;
  const now = new Date();

  if (!tokenparams.token || !tokenparams.email) {
    return <div className={styles.resultNote}>유효하지 않은 접근입니다.</div>;
  }

  const tokens = await prisma.verificationToken.findMany({
    where: {
      tokenHash: tokenparams.token,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  for (const token of tokens) {
    if (token.sendEmail !== tokenparams.email) continue;

    if (token.expireAt < now) {
      return <div className={styles.errorNote}>메일이 만료되었습니다.</div>;
    }
    if (token.usedAt !== null) {
      return <div className={styles.errorNote}>이미 비밀번호를 변경하였습니다.</div>;
    }
    if (!token.credentialId) {
      return <div className={styles.errorNote}>무언가 잘못되었습니다.</div>;
    }

    return (
      <main className={styles.resetShell}>
        <h1 className={styles.resetTitle}>비밀번호 변경</h1>
        <ResetPassword token={token.tokenHash} email={token.sendEmail} />
      </main>
    );
  }

  return <div className={styles.errorNote}>잘못된 접근입니다.</div>;
}

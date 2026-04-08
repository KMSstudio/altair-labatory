"use server";

import { EmailVerificationAction } from "@/util/email-verification";
import { redirect } from "next/navigation";
import { submitAction } from "./action";
import styles from '../auth.module.css'

const IGNORE_EMAIL_VERIFY_string = process.env.IGNORE_EMAIL_VERIFY ?? "";
const IGNORE_EMAIL_VERIFY =
  IGNORE_EMAIL_VERIFY_string === "1" || IGNORE_EMAIL_VERIFY_string.toUpperCase() === "TRUE";

export default async function Page({
  searchParams,
}: {
  searchParams: { token_hash?: string; email?: string };
}) {
  if (IGNORE_EMAIL_VERIFY) redirect("/");

  let error: string | null = null;

  searchParams = await searchParams;
  if (!searchParams.email) {
    return <div>invalid access</div>;
  }
  const email = decodeURIComponent(searchParams.email.trim());

  async function OnLoad() {
    if (!searchParams.token_hash) return false;
    try {
      const tokenHash = decodeURIComponent(searchParams.token_hash.trim());
      await EmailVerificationAction({ email, tokenHash });
    } catch (e: unknown) {
      if (e instanceof Error) error = e.message ?? "Unknown error";
      else error = "Unknown event";
      return false;
    }
    return true;
  }

  if (await OnLoad()) redirect("/");
  return (
    <main className={styles.authShell}>
      <h1 className={styles.pageTitle}>Email verification</h1>
      {error ? <p className={styles.errorNote}>{error}</p> : null}
      <form action={submitAction.bind(null, email)} className={styles.formPanel}>
        <input name="tokenHash" placeholder="XXXXX" required={true} maxLength={5} className={styles.input} />
        <button type="submit" className={styles.primary}>
          Submit
        </button>
      </form>
    </main>
  );
}

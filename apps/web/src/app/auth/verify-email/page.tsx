"use server";

import { EmailVerificationAction } from "@/util/email-verification";
import { redirect } from "next/navigation";
import { submitAction } from "./action";

const IGNORE_EMAIL_VERIFY_string = process.env.IGNORE_EMAIL_VERIFY ?? "";
const IGNORE_EMAIL_VERIFY =
  IGNORE_EMAIL_VERIFY_string === "1" || IGNORE_EMAIL_VERIFY_string.toUpperCase() === "TRUE";

export default async function Page({
  searchParams,
}: {
  searchParams: { token_hash?: string; email?: string };
}) {
  if (IGNORE_EMAIL_VERIFY) redirect("/");

  let error = null;

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
    <main>
      <h1>Email verification</h1>
      {error ? <p>{error}</p> : null}
      <form action={submitAction.bind(null, email)}>
        <input name="tokenHash" placeholder="XXXXX" required={true} maxLength={5}></input>
        <button type="submit">Submit</button>
      </form>
    </main>
  );
}

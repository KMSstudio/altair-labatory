"use client";

import styles from '../auth.module.css'

export function ResetPassword({ token, email }: { token: string; email: string }) {
  async function onSubmit(formData: FormData) {
    const password = formData.get("password");
    const passwordCheck = formData.get("passwordCheck");

    if (password !== passwordCheck) {
      alert("The passwords you entered were not the same.");
      return;
    }

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        tokenHash: token,
        email: email,
        password: password,
      }),
    });

    if (res.ok) {
      window.location.href = "/auth/login";
    } else {
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      alert(payload?.error ?? "Password reset failed.");
    }
  }

  return (
    <form action={onSubmit} className={styles.formPanel}>
      <input type="password" name="password" placeholder="new password" className={styles.input} />
      <input type="password" name="passwordCheck" placeholder="new password check" className={styles.input} />
      <button className={styles.primary}>변경</button>
    </form>
  );
}

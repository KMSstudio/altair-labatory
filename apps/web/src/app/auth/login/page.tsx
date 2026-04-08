// @/app/login/page.tsx

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import styles from "../auth.module.css";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className={styles.authShell}>
      <h1 className={styles.pageTitle}>Log in</h1>
      <button type="button" className={styles.googleBtn} onClick={() => signIn("google", { callbackUrl: "/" })}>
        Continue with Google
      </button>
      <form onSubmit={handleSubmit} className={styles.formPanel}>
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <button type="submit" disabled={loading} className={styles.primary}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      {error ? <p role="alert" className={styles.errorNote}>
        {error}
      </p> : null}
      <p className={styles.footNote}>
        New here? <a href="/auth/register" className={styles.ghost}>
          Create an account
        </a>
      </p>
    </main>
  );
}

// @/app/register/page.tsx

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import styles from "../auth.module.css";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const displayName = String(formData.get("displayName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, email, password }),
    });

    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Registration failed.");
      setLoading(false);
      return;
    }

    window.location.href = `/auth/verify-email?email=${encodeURIComponent(email)}`;
  }

  return (
    <main className={styles.authShell}>
      <h1 className={styles.pageTitle}>Create account</h1>
      <button
        type="button"
        className={styles.googleBtn}
        onClick={() => signIn("google", { callbackUrl: "/" })}
      >
        Continue with Google
      </button>
      <form onSubmit={handleSubmit} className={styles.formPanel}>
        <label>
          Display name
          <input name="displayName" type="text" autoComplete="name" required />
        </label>
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="new-password" required />
        </label>
        <button type="submit" disabled={loading} className={styles.primary}>
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      {error ? (
        <p role="alert" className={styles.errorNote}>
          {error}
        </p>
      ) : null}
      <p className={styles.footNote}>
        Already have an account?{" "}
        <a href="/auth/login" className={styles.ghost}>
          Log in
        </a>
      </p>
    </main>
  );
}

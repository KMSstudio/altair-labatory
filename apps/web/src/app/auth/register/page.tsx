// @/app/register/page.tsx

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { SendVerification } from "@/lib/mail";

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

    const IGNORE_EMAIL_VERIFY = process.env.IGNORE_EMAIL_VERIFY ?? "";
    console.log(IGNORE_EMAIL_VERIFY)
    if (IGNORE_EMAIL_VERIFY !== "1" && IGNORE_EMAIL_VERIFY.toUpperCase() !== "TRUE") {

      try {
        if (!(await SendVerification({ stringVal: JSON.stringify({ displayName, email, password }), userEmail: email }))) {
          setError("Fail to send Email. please try again.");
          return;
        }
      } catch {
        setError("Internal serer error");
        return;
      }

      window.location.href = `/auth/verify-email?email=${encodeURIComponent(email)}`;
      return;
    }
    else {
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

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      setLoading(false);

      if (result?.error) {
        setError("Account created. Please log in.");
        return;
      }

      window.location.href = "/";
    }
  }

  return (
    <main>
      <h1>Create account</h1>
      <button type="button" onClick={() => signIn("google", { callbackUrl: "/" })}>
        Continue with Google
      </button>
      <form onSubmit={handleSubmit}>
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
        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      {error ? <p role="alert">{error}</p> : null}
      <p>
        Already have an account? <a href="/login">Log in</a>
      </p>
    </main>
  );
}

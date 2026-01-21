"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function ResetPassword({ token }: { token: string }) {
  const [done, setDone] = useState(false);

  if (done) {
    window.location.href = "/auth/login";
  }

  async function onSubmit(formData: FormData) {
    const password = formData.get("password");
    const passwordCheck=formData.get("passwordCheck");

    if (password !== passwordCheck){
      alert("The passwords you entered were not the same.")
      return;
    }

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        tokenHash: token,
        password: password,
      }),
    });

    if (res.ok) setDone(true);
    else {
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      alert(payload?.error ?? "Password reset failed.");
    }
  }

  return (
    <form action={onSubmit}>
      <input type="password" name="password" placeholder="new password" />
      <input type="passwordCheck" name="passwordCheck" placeholder="new password check" />
      <button>변경</button>
    </form>
  );
}

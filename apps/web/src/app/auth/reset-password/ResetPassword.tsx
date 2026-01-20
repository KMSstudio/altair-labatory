"use client";

import { useState } from "react";

export function ResetPassword({ token }: { token: string }) {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div>
        <h2>비밀번호가 변경되었습니다</h2>
        <a href="/auth/login">로그인하기</a>
      </div>
    );
  }

  async function onSubmit(formData: FormData) {
    const res = await fetch("/api/auth/reset-password", {
      method: "PATCH",
      body: JSON.stringify({
        tokenHash: token,
        password: formData.get("password"),
      }),
    });

    if (res.ok) setDone(true);
  }

  return (
    <form action={onSubmit}>
      <input type="password" name="password" />
      <button>변경</button>
    </form>
  );
}

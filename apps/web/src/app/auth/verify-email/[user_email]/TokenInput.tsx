"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function TokenInput() {
  const [token, setToken] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
      .split("")
      .filter((c) => c.charCodeAt(0) <= 0x7f)
      .join("")
      .slice(0, 5);

    setToken(next);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (token.length !== 5) return;

    router.replace(`${pathname}?token=${token}`);
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        value={token}
        onChange={onChange}
        maxLength={5}
        placeholder="5자리 토큰"
      />
      <button type="submit">확인</button>
    </form>
  );
}

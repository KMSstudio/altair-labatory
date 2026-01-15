"use client";

import { type UserRole } from "@labatory/db";
import { useState } from "react";
import { demoteToUserAction } from "../actions";

export function DemoteFrom({demoteRole}:{demoteRole : UserRole}) {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    const trimmedId = userId.trim();
    if (!trimmedId || loading) return;

    setLoading(true);
    try {
      await demoteToUserAction({ userId: trimmedId });
      setUserId("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>{demoteRole} 권한 강등</h2>

      <label>
        User ID{" "}
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="예) 123"
          disabled={loading}
        />
      </label>

      <button type="button" onClick={onSubmit} disabled={loading || !userId.trim()}>
        {loading ? "처리 중..." : "강등"}
      </button>
    </section>
  );
}

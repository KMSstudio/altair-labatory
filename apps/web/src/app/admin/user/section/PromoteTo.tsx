'use client'

import { type UserRole } from "@labatory/db";
import { useState } from "react";
import { promoteToAction } from "../actions";

export function PromoteTo({promoteRole}:{promoteRole : UserRole}) {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    const trimmedId = userId.trim();
    if (!trimmedId || loading) return;

    setLoading(true);
    try {
      await promoteToAction({ userId: trimmedId, userRole:promoteRole });
      setUserId("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>{promoteRole} 권한 부여</h2>

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
        {loading ? "처리 중..." : "승격"}
      </button>
    </section>
  );
}

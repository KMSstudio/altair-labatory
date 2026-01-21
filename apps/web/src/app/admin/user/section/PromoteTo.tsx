"use client";

import { type UserRole } from "@labatory/db";
import { useState } from "react";
import { promoteToAction } from "../actions";
import styles from "../../admin.module.css";

export function PromoteTo({ promoteRole }: { promoteRole: UserRole }) {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    const trimmedId = userId.trim();
    if (!trimmedId || loading) return;

    setLoading(true);
    try {
      await promoteToAction({ userId: trimmedId, userRole: promoteRole });
      setUserId("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={styles.card}>
      <h3>Promote to {promoteRole}</h3>

      <div className={styles.formInline}>
        <label>
          User ID{" "}
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="?? 123"
            disabled={loading}
          />
        </label>

        <button
          className={styles.primary}
          type="button"
          onClick={onSubmit}
          disabled={loading || !userId.trim()}
        >
          {loading ? "Processing.." : "Promote"}
        </button>
      </div>
    </section>
  );
}

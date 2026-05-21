"use client";
import { useRouter } from "next/navigation";
import styles from "./univ.module.css";
import { useState } from "react";

export default function UnivDeleteButton({ universityId }: { universityId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    try {
      setSubmitting(true);
      const res = await fetch("/api/univ/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universityId }),
      });
      const data = await res.json();
      if (!res.ok) {
        let error = `Request failed (${res.status})`;
        if (typeof data?.error === "string") error = data.error;

        throw new Error(error);
      }

      router.push("/univ");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <button type="button" className={styles.danger} onClick={handleClick}>
      {submitting ? "deleting.." : "delete"}
    </button>
  );
}

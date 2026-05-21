"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../subj.module.css";
import Link from "next/link";
import { parseSubjectInput } from "@/util/subj";
import { FormState } from "@/util/util";

export default function SubjectCreateForm() {
  const router = useRouter();
  const [state, setState] = useState<FormState>({ status: "idle" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    let body;
    try {
      body = parseSubjectInput(formData);
    } catch (err) {
      setState({
        status: "error",
        error: err instanceof Error ? err.message : "Invalid input.",
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/labaratory/subject/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        let error = `Request failed (${res.status})`;
        if (typeof data?.error === "string") error = data.error;

        setState({ status: "error", error });
        return;
      }

      setState({ status: "success" });
      router.push(`/subj/${data.subject.id}`);
    } catch (err) {
      setState({
        status: "error",
        error: err instanceof Error ? err.message : "Network error.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {state.status === "error" && (
        <div className={`${styles.panel} ${styles.dangerZone}`}>
          <p className={styles.eyebrow}>Error</p>
          <p className={styles.value}>{state.error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Korean name *
          <input name="nameKo" placeholder="컴퓨터 비전" required />
        </label>
        <label>
          English name *
          <input name="nameEn" placeholder="Computer Vision" required />
        </label>
        <label>
          Description
          <input name="description" placeholder="Short summary" />
        </label>

        <div className={`${styles.actions} ${styles.actionsEnd}`}>
          <Link href="/subj/list" className={styles.ghost}>
            Cancel
          </Link>
          <button type="submit" className={styles.primary} disabled={submitting}>
            {submitting ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </>
  );
}

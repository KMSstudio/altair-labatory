"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeText2String } from "@/util/util";
import styles from "../subj.module.css";
import { SubjectDTO } from "@/repository/dto/labatory";
import { parseSubjectInput } from "@/util/subj";
import { FormState } from "@/util/util";

export default function SubjectEditForm({ subject }: { subject: SubjectDTO }) {
  const router = useRouter();
  const [state, setState] = useState<FormState>({ status: "idle" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    let body;
    try {
      body = {
        subjectId: normalizeText2String(subject.id),
        ...parseSubjectInput(formData),
      };
    } catch (err) {
      setState({
        status: "error",
        error: err instanceof Error ? err.message : "Invalid input.",
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/labaratory/subject/update", {
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
      router.refresh();
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

      {state.status === "success" && (
        <div className={styles.panel}>
          <p className={styles.eyebrow}>Saved</p>
          <p className={styles.value}>Subject updated.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Korean name *
          <input name="nameKo" defaultValue={subject.nameKo} required />
        </label>
        <label>
          English name *
          <input name="nameEn" defaultValue={subject.nameEn} required />
        </label>
        <label>
          Description
          <input name="description" defaultValue={subject.description ?? ""} />
        </label>
        <label>
          Active
          <input name="isActive" type="checkbox" defaultChecked={subject.isActive} />
        </label>

        <div className={`${styles.actions} ${styles.actionsEnd} ${styles.space}`}>
          <button type="submit" className={styles.primary} disabled={submitting}>
            {submitting ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requireText } from "@/util/util";
import styles from "../subj.module.css";
import { SubjectDTO } from "@/repository/dto/labatory";
import { FormState } from "@/util/util";

export default function SubjectMergeForm({ subjects }: { subjects: SubjectDTO[] }) {
  const router = useRouter();
  const [state, setState] = useState<FormState>({ status: "idle" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    let body;
    try {
      body = {
        sourceSubjectId: requireText(formData.get("fromId"), "Source subject id"),
        destinationSubjectId: requireText(formData.get("toId"), "Destination subject id"),
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
      const res = await fetch("/api/labaratory/subject/merge", {
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
      router.push(`/subj/${data.mergedSubject.id}`);
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
        <div className={styles.mergeGrid}>
          <fieldset className={styles.choiceGroup}>
            <legend>From (source) *</legend>
            <div className={styles.choiceList}>
              {subjects.map((s) => (
                <label key={`from-${s.id}`} className={styles.choiceItem}>
                  <input
                    className={styles.choiceRadio}
                    type="radio"
                    name="fromId"
                    value={s.id}
                    required
                  />
                  <span className={styles.choiceBody}>
                    <span className={styles.choiceText}>
                      <span className={styles.choiceTitle}>{s.nameKo}</span>
                      <span className={styles.choiceSub}>{s.nameEn}</span>
                    </span>
                    <span className={styles.statusTag}>{s.isActive ? "Active" : "Inactive"}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.choiceGroup}>
            <legend>To (destination) *</legend>
            <div className={styles.choiceList}>
              {subjects.map((s) => (
                <label key={`to-${s.id}`} className={styles.choiceItem}>
                  <input
                    className={styles.choiceRadio}
                    type="radio"
                    name="toId"
                    value={s.id}
                    required
                  />
                  <span className={styles.choiceBody}>
                    <span className={styles.choiceText}>
                      <span className={styles.choiceTitle}>{s.nameKo}</span>
                      <span className={styles.choiceSub}>{s.nameEn}</span>
                    </span>
                    <span className={styles.statusTag}>{s.isActive ? "Active" : "Inactive"}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className={`${styles.actions} ${styles.actionsEnd} ${styles.space}`}>
          <button type="submit" className={styles.primary}>
            {submitting ? "Merging.." : "Merge"}
          </button>
        </div>
      </form>
    </>
  );
}

"use client";

import { useState } from "react";
import { submitPIApplicationAction } from "../actions";
import { useRouter } from "next/navigation";
import { LabPicker } from "../LabPicker";
import styles from "../pi.module.css";

export function PIApplicationForm() {
  const [submitting, setSubmitting] = useState(false);

  const [requestedName, SetRequestedName] = useState("");
  const [labId, SetLabId] = useState<bigint | null>(null);
  const [scholarUrl, SetScholarUrl] = useState("");
  const [note, SetNote] = useState("");

  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    setSubmitting(true);
    e.preventDefault();
    try {
      await submitPIApplicationAction({ requestedName, labId, scholarUrl, note });
    } catch (error) {
      if (error instanceof Error) alert(error.message);
      setSubmitting(false);
      return;
    }
    router.push("/auth/me");
  }

  return (
    <form onSubmit={onSubmit} className={styles.formPanel}>
      <label>
        Requested Name
        <input
          name="requestedName"
          value={requestedName}
          onChange={(e) => SetRequestedName(e.target.value)}
          required
        />
      </label>
      <LabPicker setLabId={SetLabId} />
      <label>
        Scholar URL
        <input
          name="scholarUrl"
          value={scholarUrl}
          onChange={(e) => SetScholarUrl(e.target.value)}
          placeholder="https://scholar.google.com/..."
          required
        />
      </label>
      <label>
        Note (optional)
        <textarea name="note" value={note} onChange={(e) => SetNote(e.target.value)} />
      </label>
      <div className={styles.formActions}>
        <button type="submit" disabled={submitting} className={styles.primary}>
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
}

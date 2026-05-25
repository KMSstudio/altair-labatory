"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LabPicker } from "../LabPicker";
import styles from "../pi.module.css";
import { LabDTO } from "@/repository/dto/labatory";
import { FormState, normalizeText2String } from "@/util/util";
import { parsePiApplicationInput } from "@/util/pi";

export function PIApplicationForm({ labs }: { labs: LabDTO[] }) {
  const router = useRouter();
  const [state, setState] = useState<FormState>({ status: "idle" });
  const [submitting, setSubmitting] = useState(false);
  const [labId, setLabId] = useState<string | null>(null);

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    let body;
    try {
      body = {
        labId: normalizeText2String(labId),
        ...parsePiApplicationInput(formData),
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
      const res = await fetch("/api/labaratory/pi/apply", {
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
      router.push("/auth/me");
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
    <form onSubmit={handleSubmit} className={styles.formPanel}>
      <label>
        Requested Name
        <input name="requestedName" required />
      </label>
      <LabPicker setLabId={setLabId} labs={labs} />
      <label>
        Scholar URL
        <input name="scholarUrl" placeholder="https://scholar.google.com/..." required />
      </label>
      <label>
        Note (optional)
        <textarea name="note" />
      </label>
      <div className={styles.formActions}>
        <button type="submit" disabled={submitting} className={styles.primary}>
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
      {state.status === "error" && (
        <div>
          <p className={styles.errorNote}>{state.error}</p>
        </div>
      )}
      {state.status === "success" && (
        <div>
          <p className={styles.successNote}>apply success!</p>
        </div>
      )}
    </form>
  );
}

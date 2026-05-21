"use client";

import { useState } from "react";
import { LabPicker } from "../../LabPicker";
import { useRouter } from "next/navigation";
import styles from "../../pi.module.css";
import { LabDTO, PiDTO } from "@/repository/dto/labatory";
import { FormState, normalizeText2String } from "@/util/util";
import { parsePiInput } from "@/util/pi";

export function PIEditFormClient({ pi, labs }: { pi: PiDTO; labs: LabDTO[] }) {
  const router = useRouter();
  const [state, setState] = useState<FormState>({ status: "idle" });
  const [submitting, setSubmitting] = useState(false);
  const [labId, setLabId] = useState<string | null>(null);

  const selectedLab = pi.labId ? (labs.find((lab) => lab.id === pi.labId) ?? null) : null;

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    let body;
    try {
      body = {
        piId: normalizeText2String(pi.id),
        labId: normalizeText2String(labId),
        userId: pi.userId,
        ...parsePiInput(formData),
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
      const res = await fetch("/api/labaratory/pi/update", {
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
    <form onSubmit={handleSubmit} className={styles.formPanel}>
      <label>
        Name *
        <input name="name" defaultValue={pi.name} required />
      </label>

      <label>
        Email *
        <input name="email" type="email" defaultValue={pi.email} required />
      </label>

      <label>
        Google Scholar URL *
        <input name="scholarUrl" defaultValue={pi.scholarUrl} required />
      </label>
      <LabPicker selectedLab={selectedLab} setLabId={setLabId} labs={labs} />
      <div className={styles.formActions}>
        <button type="submit" className={styles.primary}>
          {submitting ? "Saving.." : "Save change"}
        </button>
      </div>
      {state.status === "error" && (
        <div>
          <p className={styles.errorNote}>{state.error}</p>
        </div>
      )}
      {state.status === "success" && (
        <div>
          <p className={styles.errorNote}>edit success!</p>
        </div>
      )}
    </form>
  );
}

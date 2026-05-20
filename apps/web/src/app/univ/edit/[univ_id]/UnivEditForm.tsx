"use client";

import React, { useState } from "react";
import styles from "../../univ.module.css";
import { useRouter } from "next/navigation";
import { parseUnivInput } from "@/util/univ";
import { UniversityDTO } from "@/repository/dto/labatory";
import { FormState } from "@/util/util";

export default function UnivEditForm({ univ }: { univ: UniversityDTO }) {
  const router = useRouter();
  const [state, setState] = useState<FormState>({ status: "idle" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    let body;
    try {
      body = {
        universityId: univ.id,
        ...parseUnivInput(formData),
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
      const res = await fetch("/api/univ/update", {
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
      router.push(`/univ/${data.university.id}`);
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
          <input name="nameKo" defaultValue={univ.nameKo} required />
        </label>
        <label>
          English name
          <input name="nameEn" defaultValue={univ.nameEn ?? ""} />
        </label>
        <label>
          Country
          <input name="country" defaultValue={univ.country ?? ""} />
        </label>
        <label>
          Website URL
          <input name="websiteUrl" type="url" defaultValue={univ.websiteUrl ?? ""} />
        </label>
        <label>
          Domain
          <input name="domain" defaultValue={univ.domain ?? ""} />
        </label>

        <div className={`${styles.actions} ${styles.actionsEnd} ${styles.space}`}>
          <button type="submit" className={styles.primary}>
            {submitting ? "Saving.." : "Save changes"}
          </button>
        </div>
      </form>
    </>
  );
}

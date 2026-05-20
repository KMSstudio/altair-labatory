"use client";

import React, { useState } from "react";
import styles from "../../univ.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parseUnivInput } from "@/util/univ";
import { FormState } from "@/util/util";

export default function UnivCreateForm() {
  const router = useRouter();
  const [state, setState] = useState<FormState>({ status: "idle" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    let body;
    try {
      body = parseUnivInput(formData);
    } catch (err) {
      setState({
        status: "error",
        error: err instanceof Error ? err.message : "Invalid input.",
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/univ/create", {
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
          <input name="nameKo" placeholder="서울대학교" required />
        </label>
        <label>
          English name
          <input name="nameEn" placeholder="Seoul National University" />
        </label>
        <label>
          Country
          <input name="country" placeholder="Korea" />
        </label>
        <label>
          Website URL
          <input name="websiteUrl" type="url" placeholder="https://www.snu.ac.kr/" />
        </label>
        <label>
          Domain
          <input name="domain" placeholder="snu.ac.kr" />
        </label>

        <div className={`${styles.actions} ${styles.actionsEnd}`}>
          <Link href="/univ" className={styles.ghost}>
            Cancel
          </Link>
          <button type="submit" className={styles.primary}>
            {submitting ? "Creating.." : "Create"}
          </button>
        </div>
      </form>
    </>
  );
}

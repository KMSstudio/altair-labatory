"use client";

import { useState } from "react";
import { submitPIApplicationAction } from "../actions";
import { useRouter } from "next/navigation";
import { LabPicker } from "./LabPicker";

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
    console.log(labId);
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
    <form onSubmit={onSubmit}>
      <div>
        <label>Requested Name</label>
        <input
          name="requestedName"
          value={requestedName}
          onChange={(e) => SetRequestedName(e.target.value)}
          required
        />
      </div>
      <LabPicker setLabId={SetLabId} />
      <div>
        <label>Scholar URL</label>
        <input
          name="scholarUrl"
          value={scholarUrl}
          onChange={(e) => SetScholarUrl(e.target.value)}
          placeholder="https://scholar.google.com/..."
          required
        />
      </div>
      <div>
        <label>Note (optional)</label>
        <textarea name="note" value={note} onChange={(e) => SetNote(e.target.value)} />
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

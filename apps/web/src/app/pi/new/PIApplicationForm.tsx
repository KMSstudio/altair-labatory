"use client";

import { useState } from "react";
import { submitPIApplicationAction } from "./actions";
import { useRouter } from "next/navigation";

export function PIApplicationForm() {
  const [submitting, setSubmitting] = useState(false);

  const [requestedName, SetRequestedName] = useState("");
  const [labId, SetLabId] = useState("");
  const [scholarUrl,SetScholarUrl]=useState("");
  const [note, SetNote] = useState("");

  const router = useRouter();
  
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    setSubmitting(true);
    e.preventDefault();

    try {
      await submitPIApplicationAction({ requestedName, labId, scholarUrl, note });
      router.push("/check");
    } catch (error: any){
      alert(error.message);
      setSubmitting(false);
    }
  }

  return (
      <form onSubmit={onSubmit}>
        <div>
          <label>Requested Name</label>
          <input
            name="requestedName"
            value={requestedName}
            onChange={(e)=>SetRequestedName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Lab ID (optional)</label>
          <input
            name="labId"
            value={labId}
            onChange={(e)=>SetLabId(e.target.value)}
            placeholder="e.g. 10"
          />
        </div>
        <div>
          <label>Scholar URL</label>
          <input
            name="scholarUrl"
            value={scholarUrl}
            onChange={(e)=>SetScholarUrl(e.target.value)}
            placeholder="https://scholar.google.com/..."
            required
          />
        </div>
        <div>
          <label>Note (optional)</label>
          <textarea
            name="note"
            value={note}
            onChange={(e)=>SetNote(e.target.value)}
          />
        </div>
        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </form>
  );
}

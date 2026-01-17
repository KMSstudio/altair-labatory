"use client";

import { useState } from "react";
import { submitPIApplicationAction } from "./actions";

export default function PIApplicationApplyPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [requestedName, SetRequestedName] = useState("");
  const [labId, SetLabId] = useState("");
  const [scholarUrl,SetScholarUrl]=useState("");
  const [note, SetNote] = useState("");

  async function onSubmit() {
    setSubmitting(true);
    setError("");

    try {
        await submitPIApplicationAction({ requestedName: requestedName, labId: labId, scholarUrl: scholarUrl, note: note});
    } catch (e: any){
        setError(e.error);
        alert(e.message);
    } finally{
        setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Apply as PI</h1>

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

      {error && <p style={{ color: "crimson" }}>{error}</p>}

    </main>
  );
}

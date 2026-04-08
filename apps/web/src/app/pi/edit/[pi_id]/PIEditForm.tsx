"use client";

import { useState } from "react";
import { type GetLabResult, type GetPIResult, UpdatePI } from "../../actions";
import { LabPicker } from "../../LabPicker";
import { useRouter } from "next/navigation";
import styles from '../../pi.module.css'

export function PIEditFormClient({ pi, lab }: { pi: GetPIResult; lab: GetLabResult | null }) {
  const [name, setName] = useState(pi.name);
  const [email, setEmail] = useState(pi.email);
  const [scholarUrl, setScholarUrl] = useState(pi.scholarUrl);
  const [labId, setLabId] = useState(pi.labId);
  const [error, setError] = useState("");
  const router = useRouter();

  async function TryUpdatePI(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email || !name) {
      setError("Email and name are required.");
      return;
    }

    try {
      await UpdatePI(pi.id, { name, email, labId, scholarUrl });
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError("Unknown error");
      return;
    }
    router.push(`/pi/${pi.id}`);
  }
  return (
    <form onSubmit={TryUpdatePI}  className={styles.formPanel}>
      <label>
        Name *
        <input name="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </label>

      <label>
        Email *
        <input
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label>
        Google Scholar URL *
        <input
          name="scholarUrl"
          value={scholarUrl}
          onChange={(e) => setScholarUrl(e.target.value)}
          required
        />
      </label>
      <LabPicker selectedLab={lab} setLabId={setLabId} />
      <div className={styles.formActions}>
        <button type="submit"  className={styles.primary}>Save changes</button>
      </div>
      <div>{error ? <p  className={styles.errorNote}>{error}</p> : <></>}</div>
    </form>
  );
}

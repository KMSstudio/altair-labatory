import Link from "next/link";
import { prisma } from "@labatory/db";
import { mergeSubjects } from "../actions";
import styles from "../subj.module.css";

async function getSubjectsForMerge() {
  return prisma.subject.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      nameKo: true,
      nameEn: true,
      isActive: true,
    },
  });
}

export default async function MergeSubjectPage() {
  const subjects = await getSubjectsForMerge();

  return (
    <main className={styles.subjFormShell}>
      <header className={styles.formHead}>
        <div>
          <p className={styles.eyebrow}>/subj/merge</p>
          <h1>Merge subjects</h1>
          <p className={styles.lede}>
            Moves all <code>LabSubject</code> edges from <b>from</b> → <b>to</b>, then deactivates
            the source.
          </p>
        </div>
        <div className={styles.actions}>
          <Link href="/subj/list" className={styles.ghost}>
            ← Back to list
          </Link>
          <Link href="/subj/new" className={styles.primary}>
            + New subject
          </Link>
        </div>
      </header>

      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <div>
            <p className={styles.eyebrow}>Select subjects</p>
            <h3>Pick a source and destination</h3>
          </div>
        </header>

        <form action={mergeSubjects} className={styles.form}>
          <label>
            From (source) *
            <select name="fromId" required defaultValue="">
              <option value="" disabled>
                Select subject…
              </option>
              {subjects.map((s) => (
                <option key={`from-${s.id.toString()}`} value={s.id.toString()}>
                  [{s.isActive ? "A" : "I"}] {s.nameKo} / {s.nameEn} (#{s.id.toString()})
                </option>
              ))}
            </select>
          </label>

          <label>
            To (destination) *
            <select name="toId" required defaultValue="">
              <option value="" disabled>
                Select subject…
              </option>
              {subjects.map((s) => (
                <option key={`to-${s.id.toString()}`} value={s.id.toString()}>
                  [{s.isActive ? "A" : "I"}] {s.nameKo} / {s.nameEn} (#{s.id.toString()})
                </option>
              ))}
            </select>
          </label>

          <div className={`${styles.actions} ${styles.actionsEnd} ${styles.space}`}>
            <button type="submit" className={styles.primary}>
              Merge
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

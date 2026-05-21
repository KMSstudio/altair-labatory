export const dynamic = "force-dynamic";
import Link from "next/link";
import styles from "../subj.module.css";
import { getSubjects } from "@/repository/db/labatory/subject";
import SubjectMergeForm from "./SubjectMergeForm";

type MergePageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const asString = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v;

/**
 * /subj/merge
 *
 * Server Component page to merge two Subject rows.
 * The merge server action moves LabSubject edges and deactivates the source.
 *
 * @returns JSX for the merge page.
 */
export default async function MergeSubjectPage(param: Promise<MergePageProps>) {
  const subjects = await getSubjects({});
  const _param = await param;
  let { searchParams } = _param;
  searchParams = await searchParams;

  const error = asString(searchParams?.error);
  const message = asString(searchParams?.message);
  const errorText = error ? (message ?? "Request failed.") : null;

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

      {errorText && (
        <section className={`${styles.panel} ${styles.dangerZone}`}>
          <p className={styles.eyebrow}>Error</p>
          <p className={styles.value}>{errorText}</p>
        </section>
      )}

      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <div>
            <p className={styles.eyebrow}>Select subjects</p>
            <h3>Pick a source and destination</h3>
          </div>
        </header>
        <SubjectMergeForm subjects={subjects} />
      </section>
    </main>
  );


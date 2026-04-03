
export const dynamic = 'force-dynamic'
import Link from "next/link";
import { prisma } from "@labatory/db";
import { mergeSubjects } from "../actions";
import styles from "../subj.module.css";

/**
 * Loads subjects for the merge UI.
 * We order by active status first so active subjects appear at the top.
 * @returns Subjects list with minimal fields for selection.
 */
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
  const subjects = await getSubjectsForMerge();
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

        <form action={mergeSubjects} className={styles.form}>
          <div className={styles.mergeGrid}>
            <fieldset className={styles.choiceGroup}>
              <legend>From (source) *</legend>
              <div className={styles.choiceList}>
                {subjects.map((s) => (
                  <label key={`from-${s.id.toString()}`} className={styles.choiceItem}>
                    <input
                      className={styles.choiceRadio}
                      type="radio"
                      name="fromId"
                      value={s.id.toString()}
                      required
                    />
                    <span className={styles.choiceBody}>
                      <span className={styles.choiceText}>
                        <span className={styles.choiceTitle}>{s.nameKo}</span>
                        <span className={styles.choiceSub}>{s.nameEn}</span>
                      </span>
                      <span className={styles.statusTag}>{s.isActive ? "Active" : "Inactive"}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className={styles.choiceGroup}>
              <legend>To (destination) *</legend>
              <div className={styles.choiceList}>
                {subjects.map((s) => (
                  <label key={`to-${s.id.toString()}`} className={styles.choiceItem}>
                    <input
                      className={styles.choiceRadio}
                      type="radio"
                      name="toId"
                      value={s.id.toString()}
                      required
                    />
                    <span className={styles.choiceBody}>
                      <span className={styles.choiceText}>
                        <span className={styles.choiceTitle}>{s.nameKo}</span>
                        <span className={styles.choiceSub}>{s.nameEn}</span>
                      </span>
                      <span className={styles.statusTag}>{s.isActive ? "Active" : "Inactive"}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

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

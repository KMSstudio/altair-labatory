import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "../subj.module.css";
import SubjectEditForm from "./SubjectEditForm";
import { getSubjectCore } from "@/repository/db/labatory/subject";
import { getLabList } from "@/repository/db/labatory/labatory";

type SubjectPageProps = {
  params: { subj_id: string };
};

/**
 * /subj/[subj_id]
 *
 * Server Component page showing the subject detail and an update form.
 * Also displays linked labs via the `LabSubject` join relation.
 *
 * On fail-safe redirects from the update server action, this page can read
 * `searchParams` to re-hydrate the previous draft values and show error messages.
 *
 * @param props - Next.js page props.
 * @returns JSX for the subject detail page.
 */
export default async function SubjectDetailPage({ params }: SubjectPageProps) {
  params = await params;
  let id: bigint;
  try {
    id = BigInt(params.subj_id);
  } catch {
    notFound();
  }

  const subject = await getSubjectCore({ subjectId: id });
  if (!subject) notFound();

  const labs = await getLabList({ subjId: id });

  return (
    <main className={styles.subjShell}>
      <header className={styles.subjHeader}>
        <div>
          <p className={styles.eyebrow}>/subj/{params.subj_id}</p>
          <h1>{subject.nameKo}</h1>
          <p className={styles.muted}>{subject.nameEn}</p>
        </div>
        <div className={styles.actions}>
          <div className={styles.statusTag}>{subject.isActive ? "Active" : "Inactive"}</div>
          <Link className={styles.ghost} href="/subj/list">
            ← Back to list
          </Link>
          <Link className={styles.ghost} href="/subj/merge">
            Merge
          </Link>
        </div>
      </header>
      <section className={`${styles.panel} ${styles.grid}`}>
        <div>
          <p className={styles.eyebrow}>ID</p>
          <p className={styles.value}>{subject.id}</p>
        </div>
        <div>
          <p className={styles.eyebrow}>Created</p>
          <p className={styles.value}>{subject.createdAt}</p>
        </div>
        <div>
          <p className={styles.eyebrow}>Updated</p>
          <p className={styles.value}>{subject.updatedAt}</p>
        </div>
        <div>
          <p className={styles.eyebrow}>Description</p>
          <p className={`${styles.value} ${styles.muted}`}>{subject.description ?? "None"}</p>
        </div>
      </section>

      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <div>
            <p className={styles.eyebrow}>Edit</p>
            <h3>Update subject</h3>
          </div>
        </header>

        <SubjectEditForm subject={subject} />
      </section>

      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <div>
            <p className={styles.eyebrow}>Labs linked</p>
            <h3>{labs.length} lab(s)</h3>
          </div>
        </header>

        {labs.length === 0 ? (
          <p className={styles.muted}>No labs have been associated with this subject yet.</p>
        ) : (
          <ul className={styles.labGrid}>
            {labs.map((ls) => (
              <li key={`${ls.id}-${id}`} className={styles.card}>
                <p className={styles.eyebrow}>Lab ID {ls.id}</p>
                <h4>{ls.nameKo}</h4>
                {ls.nameEn && <p className={styles.muted}>{ls.nameEn}</p>}
                <p className={styles.muted}>{ls.websiteUrl ?? "No website"}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

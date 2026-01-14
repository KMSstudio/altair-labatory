import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@labatory/db";
import { updateSubject } from "../actions";
import styles from "../subj.module.css";

type SubjectPageProps = {
  params: { subj_id: string };
};

async function getSubject(subjId: bigint) {
  return prisma.subject.findUnique({
    where: { id: subjId },
    include: {
      labs: {
        include: {
          lab: {
            select: {
              id: true,
              nameKo: true,
              nameEn: true,
              websiteUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export default async function SubjectDetailPage({ params }: SubjectPageProps) {
  params = await params;
  let id: bigint;
  try {
    id = BigInt(params.subj_id);
  } catch {
    notFound();
  }

  const subject = await getSubject(id);
  if (!subject) notFound();

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
          <p className={styles.value}>{subject.id.toString()}</p>
        </div>
        <div>
          <p className={styles.eyebrow}>Created</p>
          <p className={styles.value}>{subject.createdAt.toISOString()}</p>
        </div>
        <div>
          <p className={styles.eyebrow}>Updated</p>
          <p className={styles.value}>{subject.updatedAt.toISOString()}</p>
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

        <form action={updateSubject} className={styles.form}>
          <input type="hidden" name="id" value={subject.id.toString()} />
          <label>
            Korean name *
            <input name="nameKo" defaultValue={subject.nameKo} required />
          </label>
          <label>
            English name *
            <input name="nameEn" defaultValue={subject.nameEn} required />
          </label>
          <label>
            Description
            <input name="description" defaultValue={subject.description ?? ""} />
          </label>
          <label>
            Active
            <input name="isActive" type="checkbox" defaultChecked={subject.isActive} />
          </label>

          <div className={`${styles.actions} ${styles.actionsEnd} ${styles.space}`}>
            <button type="submit" className={styles.primary}>
              Save changes
            </button>
          </div>
        </form>
      </section>

      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <div>
            <p className={styles.eyebrow}>Labs linked</p>
            <h3>{subject.labs.length} lab(s)</h3>
          </div>
        </header>

        {subject.labs.length === 0 ? (
          <p className={styles.muted}>No labs have been associated with this subject yet.</p>
        ) : (
          <ul className={styles.labGrid}>
            {subject.labs.map((ls) => (
              <li key={`${ls.labId.toString()}-${ls.subjectId.toString()}`} className={styles.card}>
                <p className={styles.eyebrow}>Lab ID {ls.lab.id.toString()}</p>
                <h4>{ls.lab.nameKo}</h4>
                {ls.lab.nameEn && <p className={styles.muted}>{ls.lab.nameEn}</p>}
                <p className={styles.muted}>{ls.lab.websiteUrl ?? "No website"}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@labatory/db";
import { updateSubject, updateSubjectLabLinks } from "../actions";
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

async function getAllLabs() {
  return prisma.lab.findMany({
    select: {
      id: true,
      nameKo: true,
      nameEn: true,
      websiteUrl: true,
    },
    orderBy: { nameKo: "asc" },
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

  const [subject, allLabs] = await Promise.all([getSubject(id), getAllLabs()]);
  if (!subject) notFound();

  const linkedSet = new Set(subject.labs.map((x) => x.labId.toString()));

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
            <h3>{subject.labs.length} linked</h3>
            <p className={styles.muted}>
              Check labs to link to this subject, then click “Save lab links”.
            </p>
          </div>
        </header>

        {allLabs.length === 0 ? (
          <p className={styles.muted}>
            No labs exist in the database yet. Create labs first, then link them here.
          </p>
        ) : (
          <form action={updateSubjectLabLinks} className={styles.linkForm}>
            <input type="hidden" name="subjectId" value={subject.id.toString()} />

            <ul className={styles.labGrid}>
              {allLabs.map((lab) => {
                const labIdStr = lab.id.toString();
                const checked = linkedSet.has(labIdStr);

                return (
                  <li key={labIdStr} className={styles.card}>
                    <div className={styles.cardHead}>
                      <div>
                        <p className={styles.eyebrow}>Lab ID {labIdStr}</p>
                        <h4>{lab.nameKo}</h4>
                        {lab.nameEn && <p className={styles.muted}>{lab.nameEn}</p>}
                        <p className={styles.muted}>{lab.websiteUrl ?? "No website"}</p>
                      </div>

                      <input
                        type="checkbox"
                        name="labIds"
                        value={labIdStr}
                        defaultChecked={checked}
                        aria-label={`Link ${lab.nameKo}`}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className={`${styles.actions} ${styles.actionsEnd} ${styles.space}`}>
              <button type="submit" className={styles.primary}>
                Save lab links
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}

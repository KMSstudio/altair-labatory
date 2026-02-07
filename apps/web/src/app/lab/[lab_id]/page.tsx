import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";

import { prisma } from "@labatory/db";
import { authOptions } from "@/lib/auth";

import styles from "../lab.module.css";

type LabPageProps = {
  // Next.js App Router can provide `params` as a Promise in recent versions.
  // Follow the same unwrapping pattern used in /subj/[subj_id].
  params: Promise<{ lab_id: string }>;
};

async function getLab(labId: bigint) {
  return prisma.lab.findUnique({
    where: { id: labId },
    include: {
      university: { select: { id: true, nameKo: true, nameEn: true } },
      pi: { select: { id: true, name: true, email: true } },
      subjects: {
        orderBy: { createdAt: "desc" },
        include: {
          subject: { select: { id: true, nameKo: true, nameEn: true, isActive: true } },
        },
      },
    },
  });
}

export default async function LabDetailPage({ params }: LabPageProps) {
  const { lab_id } = await params;

  let id: bigint;
  try {
    id = BigInt(lab_id);
  } catch {
    notFound();
  }

  const [lab, session] = await Promise.all([getLab(id), getServerSession(authOptions)]);
  if (!lab) notFound();

  let canEdit = false;
  if (session?.user?.role === "ADMIN") {
    canEdit = true;
  } else if (session?.user?.role === "PI") {
    const userId = BigInt(session.user.id);
    const pi = await prisma.pI.findUnique({ where: { userId }, select: { labId: true } });
    canEdit = !!pi?.labId && pi.labId === id;
  }

  return (
    <main className={styles.labShell}>
      <header className={styles.labHeader}>
        <div>
          <p className={styles.eyebrow}>/lab/{lab_id}</p>
          <h1>{lab.nameKo}</h1>
          {lab.nameEn && <p className={styles.muted}>{lab.nameEn}</p>}
        </div>
        <div className={styles.actions}>
          <Link href="/lab" className={styles.ghost}>
            ← Back
          </Link>
          {canEdit && (
            <Link href={`/lab/edit/${lab.id.toString()}`} className={styles.primary}>
              Edit
            </Link>
          )}
        </div>
      </header>

      <section className={`${styles.panel} ${styles.grid}`}>
        <div>
          <p className={styles.eyebrow}>ID</p>
          <p className={styles.value}>{lab.id.toString()}</p>
        </div>
        <div>
          <p className={styles.eyebrow}>University</p>
          <p className={styles.value}>
            {lab.university ? (
              <Link href={`/univ/${lab.university.id.toString()}`}>{lab.university.nameKo}</Link>
            ) : (
              "-"
            )}
          </p>
        </div>
        <div>
          <p className={styles.eyebrow}>Website</p>
          <p className={styles.value}>{lab.websiteUrl ?? "-"}</p>
        </div>
        <div>
          <p className={styles.eyebrow}>Created</p>
          <p className={styles.value}>{lab.createdAt.toISOString()}</p>
        </div>
        <div>
          <p className={styles.eyebrow}>Updated</p>
          <p className={styles.value}>{lab.updatedAt.toISOString()}</p>
        </div>
        <div>
          <p className={styles.eyebrow}>Description</p>
          <p className={`${styles.value} ${styles.muted}`}>{lab.description ?? "None"}</p>
        </div>
      </section>

      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <div>
            <p className={styles.eyebrow}>Subjects</p>
            <h3>{lab.subjects.length} subject(s)</h3>
          </div>
        </header>

        {lab.subjects.length === 0 ? (
          <p className={styles.muted}>No subjects have been associated with this lab yet.</p>
        ) : (
          <div className={styles.tagList}>
            {lab.subjects.map((ls) => (
              <Link
                key={`${ls.labId.toString()}-${ls.subjectId.toString()}`}
                href={`/subj/${ls.subject.id.toString()}`}
                className={styles.tag}
              >
                {ls.subject.nameKo}
              </Link>
            ))}
          </div>
        )}
      </section>

      {lab.pi && (
        <section className={styles.panel}>
          <header className={styles.panelHead}>
            <div>
              <p className={styles.eyebrow}>PI</p>
              <h3>{lab.pi.name}</h3>
            </div>
          </header>
          <p className={styles.muted}>{lab.pi.email}</p>
        </section>
      )}
    </main>
  );
}

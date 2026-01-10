import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@labatory/db";
import styles from "../univ.module.css";

type UnivPageProps = {
  params: { univ_id: string };
};

async function getUniversity(univId: bigint) {
  return prisma.university.findUnique({
    where: { id: univId },
    include: {
      labs: {
        select: {
          id: true,
          nameKo: true,
          nameEn: true,
          websiteUrl: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export default async function UniversityDetailPage({ params }: UnivPageProps) {
  params = await params
  let id: bigint;
  try { id = BigInt(params.univ_id); } catch { notFound(); }
  const university = await getUniversity(id);
  if (!university) { notFound(); }

  return (
    <main className={styles.univShell}>
      <header className={styles.univHeader}>
        <div>
          <p className={styles.eyebrow}>/univ/{params.univ_id}</p>
          <h1>{university.nameKo}</h1>
          {university.nameEn && <p className={styles.muted}>{university.nameEn}</p>}
        </div>
        <div className={styles.actions}>
          <Link className={styles.ghost} href="/univ">
            ← Back to list
          </Link>
          <Link className={styles.primary} href={`/univ/edit/${params.univ_id}`}>
            Edit
          </Link>
        </div>
      </header>

      <section className={`${styles.panel} ${styles.grid}`}>
        <div>
          <p className={styles.eyebrow}>Country</p>
          <p className={styles.value}>{university.country ?? "Unknown"}</p>
        </div>
        <div>
          <p className={styles.eyebrow}>Website</p>
          {university.websiteUrl ? (
            <a className={styles.value} href={university.websiteUrl} target="_blank" rel="noreferrer">
              {university.websiteUrl}
            </a>
          ) : (
            <p className={`${styles.value} ${styles.muted}`}>No website</p>
          )}
        </div>
        <div>
          <p className={styles.eyebrow}>ID</p>
          <p className={styles.value}>{university.id.toString()}</p>
        </div>
        <div>
          <p className={styles.eyebrow}>Created</p>
          <p className={styles.value}>{university.createdAt.toISOString()}</p>
        </div>
      </section>

      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <div>
            <p className={styles.eyebrow}>Labs linked</p>
            <h3>{university.labs.length} lab(s)</h3>
          </div>
        </header>
        {university.labs.length === 0 ? (
          <p className={styles.muted}>No labs have been associated with this university yet.</p>
        ) : (
          <ul className={styles.labGrid}>
            {university.labs.map((lab) => (
              <li key={lab.id.toString()} className={styles.card}>
                <p className={styles.eyebrow}>Lab ID {lab.id.toString()}</p>
                <h4>{lab.nameKo}</h4>
                {lab.nameEn && <p className={styles.muted}>{lab.nameEn}</p>}
                <p className={styles.muted}>{lab.websiteUrl ?? "No website"}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

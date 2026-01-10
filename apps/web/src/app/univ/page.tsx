import Link from "next/link";
import { prisma } from "@labatory/db";
import { deleteUniversity } from "./actions";
import styles from "./univ.module.css";

async function getUniversities() {
  return prisma.university.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export default async function UniversityListPage() {
  const universities = await getUniversities();

  return (
    <main className={styles.univShell}>
      <header className={styles.univHeader}>
        <div>
          <p className={styles.eyebrow}>Universities CRUD sample</p>
          <h1>Universities</h1>
          <p className={styles.lede}>
            Minimal Prisma-powered flow showing how to create, read, update, and delete university
            rows from <code>@labatory/db</code>.
          </p>
        </div>
        <Link className={styles.primary} href="/univ/new">
          + Add university
        </Link>
      </header>

      <section className={styles.panel}>
        {universities.length === 0 ? (
          <p className={styles.muted}>No universities yet. Add one to get started.</p>
        ) : (
          <ul className={styles.univGrid}>
            {universities.map((univ) => (
              <li key={univ.id.toString()} className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <p className={styles.eyebrow}>ID {univ.id.toString()}</p>
                    <h3>{univ.nameKo}</h3>
                    {univ.nameEn && <p className={styles.muted}>{univ.nameEn}</p>}
                  </div>
                  <div className={styles.countryTag}>{univ.country ?? "Unknown"}</div>
                </div>
                <p className={styles.muted}>{univ.websiteUrl ?? "No website"}</p>
                <div className={styles.actions}>
                  <Link href={`/univ/${univ.id.toString()}`}>View</Link>
                  <Link href={`/univ/edit/${univ.id.toString()}`}>Edit</Link>
                  <form action={deleteUniversity}>
                    <input type="hidden" name="id" value={univ.id.toString()} />
                    <button type="submit" className={styles.ghost}>
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

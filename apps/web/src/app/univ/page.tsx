export const dynamic = "force-dynamic";

import Link from "next/link";
import styles from "./univ.module.css";
import UnivDeleteButton from "./UnivDeleteForm";
import { getUniversityLists } from "@/repository/db/labatory/university";

export default async function UniversityListPage() {
  const universities = await getUniversityLists({});

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
              <li key={univ.id} className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <p className={styles.eyebrow}>ID {univ.id}</p>
                    <h3>{univ.nameKo}</h3>
                    {univ.nameEn && <p className={styles.muted}>{univ.nameEn}</p>}
                  </div>
                  <div className={styles.countryTag}>{univ.country ?? "Unknown"}</div>
                </div>
                <p className={styles.muted}>{univ.websiteUrl ?? "No website"}</p>
                <div className={styles.actions}>
                  <Link href={`/univ/${univ.id}`}>View</Link>
                  <Link href={`/univ/edit/${univ.id}`}>Edit</Link>
                  <UnivDeleteButton universityId={univ.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

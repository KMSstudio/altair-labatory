import Link from "next/link";
import { createUniversity } from "../actions";
import styles from "../univ.module.css";

export default function NewUniversityPage() {
  return (
    <main className={styles.univFormShell}>
      <header className={styles.formHead}>
        <div>
          <p className={styles.eyebrow}>/univ/new</p>
          <h1>Create university</h1>
          <p className={styles.lede}>
            Example of writing a new row through Prisma via the shared <code>@labatory/db</code>{" "}
            client.
          </p>
        </div>
        <Link href="/univ" className={styles.ghost}>
          ← Back to list
        </Link>
      </header>

      <form action={createUniversity} className={styles.form}>
        <label>
          Korean name *
          <input name="nameKo" placeholder="서울대학교" required />
        </label>
        <label>
          English name
          <input name="nameEn" placeholder="Seoul National University" />
        </label>
        <label>
          Country
          <input name="country" placeholder="Korea" />
        </label>
        <label>
          Website URL
          <input name="websiteUrl" type="url" placeholder="https://www.snu.ac.kr/" />
        </label>

        <div className={`${styles.actions} ${styles.actionsEnd}`}>
          <Link href="/univ" className={styles.ghost}>
            Cancel
          </Link>
          <button type="submit" className={styles.primary}>
            Create
          </button>
        </div>
      </form>
    </main>
  );
}

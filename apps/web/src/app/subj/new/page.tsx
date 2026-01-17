import Link from "next/link";
import { createSubject } from "../actions";
import styles from "../subj.module.css";

export default function NewSubjectPage() {
  return (
    <main className={styles.subjFormShell}>
      <header className={styles.formHead}>
        <div>
          <p className={styles.eyebrow}>/subj/new</p>
          <h1>Create subject</h1>
          <p className={styles.lede}>Minimal form for inserting a new subject row via Prisma.</p>
        </div>
        <Link href="/subj/list" className={styles.ghost}>
          ← Back to list
        </Link>
      </header>

      <form action={createSubject} className={styles.form}>
        <label>
          Korean name *
          <input name="nameKo" placeholder="컴퓨터 비전" required />
        </label>
        <label>
          English name *
          <input name="nameEn" placeholder="Computer Vision" required />
        </label>
        <label>
          Description
          <input name="description" placeholder="Short summary" />
        </label>
        <label>
          Active
          <input name="isActive" type="checkbox" defaultChecked />
        </label>

        <div className={`${styles.actions} ${styles.actionsEnd}`}>
          <Link href="/subj/list" className={styles.ghost}>
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

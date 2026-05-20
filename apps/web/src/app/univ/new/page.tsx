import Link from "next/link";
import styles from "../univ.module.css";
import UnivCreateForm from "./UnivCreateForm";

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
      <UnivCreateForm />
    </main>
  );
}

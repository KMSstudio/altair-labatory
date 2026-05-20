import Link from "next/link";
import styles from "../subj.module.css";
import SubjectCreateForm from "./SubjectCreateForm";
/**
 * /subj/new
 *
 * Renders a Subject creation form. This is a Server Component page.
 * It supports fail-safe redirects from the Server Action by reading `searchParams`
 * and re-hydrating previous draft values and error messages.
 *
 * @param props - Next.js page props.
 * @returns JSX for the create form.
 */
export default async function NewSubjectPage() {
  return (
    <main className={styles.subjFormShell}>
      <header className={styles.formHead}>
        <div>
          <p className={styles.eyebrow}>/subj/new</p>
          <h1>Create subject</h1>
          <p className={styles.lede}>
            Creates a new subject. New subjects are created as active by default.
          </p>
        </div>
        <Link href="/subj/list" className={styles.ghost}>
          ← Back to list
        </Link>
      </header>
      <SubjectCreateForm />
    </main>
  );
}

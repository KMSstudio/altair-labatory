import Link from "next/link";
import { createSubject } from "../actions";
import styles from "../subj.module.css";

type NewSubjectPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

/**
 * Normalizes Next.js `searchParams` values.
 *
 * Next.js may provide a value as either a single string or an array of strings.
 * For this page we only ever use the first value.
 *
 * @param v - Raw query param value.
 * @returns Single string or undefined.
 */
const asString = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

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
export default async function NewSubjectPage({ searchParams }: NewSubjectPageProps) {
  searchParams = await searchParams;
  const error = asString(searchParams?.error);
  const fields = (asString(searchParams?.fields) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const message = asString(searchParams?.message);

  const nameKo = asString(searchParams?.nameKo) ?? "";
  const nameEn = asString(searchParams?.nameEn) ?? "";
  const description = asString(searchParams?.description) ?? "";
  const isActive = (asString(searchParams?.isActive) ?? "true") === "true";

  const errorText =
    error === "unique"
      ? `Unique constraint failed${fields.length ? `: ${fields.join(", ")}` : ""}. Use a different name.`
      : error === "validation"
        ? message ?? "Invalid input."
        : error
          ? message ?? "Request failed."
          : null;

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

      {errorText && (
        <section className={`${styles.panel} ${styles.dangerZone}`}>
          <p className={styles.eyebrow}>Error</p>
          <p className={styles.value}>{errorText}</p>
          {error === "unique" && (
            <p className={styles.muted}>
              Duplicate Korean/English name is not allowed (DB unique constraint).
            </p>
          )}
        </section>
      )}

      <form action={createSubject} className={styles.form}>
        <label>
          Korean name *
          <input name="nameKo" placeholder="컴퓨터 비전" defaultValue={nameKo} required />
        </label>
        <label>
          English name *
          <input name="nameEn" placeholder="Computer Vision" defaultValue={nameEn} required />
        </label>
        <label>
          Description
          <input name="description" placeholder="Short summary" defaultValue={description} />
        </label>
        <label>
          Active
          <input name="isActive" type="checkbox" defaultChecked={isActive} />
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

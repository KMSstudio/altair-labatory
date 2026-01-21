import Link from "next/link";
import { prisma } from "@labatory/db";
import styles from "../subj.module.css";

type ListPageProps = {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Normalizes a query parameter that may come as a string or string[].
 *
 * @param value - Raw query param value.
 * @returns Single string (empty string when missing).
 */
const normalizeQuery = (value: string | string[] | undefined): string => {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
};

/**
 * Restricts status filter to a safe union type.
 *
 * @param value - Normalized string.
 * @returns "all" | "active" | "inactive".
 */
const normalizeFilter = (value: string): "all" | "active" | "inactive" => {
  if (value === "active" || value === "inactive") return value;
  return "all";
};

/**
 * Loads subjects from the database with basic search and status filtering.
 *
 * @param params - Search query and status filter.
 * @returns List of subjects (selected fields).
 */
async function getSubjects(params: { q: string; status: "all" | "active" | "inactive" }) {
  const where: any = {};
  const q = params.q.trim();
  if (q.length) {
    where.OR = [
      { nameKo: { contains: q, mode: "insensitive" } },
      { nameEn: { contains: q, mode: "insensitive" } },
    ];
  }

  if (params.status === "active") where.isActive = true;
  if (params.status === "inactive") where.isActive = false;

  return prisma.subject.findMany({
    where,
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      nameKo: true,
      nameEn: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * /subj/list
 *
 * Server Component page that lists subjects and provides GET-based filters.
 *
 * @param props - Next.js page props.
 * @returns JSX for the list page.
 */
export default async function SubjectListPage({ searchParams }: ListPageProps) {
  const sp = (await searchParams) ?? {};
  const q = normalizeQuery(sp.q);
  const status = normalizeFilter(normalizeQuery(sp.status));

  const subjects = await getSubjects({ q, status });

  return (
    <main className={styles.subjShell}>
      <header className={styles.subjHeader}>
        <div>
          <p className={styles.eyebrow}>/subj/list</p>
          <h1>Subjects</h1>
          <p className={styles.lede}>Search and browse research subjects.</p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.ghost} href="/subj/merge">
            Merge
          </Link>
          <Link className={styles.primary} href="/subj/new">
            + Add subject
          </Link>
        </div>
      </header>

      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <div>
            <p className={styles.eyebrow}>Filters</p>
            <h3>{subjects.length} result(s)</h3>
          </div>
        </header>

        <form className={styles.form} method="get" action="/subj/list">
          <label>
            Query
            <input name="q" placeholder="Search by nameKo / nameEn" defaultValue={q} />
          </label>
          <label>
            Status
            <select name="status" defaultValue={status}>
              <option value="all">All</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </label>

          <div className={`${styles.actions} ${styles.actionsEnd}`}>
            <Link href="/subj/list" className={styles.ghost}>
              Reset
            </Link>
            <button type="submit" className={styles.primary}>
              Search
            </button>
          </div>
        </form>
      </section>

      <section className={styles.panel}>
        {subjects.length === 0 ? (
          <p className={styles.muted}>No subjects match your query.</p>
        ) : (
          <ul className={styles.subjGrid}>
            {subjects.map((s) => (
              <li key={s.id.toString()} className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <p className={styles.eyebrow}>ID {s.id.toString()}</p>
                    <h3>{s.nameKo}</h3>
                    <p className={styles.muted}>{s.nameEn}</p>
                  </div>
                  <div className={styles.statusTag}>{s.isActive ? "Active" : "Inactive"}</div>
                </div>

                <p className={styles.muted}>{s.description ?? "No description"}</p>

                <div className={styles.actions}>
                  <Link href={`/subj/${s.id.toString()}`}>View</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

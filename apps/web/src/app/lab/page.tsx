import Link from "next/link";
import { getServerSession } from "next-auth";

import { prisma } from "@labatory/db";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";

import styles from "./lab.module.css";
import { LabListItem } from "./LabListItem";

type ListPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const normalizeQuery = (value: string | string[] | undefined): string => {
  if (!value) return "";
  return Array.isArray(value) ? (value[0] ?? "") : value;
};

const normalizeScope = (value: string): "all" | "lab" | "univ" | "subj" => {
  if (value === "lab" || value === "univ" || value === "subj") return value;
  return "all";
};

async function getLabs(params: { q: string; scope: "all" | "lab" | "univ" | "subj" }) {
  const where: Prisma.LabWhereInput = {};
  const q = params.q.trim();
  const query = (q: string) => ({
    contains: q, mode: Prisma.QueryMode.insensitive
  })
  if (q.length) {
    const labName = [
      { nameKo: query(q) },
      { nameEn: query(q) },
    ];
    const univName = [
      { university: { nameKo: query(q) } },
      { university: { nameEn: query(q) } },
    ];
    const subjName = [
      {
        subjects: {
          some: {
            subject: {
              OR: [
                { nameKo: query(q) },
                { nameEn: query(q) },
              ],
            },
          },
        },
      },
    ];

    if (params.scope === "lab") where.OR = labName;
    else if (params.scope === "univ") where.OR = univName;
    else if (params.scope === "subj") where.OR = subjName;
    else where.OR = [...labName, ...univName, ...subjName];
  }

  return prisma.lab.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      nameKo: true,
      nameEn: true,
      websiteUrl: true,
      description: true,
      createdAt: true,
      university: { select: { id: true, nameKo: true, nameEn: true } },
      subjects: {
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          subject: { select: { id: true, nameKo: true, nameEn: true } },
        },
      },
    },
  });
}

export default async function LabListPage({ searchParams }: ListPageProps) {
  const sp = (await searchParams) ?? {};
  const q = normalizeQuery(sp.q);
  const scope = normalizeScope(normalizeQuery(sp.scope));

  const [session, labs] = await Promise.all([getServerSession(authOptions), getLabs({ q, scope })]);

  const isAdmin = session?.user?.role === "ADMIN";

  let editableLabId: bigint | null = null;
  if (!isAdmin && session?.user?.role === "PI") {
    const userId = BigInt(session.user.id);
    const pi = await prisma.pI.findUnique({ where: { userId }, select: { labId: true } });
    editableLabId = pi?.labId ?? null;
  }

  return (
    <main className={styles.labShell}>
      <header className={styles.labHeader}>
        <div>
          <p className={styles.eyebrow}>/lab</p>
          <h1>Labs</h1>
          <p className={styles.lede}>Search labs by lab name, university, or subject.</p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/lab/new">
            + Add lab
          </Link>
        </div>
      </header>

      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <div>
            <p className={styles.eyebrow}>Filters</p>
            <h3>{labs.length} result(s)</h3>
          </div>
        </header>

        <form className={styles.form} method="get" action="/lab">
          <label>
            Query
            <input name="q" placeholder="Search by lab / university / subject" defaultValue={q} />
          </label>
          <label>
            Scope
            <select name="scope" defaultValue={scope}>
              <option value="all">All</option>
              <option value="lab">Lab</option>
              <option value="univ">University</option>
              <option value="subj">Subject</option>
            </select>
          </label>

          <div className={`${styles.actions} ${styles.actionsEnd}`}>
            <Link href="/lab" className={styles.ghost}>
              Reset
            </Link>
            <button type="submit" className={styles.primary}>
              Search
            </button>
          </div>
        </form>
      </section>

      <section className={styles.panel}>
        {labs.length === 0 ? (
          <p className={styles.muted}>No labs match your query.</p>
        ) : (
          <ul className={styles.labGrid}>
            {labs.map((lab) => {
              const subjectNames = lab.subjects.map((s) => s.subject.nameKo);
              const canEdit = isAdmin || (editableLabId !== null && editableLabId === lab.id);
              return LabListItem({ lab, subjectNames, canEdit });
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

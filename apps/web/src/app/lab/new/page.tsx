import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { prisma } from "@labatory/db";
import { authOptions } from "@/lib/auth";

import { createLab } from "../actions";
import styles from "../lab.module.css";

type NewPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const asString = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v;

async function getUniversities() {
  return prisma.university.findMany({
    orderBy: [{ nameKo: "asc" }],
    select: { id: true, nameKo: true, nameEn: true },
  });
}

async function getSubjects() {
  return prisma.subject.findMany({
    where: { isActive: true },
    orderBy: [{ nameKo: "asc" }],
    select: { id: true, nameKo: true, nameEn: true },
  });
}

export default async function LabNewPage({ searchParams }: NewPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/");
  if (session.user.role !== "ADMIN" && session.user.role !== "PI") redirect("/");

  searchParams = await searchParams;

  const [universities, subjects] = await Promise.all([getUniversities(), getSubjects()]);

  const error = asString(searchParams?.error);
  const fields = (asString(searchParams?.fields) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const message = asString(searchParams?.message);

  const nameKoDraft = asString(searchParams?.nameKo) ?? "";
  const nameEnDraft = asString(searchParams?.nameEn) ?? "";
  const websiteUrlDraft = asString(searchParams?.websiteUrl) ?? "";
  const descriptionDraft = asString(searchParams?.description) ?? "";
  const universityIdDraft = asString(searchParams?.universityId) ?? "";
  const subjectIdsDraft = (asString(searchParams?.subjectIds) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const newSubjectNameKoDraft = asString(searchParams?.newSubjectNameKo) ?? "";
  const newSubjectNameEnDraft = asString(searchParams?.newSubjectNameEn) ?? "";
  const newSubjectDescriptionDraft = asString(searchParams?.newSubjectDescription) ?? "";

  const errorHandlers: Record<string, () => string> = {
    unique: () =>
      `Unique constraint failed${
        fields.length ? `: ${fields.join(", ")}` : ""
      }. Use a different value.`,
    validation: () => message ?? "Invalid input.",
  };

  const errorText =
    error == null ? null : (errorHandlers[error]?.() ?? message ?? "Request failed.");

  return (
    <main className={styles.labFormShell}>
      <header className={styles.formHead}>
        <div>
          <p className={styles.eyebrow}>/lab/new</p>
          <h1>Create lab</h1>
          <p className={styles.lede}>Create a lab and optionally attach subjects.</p>
        </div>
        <div className={styles.actions}>
          <Link href="/lab" className={styles.ghost}>
            ← Back
          </Link>
        </div>
      </header>

      {session.user.role === "PI" && (
        <section className={`${styles.panel} ${styles.dangerZone}`}>
          <p className={styles.eyebrow}>Note</p>
          <p className={styles.value}>
            As a PI, the created lab will be linked to your PI profile.
          </p>
        </section>
      )}

      {errorText && (
        <section className={`${styles.panel} ${styles.dangerZone}`}>
          <p className={styles.eyebrow}>Error</p>
          <p className={styles.value}>{errorText}</p>
        </section>
      )}

      <form action={createLab} className={styles.form}>
        <label>
          Lab name (Korean) *
          <input name="nameKo" defaultValue={nameKoDraft} required />
        </label>
        <label>
          Lab name (English)
          <input name="nameEn" defaultValue={nameEnDraft} />
        </label>
        <label>
          Website URL
          <input name="websiteUrl" type="url" defaultValue={websiteUrlDraft} />
        </label>
        <label>
          Description
          <textarea name="description" defaultValue={descriptionDraft} />
        </label>
        <label>
          University
          <select name="universityId" defaultValue={universityIdDraft}>
            <option value="">(None)</option>
            {universities.map((u) => (
              <option key={u.id.toString()} value={u.id.toString()}>
                {u.nameKo}
                {u.nameEn ? ` (${u.nameEn})` : ""}
              </option>
            ))}
          </select>
        </label>

        <div>
          <p className={styles.eyebrow}>Subjects</p>
          <div className={styles.scrollBox}>
            {subjects.length === 0 ? (
              <p className={styles.muted}>No subjects available.</p>
            ) : (
              <div className={styles.checkList}>
                {subjects.map((s) => {
                  const checked = subjectIdsDraft.includes(s.id.toString());
                  return (
                    <label key={s.id.toString()} className={styles.checkItem}>
                      <input
                        type="checkbox"
                        name="subjectIds"
                        value={s.id.toString()}
                        defaultChecked={checked}
                      />
                      <span className={styles.checkBody}>
                        <span className={styles.checkTitle}>{s.nameKo}</span>
                        <span className={styles.checkSub}>{s.nameEn}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          <p className={styles.muted}>
            Select existing subjects to associate with this lab. You can also create one new subject
            below.
          </p>
        </div>

        <div>
          <p className={styles.eyebrow}>Create a new subject</p>
          <p className={styles.muted}>Optional. Provide both Korean and English names to create.</p>
          <label>
            New subject name (Korean)
            <input name="newSubjectNameKo" defaultValue={newSubjectNameKoDraft} />
          </label>
          <label>
            New subject name (English)
            <input name="newSubjectNameEn" defaultValue={newSubjectNameEnDraft} />
          </label>
          <label>
            New subject description
            <input name="newSubjectDescription" defaultValue={newSubjectDescriptionDraft} />
          </label>
        </div>

        <div className={`${styles.actions} ${styles.actionsEnd} ${styles.space}`}>
          <button type="submit" className={styles.primary}>
            Create
          </button>
        </div>
      </form>
    </main>
  );
}

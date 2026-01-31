import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { prisma } from "@labatory/db";
import { authOptions } from "@/lib/auth";

import { updateLab } from "../../actions";
import styles from "../../lab.module.css";

type LabEditPageProps = {
  // Next.js App Router can provide `params` as a Promise in recent versions.
  // Follow the same unwrapping pattern used in /subj/[subj_id].
  params: Promise<{ lab_id: string }>;
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

async function getLab(labId: bigint) {
  return prisma.lab.findUnique({
    where: { id: labId },
    include: {
      university: { select: { id: true, nameKo: true, nameEn: true } },
      subjects: { select: { subjectId: true } },
    },
  });
}

export default async function LabEditPage({ params, searchParams }: LabEditPageProps) {
  const { lab_id } = await params;
  searchParams = await searchParams;

  let labId: bigint;
  try {
    labId = BigInt(lab_id);
  } catch {
    notFound();
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/");
  if (session.user.role !== "ADMIN" && session.user.role !== "PI") redirect("/");

  if (session.user.role === "PI") {
    const userId = BigInt(session.user.id);
    const pi = await prisma.pI.findUnique({ where: { userId }, select: { labId: true } });
    if (!pi?.labId || pi.labId !== labId) redirect("/");
  }

  const [lab, universities, subjects] = await Promise.all([
    getLab(labId),
    getUniversities(),
    getSubjects(),
  ]);
  if (!lab) notFound();

  const error = asString(searchParams?.error);
  const fields = (asString(searchParams?.fields) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const message = asString(searchParams?.message);

  const nameKo = asString(searchParams?.nameKo) ?? lab.nameKo;
  const fromSearch = (
    sp: string | string[] | undefined,
    fallback: string | null | undefined,
  ): string => {
    const v = asString(sp) ?? "";
    return v !== undefined ? (v ?? "") : (fallback ?? "");
  };

  const nameEn = fromSearch(searchParams?.nameEn, lab.nameEn);
  const websiteUrl = fromSearch(searchParams?.websiteUrl, lab.websiteUrl);
  const description = fromSearch(searchParams?.description, lab.description);
  const universityId = fromSearch(
    searchParams?.universityId,
    lab.universityId?.toString(),
  );

  const subjectIdsParam = asString(searchParams?.subjectIds);
  const subjectIdsSelected =
    subjectIdsParam !== undefined
      ? subjectIdsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
      : lab.subjects.map((x) => x.subjectId.toString());

  const newSubjectNameKo = asString(searchParams?.newSubjectNameKo) ?? "";
  const newSubjectNameEn = asString(searchParams?.newSubjectNameEn) ?? "";
  const newSubjectDescription = asString(searchParams?.newSubjectDescription) ?? "";

  const errorHandlers: Record<string, () => string> = {
    unique: () =>
      `Unique constraint failed${fields.length ? `: ${fields.join(", ")}` : ""
      }. Use a different value.`,
    validation: () => message ?? "Invalid input.",
  };

  const errorText =
    error == null
      ? null
      : (errorHandlers[error]?.() ?? message ?? "Request failed.");

  return (
    <main className={styles.labFormShell}>
      <header className={styles.formHead}>
        <div>
          <p className={styles.eyebrow}>/lab/edit/{lab_id}</p>
          <h1>Edit lab</h1>
          <p className={styles.lede}>Update lab metadata and subject links.</p>
        </div>
        <div className={styles.actions}>
          <Link href={`/lab/${labId.toString()}`} className={styles.ghost}>
            ← Back
          </Link>
        </div>
      </header>

      {errorText && (
        <section className={`${styles.panel} ${styles.dangerZone}`}>
          <p className={styles.eyebrow}>Error</p>
          <p className={styles.value}>{errorText}</p>
        </section>
      )}

      <form action={updateLab} className={styles.form}>
        <input type="hidden" name="id" value={labId.toString()} />

        <label>
          Lab name (Korean) *
          <input name="nameKo" defaultValue={nameKo} required />
        </label>
        <label>
          Lab name (English)
          <input name="nameEn" defaultValue={nameEn} />
        </label>
        <label>
          Website URL
          <input name="websiteUrl" type="url" defaultValue={websiteUrl} />
        </label>
        <label>
          Description
          <textarea name="description" defaultValue={description} />
        </label>
        <label>
          University
          <select name="universityId" defaultValue={universityId}>
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
                  const checked = subjectIdsSelected.includes(s.id.toString());
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
            Uncheck to remove. Check to add. You can also create one new subject below.
          </p>
        </div>

        <div>
          <p className={styles.eyebrow}>Create a new subject</p>
          <p className={styles.muted}>Optional. Provide both Korean and English names to create.</p>
          <label>
            New subject name (Korean)
            <input name="newSubjectNameKo" defaultValue={newSubjectNameKo} />
          </label>
          <label>
            New subject name (English)
            <input name="newSubjectNameEn" defaultValue={newSubjectNameEn} />
          </label>
          <label>
            New subject description
            <input name="newSubjectDescription" defaultValue={newSubjectDescription} />
          </label>
        </div>

        <div className={`${styles.actions} ${styles.actionsEnd} ${styles.space}`}>
          <button type="submit" className={styles.primary}>
            Save
          </button>
        </div>
      </form>
    </main>
  );
}

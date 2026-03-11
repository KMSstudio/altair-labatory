import Link from "next/link";
import { Prisma } from "@labatory/db";
import styles from "./lab.module.css";

type LabWithSubject = Prisma.LabGetPayload<{
  select: {
    id: true;
    nameKo: true;
    nameEn: true;
    websiteUrl: true;
    description: true;
    createdAt: true;
    university: { select: { id: true; nameKo: true; nameEn: true } };
    subjects: {
      take: 8;
      orderBy: { createdAt: "desc" };
      select: {
        subject: { select: { id: true; nameKo: true; nameEn: true } };
      };
    };
  };
}>;

export function LabListItem({
  lab,
  subjectNames,
  canEdit,
}: {
  lab: LabWithSubject;
  subjectNames: string[];
  canEdit: boolean;
}) {
  return (
    <li key={lab.id.toString()}>
      <Link href={`/lab/${lab.id.toString()}`} className={`${styles.card} ${styles.cardLink}`}>
        <div className={styles.cardHead}>
          <div>
            <h3>{lab.nameKo}</h3>
            <p className={styles.muted}>{lab.nameEn ?? ""}</p>
          </div>
          {canEdit && <div className={styles.statusTag}>Editable</div>}
        </div>

        <p className={styles.muted}>
          {lab.university ? `University: ${lab.university.nameKo}` : "University: -"}
        </p>

        {subjectNames.length > 0 ? (
          <div className={styles.tagList}>
            {subjectNames.slice(0, 6).map((t, idx) => (
              <span key={`${lab.id.toString()}-tag-${idx}`} className={styles.tag}>
                {t}
              </span>
            ))}
            {subjectNames.length > 6 && (
              <span className={styles.tag}>+{subjectNames.length - 6}</span>
            )}
          </div>
        ) : (
          <p className={styles.muted}>No subjects</p>
        )}

        {lab.websiteUrl && <p className={styles.muted}>{lab.websiteUrl}</p>}
        {lab.description && <p className={styles.muted}>{lab.description}</p>}
      </Link>

      {canEdit && (
        <div className={`${styles.actions} ${styles.space}`}>
          <Link href={`/lab/${lab.id.toString()}`} className={styles.ghost}>
            View
          </Link>
          {canEdit && (
            <Link href={`/lab/edit/${lab.id.toString()}`} className={styles.primary}>
              Edit
            </Link>
          )}
        </div>
      )}
    </li>
  );
}

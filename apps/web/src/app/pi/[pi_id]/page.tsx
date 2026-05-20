import { notFound } from "next/navigation";
import styles from "../pi.module.css";
import { getPiCore } from "@/repository/db/labatory/pi";
import { getLabCore } from "@/repository/db/labatory/labatory";

export default async function PIDetailPage({ params }: { params: { pi_id: string } }) {
  params = await params;
  let piId: bigint;
  try {
    piId = BigInt(params.pi_id);
  } catch {
    notFound();
  }

  const pi = await getPiCore({ piId });
  if (!pi) notFound();

  let labId: bigint | null = null;
  if (pi.labId) {
    try {
      labId = BigInt(pi.labId);
    } catch {
      notFound();
    }
  }
  const lab = labId ? await getLabCore({ id: labId }) : null;

  return (
    <main className={styles.piShell}>
      <header></header>

      <section className={styles.panel}>
        <div>
          <h1 className={styles.panelTitle}>PI Info</h1>
        </div>
        <div className={styles.row}>
          <strong className={styles.rowLabel}>Name:</strong>{" "}
          <span className={styles.rowValue}>{pi.name}</span>
        </div>
        <div className={styles.row}>
          <strong className={styles.rowLabel}>Email:</strong>{" "}
          <span className={styles.rowValue}>{pi.email}</span>
        </div>

        <div className={styles.row}>
          <strong className={styles.rowLabel}>ScholarUrl:</strong>{" "}
          <span className={styles.rowValue}>{pi.scholarUrl ?? "Not assigned"}</span>
        </div>

        <div className={styles.row}>
          <strong className={styles.rowLabel}>createdAt:</strong>{" "}
          <span className={styles.rowValue}>{pi.createdAt}</span>
        </div>
      </section>

      <section className={styles.panel}>
        <div>
          <h1 className={styles.panelTitle}>Linked Lab Info</h1>
        </div>
        {!lab ? (
          <div>
            <p className={styles.emptyNote}>Lab not linked</p>
          </div>
        ) : (
          <>
            <div className={styles.row}>
              <strong className={styles.rowLabel}>Korean name:</strong>{" "}
              <span className={styles.rowValue}>{lab.nameKo}</span>
            </div>
            <div className={styles.row}>
              <strong className={styles.rowLabel}>English name:</strong>{" "}
              <span className={styles.rowValue}>{lab.nameEn}</span>
            </div>
            <div className={styles.row}>
              <strong className={styles.rowLabel}>Lab website Url:</strong>{" "}
              <span className={styles.rowValue}>{lab.websiteUrl}</span>
            </div>
            <div className={styles.row}>
              <strong className={styles.rowLabel}>Description:</strong>{" "}
              <span className={styles.rowValue}>{lab.description}</span>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

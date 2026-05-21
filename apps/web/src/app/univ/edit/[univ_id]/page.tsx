import Link from "next/link";
import { notFound } from "next/navigation";
import { getUniversityCore } from "@/repository/db/labatory/university";
import styles from "../../univ.module.css";
import UnivEditForm from "./UnivEditForm";
import UnivDeleteButton from "../../UnivDeleteForm";

type EditPageProps = {
  params: { univ_id: string };
};

export default async function EditUniversityPage({ params }: EditPageProps) {
  params = await params;

  let universityId: bigint;
  try {
    universityId = BigInt(params.univ_id);
  } catch {
    notFound();
  }

  const univ = await getUniversityCore({ universityId });
  if (!univ) {
    notFound();
  }

  return (
    <main className={styles.univFormShell}>
      <header className={styles.formHead}>
        <div>
          <p className={styles.eyebrow}>/univ/edit/{params.univ_id}</p>
          <h1>Edit university</h1>
          <p className={styles.lede}>
            Server action demo for updating and deleting a university through Prisma.
          </p>
        </div>
        <div className={styles.actions}>
          <Link href={`/univ/${params.univ_id}`} className={styles.ghost}>
            ← Back to detail
          </Link>
          <Link href="/univ" className={styles.ghost}>
            List
          </Link>
        </div>
      </header>
      <UnivEditForm univ={univ} />
      <div className={`${styles.actions} ${styles.actionsEnd} ${styles.space}`}>
        <UnivDeleteButton universityId={params.univ_id} />
      </div>
    </main>
  );
}

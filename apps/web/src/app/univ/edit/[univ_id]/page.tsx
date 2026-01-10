import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@labatory/db";
import { updateUniversity, deleteUniversity } from "../../actions";
import styles from "../../univ.module.css";

type EditPageProps = {
  params: { univ_id: string };
};

async function getUniversity(univId: bigint) {
  return prisma.university.findUnique({
    where: { id: univId },
  });
}

export default async function EditUniversityPage({ params }: EditPageProps) {
  params = await params
  let id: bigint;
  try { id = BigInt(params.univ_id); } catch { notFound(); }
  const university = await getUniversity(id);
  if (!university) { notFound(); }

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

      <form action={updateUniversity} className={styles.form}>
        <input type="hidden" name="id" value={university.id.toString()} />
        <label>
          Korean name *
          <input name="nameKo" defaultValue={university.nameKo} required />
        </label>
        <label>
          English name
          <input name="nameEn" defaultValue={university.nameEn ?? ""} />
        </label>
        <label>
          Country
          <input name="country" defaultValue={university.country ?? ""} />
        </label>
        <label>
          Website URL
          <input name="websiteUrl" type="url" defaultValue={university.websiteUrl ?? ""} />
        </label>

        <div className={`${styles.actions} ${styles.actionsEnd} ${styles.space}`}>
          <button type="submit" className={styles.primary}>
            Save changes
          </button>
        </div>
      </form>

      <form action={deleteUniversity} className={`${styles.form} ${styles.dangerZone}`}>
        <input type="hidden" name="id" value={university.id.toString()} />
        <div className={`${styles.actions} ${styles.actionsEnd} ${styles.space}`}>
          <button type="submit" className={styles.danger}>
            Delete university
          </button>
        </div>
      </form>=
    </main>
  );
}

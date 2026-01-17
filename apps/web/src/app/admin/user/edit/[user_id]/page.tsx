import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@labatory/db";
import { updateUser } from "../../actions";
import Layout from "../../../layout";
import styles from "../../../admin.module.css";

async function getUser(userId: bigint) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export default async function EditUserPage({ params }: {
  params:{ user_id : string }
}) {
  params = await params;

  let id: bigint;
  try {
    id = BigInt(params.user_id);
  } catch {
    notFound();
  }

  const user = await getUser(id);
  if (!user) notFound();

  return (
    <Layout>
      <main className={styles.adminShell}>
        <header className={styles.adminHeader}>
          <div>
            <p className={styles.eyebrow}>/admin/users/edit/{params.user_id}</p>
            <h1>Edit user</h1>
            <p className={styles.lede}>
              Server action demo for updating and deleting a user through Prisma.
            </p>
          </div>

          <div className={`${styles.actions} ${styles.actionsEnd}`}>
            <Link className={styles.ghost} href={`/admin/user/${params.user_id}`}>
              ← Back to detail
            </Link>
            <Link className={styles.ghost} href="/admin/user">
              List
            </Link>
          </div>
        </header>

        <form className={styles.form} action={updateUser}>
          <input type="hidden" name="id" value={user.id.toString()} />

          <label>
            Display name *
            <input
              name="displayName"
              defaultValue={user.displayName}
              required
            />
          </label>

          <label>
            Primary email
            <input
              name="primaryEmail"
              type="email"
              defaultValue={user.primaryEmail ?? ""}
            />
          </label>


          <div className={`${styles.actions} ${styles.actionsEnd}`}>
            <button className={styles.primary} type="submit">
              Save changes
            </button>
          </div>
        </form>

      </main>
    </Layout>
  );
}

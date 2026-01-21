import { prisma } from "@labatory/db";
import { UserSearchList } from "./section/UserSearchList";
import { AdminManageConsole } from "./section/AdminManageConsole";
import { PIManageConsole } from "./section/PIManageConsole";
import Layout from "../layout";
import styles from "../admin.module.css";

export default async function AdminUserPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      displayName: true,
      role: true,
      primaryEmail: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <Layout>
      <main className={styles.adminShell}>
        <header className={styles.adminHeader}>
          <div>
            <p className={styles.eyebrow}>Admin</p>
            <h1>Users</h1>
            <p className={styles.lede}>Prisma Based User Table Request (Administrator only)</p>
          </div>
        </header>

        <UserSearchList initialUsers={users} />
        <AdminManageConsole />
        <PIManageConsole />
      </main>
    </Layout>
  );
}

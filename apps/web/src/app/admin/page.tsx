// @/app/admin/page.tsx

import Link from "next/link";
import styles from "./admin.module.css";

export default function AdminPage() {
  return (
    <main className={styles.adminShell}>
      <header className={styles.adminHeader}>
        <div>
          <p className={styles.eyebrow}>Admin console</p>
          <h1>Admin</h1>
          <p className={styles.lede}>Manage users, roles, and access.</p>
        </div>
      </header>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2>Admin sections</h2>
            <p className={styles.muted}>
              Each button opens a dedicated admin area.
            </p>
          </div>
        </div>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/admin/user">
            Go to User Management
          </Link>
          <Link className={styles.ghost} href="/admin/pi">
            Go to PI Application Management
          </Link>
        </div>
      </section>
    </main>
  );
}

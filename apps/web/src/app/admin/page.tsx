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
        <Link className={styles.primary} href="/admin/user">
          <button type="button">
            Go to User Management
          </button>
        </Link>
        <Link href="/admin/pi">
          <button type="button">
            Go to PI Application Management
          </button>
        </Link>
      </header>
    </main>
  );
}

// @/app/admin/page.tsx

import Link from "next/link";

export default function AdminPage() {
  return (
    <main>
      <h1>Admin</h1>
      <Link href="/admin/user">
        <button type="button">
          Go to User Management
        </button>
      </Link>
      <Link href="/admin/pi">
        <button type="button">
          Go to PI Application Management
        </button>
      </Link>
    </main>
  );
}

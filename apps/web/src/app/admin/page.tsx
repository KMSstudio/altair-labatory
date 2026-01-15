import Layout from "./layout";
import Link from "next/link";

export default function AdminPage() {

  return (
    <Layout>
      <main>
        <h1>Admin</h1>
        <Link href="/admin/user">
          <button type="button">
            Go to User Management
          </button>
        </Link>
      </main>
    </Layout>
  );
}

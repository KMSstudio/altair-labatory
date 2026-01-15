import { useRouter } from "next/navigation";
import Layout from "./layout";

export default function AdminPage() {
  const router = useRouter();

  return (
    <Layout>
      <main>
        <h1>Admin</h1>

        <button
          type="button"
          onClick={() => router.push("/admin/user")}
        >
          Go to User Management
        </button>
      </main>
    </Layout>
  );
}

import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  return (
    <main>
      <h1>Admin</h1>

      <button
        type="button"
        onClick={() => router.push("/admin/user")}
      >
        Go to User Management
      </button>
    </main>
  );
}

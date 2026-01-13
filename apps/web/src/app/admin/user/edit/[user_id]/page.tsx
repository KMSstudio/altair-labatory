import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRole,prisma } from "@labatory/db";
import { updateUser,deleteUser } from "../../actions";
type EditPageProps = {
  params: { user_id: string };
};

async function getUser(userId: bigint) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export default async function EditUserPage({ params }: EditPageProps) {
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
    <main>
      <header>
        <div>
          <p>/admin/users/edit/{params.user_id}</p>
          <h1>Edit user</h1>
          <p>Server action demo for updating and deleting a user through Prisma.</p>
        </div>

        <div>
          <Link href={`/admin/user/${params.user_id}`}>
            ← Back to detail
          </Link>{" "}
          |{" "}
          <Link href="/admin/user">
            List
          </Link>
        </div>
      </header>

      {/* ===== Update form ===== */}
      <form action={updateUser}>
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

        {user.role!=="ADMIN" && (
          <label>
          Role
          <select name="role" defaultValue={user.role}>
            <option value="USER">USER</option>
            <option value="PI">PI</option>
          </select>
        </label>)}

        <div>
          <button type="submit">
            Save changes
          </button>
        </div>
      </form>

    </main>
  );
}

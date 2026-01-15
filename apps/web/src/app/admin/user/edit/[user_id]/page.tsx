import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@labatory/db";
import { updateUser } from "../../actions";
import Layout from "../../../layout";

async function getUser(userId: bigint) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export default async function EditUserPage({ params }: {params:{user_id:string}}) {
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


          <div>
            <button type="submit">
              Save changes
            </button>
          </div>
        </form>

      </main>
    </Layout>
  );
}

import Link from "next/link";
import { prisma } from "@labatory/db";

/** =========================
 *  User query section
 *  ========================= */
async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      displayName: true,
      role: true,
      primaryEmail: true,
      createdAt: true,
    },
  });
}

function UserListSection({
  users,
}: {
  users: Array<{
    id: bigint;
    displayName: string;
    role: string;
    primaryEmail: string | null;
    createdAt: Date;
  }>;
}) {
  return (
    <section>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id.toString()}>
              <div>
                <p>ID {user.id.toString()}</p>
                <h3>{user.displayName}</h3>
                {user.primaryEmail && <p>{user.primaryEmail}</p>}
                <p>Role: {user.role}</p>
                <p>Created at: {user.createdAt.toLocaleDateString()}</p>
              </div>

              <div>
                <Link href={`/admin/users/edit/${user.id.toString()}`}>Edit</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function AdminUserListPage() {
  const users = await getUsers();

  return (
    <main>
      <header>
        <p>Admin</p>
        <h1>Users</h1>
        <p>Prisma 기반 User 테이블 조회 (Admin 전용)</p>
      </header>

      {/* User query section */}
      <UserListSection users={users} />

      {/* 이후 확장용 섹션들 */}
      {/* <UserFiltersSection /> */}
      {/* <UserStatsSection /> */}
      {/* <BulkActionsSection /> */}
    </main>
  );
}

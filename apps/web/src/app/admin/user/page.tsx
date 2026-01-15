import { prisma } from "@labatory/db";
import { UserSearchList } from "./section/UserSearchList";
import { AdminManageConsole } from "./section/AdminManageConsole";
import { PIManageConsole } from "./section/PIManageConsole";



export default async function AdminUserPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      displayName: true,
      role: true,
      primaryEmail: true,
      createdAt: true,
      updatedAt:true,
    },
  });

  return (
    <main>
      <header>
        <p>Admin</p>
        <h1>Users</h1>
        <p>Prisma 기반 User 테이블 조회 (Admin 전용)</p>
      </header>

      {/* User query section */}
      <UserSearchList initialUsers={users} />
      <AdminManageConsole/>
      <PIManageConsole/>
    </main>
  );
}

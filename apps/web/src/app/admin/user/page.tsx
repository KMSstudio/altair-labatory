import { prisma } from "@labatory/db";
import { UserListByRoleSection,UserSearchListSection,PromoteToAdminSection, DemoteAdminSection } from "./client";


async function getUsers() {
  return prisma.user.findMany({
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
}

export default async function AdminUserPage() {
  const users = await getUsers();
  return (
    <main>
      <header>
        <p>Admin</p>
        <h1>Users</h1>
        <p>Prisma 기반 User 테이블 조회 (Admin 전용)</p>
      </header>

      {/* User query section */}
      <UserSearchListSection initialUsers={users} />
      <PromoteToAdminSection/>
      <DemoteAdminSection/>
      <UserListByRoleSection initialUsers={users} Role="ADMIN" />
      <UserListByRoleSection initialUsers={users} Role="PI" />
    </main>
  );
}

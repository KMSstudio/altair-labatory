import Link from "next/link";
import { prisma, UserRole } from "@labatory/db";
import { UserListByRoleSection,UserSearchListSection } from "./client";
/** =========================
 *  User query section
 *  ========================= */
async function getUsers() {
  const users= await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      displayName: true,
      role: true,
      primaryEmail: true,
      createdAt: true,
    },
  });

  return users.map((u)=>({
    id: u.id.toString(),
    displayName: u.displayName,
    role: u.role,
    primaryEmail: u.primaryEmail,
    createdAt: u.createdAt.toISOString(),
  }));
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
      <UserListByRoleSection initialUsers={users} Role="ADMIN" />
      <UserListByRoleSection initialUsers={users} Role="PI" />
      {/* 이후 확장용 섹션들 */}
      {/* <UserFiltersSection /> */}
      {/* <UserStatsSection /> */}
      {/* <BulkActionsSection /> */}
    </main>
  );
}

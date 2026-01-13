import Link from "next/link";
import { prisma, UserRole } from "@labatory/db";
import { UserListByRoleSection,UserSearchListSection,PromoteToAdminSection, DemoteAdminSection } from "./client";
/** =========================
 *  User query section
 *  ========================= */

type UserDTO = {
  id: string;
  displayName: string;
  role: string;
  primaryEmail: string | null;
  createdAt: string;
};

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

async function updateUserRole({
  userId,
  nextRole,
}: {
  userId: string;
  nextRole: UserRole;
}) {
  const res = await fetch("/api/admin/user/role", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, nextRole }),
  });

  if (!res.ok) {
    throw new Error("failed role change");
  }

  return (await res.json()) as UserDTO; 
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

"use server";

import {type User, type UserRole, prisma } from "@labatory/db";
import { UserListSection } from "./UserListSection";

export async function UserListByRole({
     Role
}: {Role:UserRole;
}) {
    const users=await prisma.user.findMany({
        where:{role:Role},
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
    <section>
      <header>
        <h2>{Role} List</h2>
      </header>
      <UserListSection users={users} />
    </section>
  );
}

import { type UserRole } from "@labatory/db";
import { getUserByRole } from "../actions";
import { UserListSection } from "./UserListSection";

export async function UserListByRole({
  userRole
}: { userRole: UserRole; }) {
  const users = await getUserByRole({ userRole, })

  return (
    <section>
      <header>
        <h2>{userRole} List</h2>
      </header>
      <UserListSection users={users} />
    </section>
  );
}

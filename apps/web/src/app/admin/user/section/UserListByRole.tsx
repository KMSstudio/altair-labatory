import { type UserRole } from "@labatory/db";
import { getUserByRole } from "../actions";
import { UserListSection } from "./UserListSection";
import styles from "../../admin.module.css";

export async function UserListByRole({
  userRole
}: { userRole: UserRole; }) {
  const users = await getUserByRole({ userRole, })

  return (
    <section className={styles.card}>
      <header className={styles.cardHead}>
        <h3>{userRole} List</h3>
      </header>
      <UserListSection users={users} />
    </section>
  );
}

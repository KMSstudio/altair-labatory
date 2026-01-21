"use client";

import { type User } from "@labatory/db";
import Link from "next/link";
import styles from "../../admin.module.css";

function UserListItem({ user }: { user: User }) {
  return (
    <li className={styles.card}>
      <div>
        <p className={styles.eyebrow}>ID {user.id}</p>
        <h3>{user.displayName}</h3>
        {user.primaryEmail && <p className={styles.muted}>{user.primaryEmail}</p>}
        <p>
          Role: <span className={styles.value}>{user.role}</span>
        </p>
        <p className={styles.muted}>Created at: {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>

      <div className={styles.actions}>
        <Link className={styles.ghost} href={`/admin/user/edit/${user.id}`}>
          Edit
        </Link>
        <Link className={styles.ghost} href={`/admin/user/${user.id}`}>
          View
        </Link>
      </div>
    </li>
  );
}

export function UserListSection({ users }: { users: User[] }) {
  return (
    <section className={styles.listSection}>
      {users.length === 0 ? (
        <p className={styles.muted}>No users found.</p>
      ) : (
        <ul className={styles.list}>
          {users.map((user) => (
            <UserListItem key={user.id} user={user} />
          ))}
        </ul>
      )}
    </section>
  );
}

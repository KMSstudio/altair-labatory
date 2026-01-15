"use server";

import { type User } from "@labatory/db";
import Link from "next/link";

function UserListItem({ user }: { user: User }) {
  return (
    <li>
      <div>
        <p>ID {user.id}</p>
        <h3>{user.displayName}</h3>
        {user.primaryEmail && <p>{user.primaryEmail}</p>}
        <p>Role: {user.role}</p>
        <p>
          Created at: {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div>
        <Link href={`/admin/user/edit/${user.id}`}>Edit</Link>
        {" | "}
        <Link href={`/admin/user/${user.id}`}>View</Link>
      </div>
    </li>
  );
}

export function UserListSection({ users }: { users: User[] }) {
  return (
    <section>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul>
          {users.map((user) => (
            <UserListItem key={user.id} user={user} />
          ))}
        </ul>
      )}
    </section>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type UserDTO = {
  id: string;
  displayName: string;
  role: string;
  primaryEmail: string | null;
  createdAt: string;
};

type SearchField = "이름" | "이메일" | "전부";

function UserListItem({ user }: { user: UserDTO }) {
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

function UserListSection({ users }: { users: UserDTO[] }) {
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

export function UserSearchListSection({
  initialUsers,
}: {
  initialUsers: UserDTO[];
}) {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<UserDTO[]>(initialUsers);
  const [field, setField] = useState<SearchField>("이름");
  const [loading, setLoading] = useState(false);

  const trimmed = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    if (!trimmed) {
      setUsers(initialUsers);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/user?search=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        const data = (await res.json()) as { users: UserDTO[] };
        setUsers(data.users);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [trimmed, initialUsers]);

  return (
    <section>
      <header>
        <h2>User search</h2>
        <p>{trimmed ? `Searching “${trimmed}”` : "Showing all users"}</p>
      </header>

      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          Name contains{" "}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="type to search..."
          />
        </label>{" "}
        <label>
          Field{" "}
          <select value={field} onChange={(e) => setField(e.target.value as SearchField)}>
            <option value="이름">Display name</option>
            <option value="이메일">Primary email</option>
            <option value="전부">Name + Email</option>
          </select>
        </label>{" "}
        <button type="button" onClick={() => setQ("")}>
          Clear
        </button>
      </form>

      <UserListSection users={users} />
    </section>
  );
}

'use client';

import { type User } from "@labatory/db";
import { useEffect, useMemo, useState } from "react";
import { UserListSection } from "./UserListSection";

export function UserSearchList({
  initialUsers,
}: {
  initialUsers: User[];
}) {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [field, setField] = useState<string>("name");
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
          `/api/admin/user?search=${encodeURIComponent(trimmed)}&field=${encodeURIComponent(field)}`,
          { signal: controller.signal }
        );
        const data = (await res.json()) as { users: User[] };
        setUsers(data.users);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [trimmed, initialUsers,field]);

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
          <select value={field} onChange={(e) => setField(e.target.value as string)}>
            <option value="name">Display name</option>
            <option value="email">Primary email</option>
            <option value="all">Name + Email</option>
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

// @/app/admin/user/section/UserSearchList.tsx

"use client";

import { type User } from "@labatory/db";
import { useMemo, useState } from "react";
import { UserListSection } from "./UserListSection";

const normalizeField = (raw: string): string =>
  raw === "email" || raw === "all" ? raw : "name";
const norm = (v: string) => v.trim().toLowerCase();

export function UserSearchList({ initialUsers }: { initialUsers: User[] }) {
  const [search, setSearch] = useState("");
  const [field, setField] = useState<string>("name");

  const users = useMemo(() => {
    if (search === "") return initialUsers;
    const normalizedSearch = norm(search);
    const normalizedField = normalizeField(field);
    return initialUsers.filter((u) => {
      const name = norm(u.displayName ?? "");
      const email = norm(u.primaryEmail ?? "");

      if (normalizedField === "name") return name.includes(normalizedSearch);
      if (normalizedField === "email") return email.includes(normalizedSearch);
      return name.includes(normalizedSearch) || email.includes(normalizedSearch);
    });
  }, [initialUsers, search, field]);

  return (
    <section>
      <header>
        <h2>User search</h2>
        <p>{search !== "" ? `Searching "${search}"` : "Showing all users"}</p>
      </header>

      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          Name contains{" "}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value ?? "")}
            placeholder="type to search..."
          />
        </label>{" "}
        <label>
          Field{" "}
          <select value={field} onChange={(e) => setField(e.target.value)}>
            <option value="name">Display name</option>
            <option value="email">Primary email</option>
            <option value="all">Name + Email</option>
          </select>
        </label>{" "}
        <button type="button" onClick={() => setSearch("")}>
          Clear
        </button>
      </form>

      <UserListSection users={users} />
    </section>
  );
}

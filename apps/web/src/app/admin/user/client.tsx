"use client";

import { UserRole } from "@labatory/db";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { promoteToAdminAction,demoteAdminToUserAction } from "./actions";
type UserDTO = {
  id: string;
  displayName: string;
  role: string;
  primaryEmail: string | null;
  createdAt: string;
};

type SearchField = "name" | "email" | "all";

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

export function UserListSection({ users }: { users: UserDTO[] }) {
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
  const [field, setField] = useState<SearchField>("name");
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
          <select value={field} onChange={(e) => setField(e.target.value as SearchField)}>
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

export function UserListByRoleSection({
  initialUsers,Role
}: {
  initialUsers: UserDTO[],Role:UserRole;
}) {
  const [users, setUsers] = useState<UserDTO[]>(initialUsers.filter((u)=>u.role===Role.toString()));
  return (
    <section>
      <header>
        <h2>{Role} List</h2>
      </header>
      <UserListSection users={users} />
    </section>
  );
}

export function PromoteToAdminSection() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    const trimmedId = userId.trim();
    if (!trimmedId || loading) return;

    setLoading(true);
    try {
      await promoteToAdminAction({ userId: trimmedId });
      setUserId("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>관리자 권한 부여</h2>

      <label>
        User ID{" "}
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="예) 123"
          disabled={loading}
        />
      </label>

      <button type="button" onClick={onSubmit} disabled={loading || !userId.trim()}>
        {loading ? "처리 중..." : "ADMIN으로 승격"}
      </button>
    </section>
  );
}

export function DemoteAdminSection() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    const trimmedId = userId.trim();
    if (!trimmedId || loading) return;

    setLoading(true);
    try {
      // Server Action
      await demoteAdminToUserAction({ userId: trimmedId });
      setUserId("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>관리자 권한 제거</h2>

      <label>
        User ID{" "}
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="예) 123"
          disabled={loading}
        />
      </label>

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading || !userId.trim()}
      >
        {loading ? "처리 중..." : "USER로 강등"}
      </button>
    </section>
  );
}
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

async function requestDeleteArticle(articleId: bigint) {
  const res = await fetch("/api/article/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      articleId: articleId.toString(),
    }),
  });

  const data = (await res.json().catch(() => null)) as
    | { ok?: boolean; articleId?: string; error?: string }
    | null;

  if (!res.ok) throw new Error(data?.error ?? "Failed to delete article.");
  return data;
}

export function WriterSection({
  articleId,
  boardId,
}: {
  articleId: bigint;
  boardId: bigint;
}) {
  const router = useRouter();
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (loadingDelete) return;

    setLoadingDelete(true);
    try {
      await requestDeleteArticle(articleId);
      router.push(`/board/${boardId.toString()}/list`);
      router.refresh();
    } catch (e) {
      alert(`Deleting article error: ${e instanceof Error ? e.message : "Unknown error."}`);
      setLoadingDelete(false);
    }
  };

  return (
    <div>
      <div>
        <Link
          href={`/article/${articleId.toString()}/update`}
          aria-disabled={loadingDelete}
          className={loadingDelete ? "writer-link disabled" : "writer-link"}
        >
          Edit
        </Link>
      </div>

      <div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loadingDelete}
          className={loadingDelete ? "writer-delete loading" : "writer-delete"}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

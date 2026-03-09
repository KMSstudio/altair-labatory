"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

async function requestCommentUpdate(commentId: bigint, content: string) {
  const res = await fetch("/api/article/comment/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commentId: commentId.toString(),
      content,
    }),
  });

  const data = (await res.json().catch(() => null)) as {
    ok?: boolean;
    comment?: unknown;
    error?: string;
  } | null;

  if (!res.ok) {
    throw new Error(data?.error ?? "Failed to update comment.");
  }

  return data;
}

async function requestCommentDelete(commentId: bigint) {
  const res = await fetch("/api/article/comment/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commentId: commentId.toString(),
    }),
  });

  const data = (await res.json().catch(() => null)) as {
    ok?: boolean;
    comment?: unknown;
    error?: string;
  } | null;

  if (!res.ok) {
    throw new Error(data?.error ?? "Failed to delete comment.");
  }

  return data;
}

export function CommentUpdateSection({
  commentId,
  content,
}: {
  commentId: bigint;
  content: string;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [text, setText] = useState(content);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const isBusy = loadingUpdate || loadingDelete;

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isBusy) return;

    const trimmed = text.trim();
    if (!trimmed) {
      alert("Content is required.");
      return;
    }

    setLoadingUpdate(true);
    try {
      await requestCommentUpdate(commentId, trimmed);
      setOpen(false);
      router.refresh();
    } catch (e) {
      alert(`Updating comment error: ${e instanceof Error ? e.message : "Unknown error."}`);
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isBusy) return;

    setLoadingDelete(true);
    try {
      await requestCommentDelete(commentId);
      router.refresh();
    } catch (e) {
      alert(`Deleting comment error: ${e instanceof Error ? e.message : "Unknown error."}`);
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ opacity: open ? 0.6 : 1 }}
        disabled={isBusy}
      >
        Edit
      </button>

      {open && (
        <div>
          <form onSubmit={handleUpdate}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Input reply"
              disabled={isBusy}
            />

            <div>
              <button
                type="submit"
                disabled={isBusy || !text.trim()}
                className={`btn-edit ${loadingUpdate ? "loading" : ""}`}
              >
                Edit
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        onClick={handleDelete}
        disabled={isBusy}
        className={`btn-delete ${loadingDelete ? "loading" : ""}`}
      >
        Delete
      </button>
    </div>
  );
}

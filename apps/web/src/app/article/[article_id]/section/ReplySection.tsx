"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from '../article.module.css';

async function requestPostComment(articleId: bigint, parentId: bigint | null, content: string) {
  const res = await fetch("/api/article/comment/new", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      articleId: articleId.toString(),
      parentId: parentId?.toString() ?? null,
      content,
    }),
  });

  const data = (await res.json().catch(() => null)) as {
    ok?: boolean;
    comment?: unknown;
    error?: string;
  } | null;

  if (!res.ok) throw new Error(data?.error ?? "Failed to post comment.");
  return data;
}

export function ReplySection({ articleId, parentId }: { articleId: bigint; parentId: bigint }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loadingSubmit) return;

    const trimmed = text.trim();
    if (!trimmed) {
      alert("Content is required.");
      return;
    }

    setLoadingSubmit(true);
    try {
      await requestPostComment(articleId, parentId, trimmed);
      setText("");
      setOpen(false);
      router.refresh();
    } catch (e) {
      alert(`Posting reply error: ${e instanceof Error ? e.message : "Unknown error."}`);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className={styles.commentFormWrap}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ opacity: open ? 0.6 : 1 }}
        disabled={loadingSubmit}
        className={styles.ghost}
      >
        Write reply
      </button>

      {open && (
        <div className={styles.replyForm}>
          <form onSubmit={handleSubmit}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="input reply"
              disabled={loadingSubmit}
              className={styles.textarea}
            />
            <div className={styles.formActions}>
              <button
                type="submit"
                disabled={loadingSubmit || !text.trim()}
                className={styles.primary}
              >
                submit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

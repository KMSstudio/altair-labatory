"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TagSelector } from "../../TagSelector";

type ApiBody = {
  boardId: string;
  title: string;
  content: string;
  tagIdsRaw?: string[];
};

export default function NewArticleForm({ boardId }: { boardId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);

    const form = e.currentTarget;
    const fd = new FormData(form);

    const title = (fd.get("title")?.toString() ?? "").trim();
    const content = (fd.get("content")?.toString() ?? "").trim();
    const tagIdsRaw = fd.getAll("tagIds").map((v) => v.toString());

    const body: ApiBody = {
      boardId,
      title,
      content,
      tagIdsRaw,
    };

    let res: Response;
    try {
      res = await fetch("/api/article/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      setSubmitting(false);
      router.replace(`?error=${encodeURIComponent("Network error.")}`);
      return;
    }

    const data = (await res.json().catch(() => ({}))) as
      | { ok: true; articleId: string }
      | { error: string };

    if (!res.ok || !("ok" in data) || !data.ok) {
      setSubmitting(false);
      router.replace(`?error=${encodeURIComponent("error" in data ? data.error : "Unknown error.")}`);
      return;
    }

    router.push(`/article/${data.articleId}`);
  }

  return (
    <form onSubmit={onSubmit} id="target-form">
      <input type="hidden" name="boardId" value={boardId} />

      <div>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" type="text" required defaultValue="" />
      </div>

      <div>
        <label htmlFor="content">Content</label>
        <textarea id="content" name="content" required defaultValue="" />
      </div>

      <TagSelector />

      <button type="submit" id="submit-btn" disabled={submitting}>
        {submitting ? "submitting..." : "submit"}
      </button>
    </form>
  );
}

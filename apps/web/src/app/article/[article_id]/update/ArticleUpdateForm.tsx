// @/app/article/[article_id]/update/ArticleUpdateForm.tsx

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { TagSelector } from "@/app/board/TagSelector";
import type { ArticleDTO, ArticleTagDTO } from "@/repository/dto/article";

type ApiOk = { ok: true; articleId: string };
type ApiErr = { error: string };

export function ArticleUpdateForm({ article }: { article: ArticleDTO }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const selectedTags: ArticleTagDTO[] = article.tags ?? [];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);

    const articleId = (fd.get("articleId")?.toString() ?? "").trim();
    const title = (fd.get("title")?.toString() ?? "").trim();
    const content = (fd.get("content")?.toString() ?? "").trim();
    const tagIdsRaw = fd.getAll("tagIds").map((v) => v.toString());

    const body = { articleId, title, content, tagIdsRaw };

    let res: Response;
    try {
      res = await fetch("/api/article/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      setSubmitting(false);
      router.replace(`?error=${encodeURIComponent("Network error.")}`);
      return;
    }

    const data = (await res.json().catch(() => ({}))) as Partial<ApiOk & ApiErr>;

    if (!res.ok || !data.ok || !data.articleId) {
      setSubmitting(false);
      router.replace(`?error=${encodeURIComponent(data.error ?? "Unknown error.")}`);
      return;
    }

    router.push(`/article/${data.articleId}`);
  }

  return (
    <form onSubmit={onSubmit} id="target-form">
      <input type="hidden" name="articleId" value={article.id.toString()} />

      <div>
        <label htmlFor="title">title</label>
        <input id="title" name="title" type="text" required defaultValue={article.title} />
      </div>

      <div>
        <label htmlFor="content">content</label>
        <textarea id="content" name="content" required defaultValue={article.content} />
      </div>

      <TagSelector SelectedTags={selectedTags} />

      <button id="submit-btn" type="submit" disabled={submitting}>
        {submitting ? "submitting..." : "submit"}
      </button>
    </form>
  );
}

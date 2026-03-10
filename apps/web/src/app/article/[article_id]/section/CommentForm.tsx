// @/app/article/[article_id]/section/CommentForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CommentForm({ articleId }: { articleId: bigint }) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const content = text.trim();
    if (!content) {
      alert("Content is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/article/comment/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          articleId: articleId.toString(),
          parentId: null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Unknown error.");

      setText("");
      router.refresh();
    } catch (e) {
      alert(`Creating comment error: ${e instanceof Error ? e.message : "Unknown error."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form id="comment-form" onSubmit={handleSubmit}>
        <textarea
          name="content"
          value={text}
          disabled={isSubmitting}
          onChange={(e) => setText(e.target.value)}
          placeholder="Input comment."
        />

        <div>
          <button type="submit" id="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "submitting..." : "submit"}
          </button>
        </div>
      </form>
    </div>
  );
}

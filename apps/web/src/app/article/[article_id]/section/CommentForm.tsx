"use client";

import { useState } from "react";
import { PostComment } from "../../actions";
import { useRouter } from "next/navigation";

export function CommentForm({ articleId }: { articleId: bigint }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function OnSubmit() {
    setLoading(true);
    try {
      await PostComment({ content: text, articleId, parentCommentId: null });
    } catch (e) {
      alert(`Creating comment error: ${e instanceof Error ? e.message : "Unknown error."}`);
      setLoading(false);
      return;
    }
    setText("");
    setLoading(false);
    router.refresh();
  }

  return (
    <div>
      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Input comment."
        />
        <div>
          <button type="button" onClick={OnSubmit} disabled={loading}>
            submit
          </button>
        </div>
      </div>
    </div>
  );
}

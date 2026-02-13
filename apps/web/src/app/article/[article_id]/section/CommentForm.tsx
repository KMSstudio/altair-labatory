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
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert("Unknown error.");
      }
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
          placeholder="댓글을 입력하세요"
        />
        <div>
          <button type="button" onClick={OnSubmit} disabled={loading}>
            등록
          </button>
        </div>
      </div>
    </div>
  );
}

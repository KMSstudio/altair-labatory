"use client";

import { useState } from "react";
import { PostComment } from "../../actions";
import { useRouter } from "next/navigation";

export function ReplySection({ articleId, parentId }: { articleId: bigint; parentId: bigint }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function OnSubmit() {
    setLoading(true);
    try {
      const res = await PostComment({ content: text, articleId, parentCommentId: parentId });
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert("Unknown error.");
      }
      setLoading(false);
      return;
    }
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <div>
      <button onClick={() => setOpen((v) => !v)}>
        {open ? "대댓글 쓰기 접기" : "대댓글 쓰기"}
      </button>
      {open && (
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="답글을 입력하세요"
          />
          <div>
            <button type="button" onClick={OnSubmit} disabled={loading}>
              등록
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { DeleteComment, UpdateComment } from "../../actions";
import { useRouter } from "next/navigation";

export function CommentUpdateSection({
  commentId,
  content,
}: {
  commentId: bigint;
  content: string;
}) {
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(content);
  const router = useRouter();

  async function OnDelete() {
    setLoadingDelete(true);
    try {
      await DeleteComment({ commentId });
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert("Unknown error.");
      }
      setLoadingDelete(false);
      return;
    }
    setLoadingDelete(false);
    router.refresh();
  }
  async function OnUpdate() {
    setLoadingUpdate(true);
    try {
      await UpdateComment({ commentId, newContent: text });
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert("Unknown error.");
      }
      setLoadingUpdate(false);
      return;
    }
    setLoadingUpdate(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <div>
      <button onClick={() => setOpen((v) => !v)}>{open ? "수정 접기" : "수정"}</button>
      {open && (
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="답글을 입력하세요"
          />
          <div>
            <button type="button" onClick={OnUpdate} disabled={loadingUpdate}>
              수정
            </button>
          </div>
        </div>
      )}
      <button onClick={OnDelete} disabled={loadingDelete}>
        삭제
      </button>
    </div>
  );
}

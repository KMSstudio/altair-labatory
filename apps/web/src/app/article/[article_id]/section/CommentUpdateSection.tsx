"use client";

import { type Dispatch, type SetStateAction, useState } from "react";
import { DeleteComment, UpdateComment } from "../../actions";
import { useRouter } from "next/navigation";

async function OnDelete(setLoadingDelete: Dispatch<SetStateAction<boolean>>, commentId: bigint) {
  setLoadingDelete(true);
  try {
    await DeleteComment({ commentId });
  } catch (e) {
    alert(`Updating comment error:${e instanceof Error ? e.message : "Unknown error."}`);
    setLoadingDelete(false);
    return false;
  }
  setLoadingDelete(false);
  return true;
}
async function OnUpdate(
  setLoadingUpdate: Dispatch<SetStateAction<boolean>>,
  commentId: bigint,
  text: string,
  setOpen: Dispatch<SetStateAction<boolean>>,
) {
  setLoadingUpdate(true);
  try {
    await UpdateComment({ commentId, newContent: text });
  } catch (e) {
    alert(`Updating comment error:${e instanceof Error ? e.message : "Unknown error."}`);
    setLoadingUpdate(false);
    return false;
  }
  setLoadingUpdate(false);
  setOpen(false);
  return true;
}
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

  return (
    <div>
      <button onClick={() => setOpen((v) => !v)} style={{ opacity: open ? 0.6 : 1 }}>
        {"Edit"}
      </button>
      {open && (
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Input reply"
          />
          <div>
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                if (await OnUpdate(setLoadingUpdate, commentId, text, setOpen)) {
                  router.refresh();
                }
              }}
              disabled={loadingUpdate}
            >
              Edit
            </button>
          </div>
        </div>
      )}
      <button
        onClick={async (e) => {
          e.preventDefault();
          if (await OnDelete(setLoadingDelete, commentId)) {
            router.refresh();
          }
        }}
        disabled={loadingDelete}
      >
        Delete
      </button>
    </div>
  );
}

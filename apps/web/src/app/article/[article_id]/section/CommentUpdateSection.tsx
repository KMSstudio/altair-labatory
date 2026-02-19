"use client";

import { type Dispatch, type SetStateAction, useState } from "react";
import { DeleteComment, UpdateComment } from "../../actions";
import { useRouter } from "next/navigation";
import Script from "next/script";

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
  commentId: bigint,
  text: string,
  setOpen: Dispatch<SetStateAction<boolean>>,
) {
  try {
    await UpdateComment({ commentId, newContent: text });
  } catch (e) {
    alert(`Updating comment error:${e instanceof Error ? e.message : "Unknown error."}`);
    return false;
  }
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
          <form
            id="target-form"
            onSubmit={async (e) => {
              e.preventDefault();
              if (await OnUpdate(commentId, text, setOpen)) {
                router.refresh();
              }
            }}
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Input reply"
            />

            <div>
              <button type="submit" id="submit-btn">
                Edit
              </button>
            </div>

            {/* Make button freeze during form submission */}
            <Script src="/js/disable-on-submit.js" strategy="afterInteractive" />
          </form>
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

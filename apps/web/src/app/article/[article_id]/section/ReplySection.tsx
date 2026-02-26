"use client";

import { type Dispatch, type SetStateAction, useState } from "react";
import { PostComment } from "../../actions";
import { useRouter } from "next/navigation";
import Script from "next/script";

async function OnSubmit(
  text: string,
  articleId: bigint,
  parentId: bigint | null,
  setOpen: Dispatch<SetStateAction<boolean>>,
) {
  try {
    await PostComment({ content: text, articleId, parentCommentId: parentId });
  } catch (e) {
    alert(`Posting reply error: ${e instanceof Error ? e.message : "Unknown error."}`);
    return false;
  }
  setOpen(false);
  return true;
}

export function ReplySection({ articleId, parentId }: { articleId: bigint; parentId: bigint }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const router = useRouter();

  return (
    <div>
      <button onClick={() => setOpen((v) => !v)} style={{ opacity: open ? 0.6 : 1 }}>
        {"Write reply"}
      </button>
      {open && (
        <div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (await OnSubmit(text, articleId, parentId, setOpen)) {
                router.refresh();
              }
            }}
            id="target-form"
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="input reply"
            />
            <div>
              <button type="submit" id="submit-btn">
                submit
              </button>
            </div>
            {/*Make button freeze during form submission */}
            <Script src="/js/disable-on-submit.js" strategy="afterInteractive" />
          </form>
        </div>
      )}
    </div>
  );
}

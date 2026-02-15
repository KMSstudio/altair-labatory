"use client";

import { type Dispatch, type SetStateAction, useState } from "react";
import { PostComment } from "../../actions";
import { useRouter } from "next/navigation";

async function OnSubmit(
  text: string,
  articleId: bigint,
  parentId: bigint | null,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setOpen: Dispatch<SetStateAction<boolean>>,
) {
  setLoading(true);
  try {
    await PostComment({ content: text, articleId, parentCommentId: parentId });
  } catch (e) {
    if (e instanceof Error) {
      alert(e.message);
    } else {
      alert("Unknown error.");
    }
    setLoading(false);
    return false;
  }
  setLoading(false);
  setOpen(false);
  return true;
}

export function ReplySection({ articleId, parentId }: { articleId: bigint; parentId: bigint }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <div>
      <button onClick={() => setOpen((v) => !v)} style={{ opacity: open ? 0.6 : 1 }}>
        {"Write reply"}
      </button>
      {open && (
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="input reply"
          />
          <div>
            <button
              type="button"
              onClick={async () => {
                if (await OnSubmit(text, articleId, parentId, setLoading, setOpen)) {
                  router.refresh();
                }
              }}
              disabled={loading}
            >
              submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

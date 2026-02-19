"use client";

import { useState } from "react";
import { PostComment } from "../../actions";
import { useRouter } from "next/navigation";
import Script from "next/script";

export function CommentForm({ articleId }: { articleId: bigint }) {
  const [text, setText] = useState("");
  const router = useRouter();

  return (
    <div>
      <form
        id="comment-form"
        onSubmit={async (e) => {
          e.preventDefault();

          try {
            await PostComment({ content: text, articleId, parentCommentId: null });
          } catch (e) {
            alert(`Creating comment error: ${e instanceof Error ? e.message : "Unknown error."}`);
            return;
          }

          setText("");
          router.refresh();
        }}
      >
        <textarea
          name="content"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Input comment."
        />

        <div>
          <button type="submit" id="submit-btn">
            submit
          </button>
        </div>

        {/* Make button freeze during form submission */}
        <Script src="/js/disable-on-submit.js" strategy="afterInteractive" />
      </form>
    </div>
  );
}

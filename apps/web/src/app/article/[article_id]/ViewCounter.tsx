// @/app/article/[article_id]/ViewCounter.tsx

"use client";

import { useEffect } from "react";

type Props = {
  articleId: string;
};

export function ViewCounter({ articleId }: Props) {
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch("/api/article/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
        signal: controller.signal,
      }).catch(() => {});
    }, 3000);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [articleId]);

  return null;
}

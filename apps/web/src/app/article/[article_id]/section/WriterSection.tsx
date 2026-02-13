"use client";
import Link from "next/link";
import { DeleteArticle } from "../../actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function WriterSection({ articleId }: { articleId: bigint }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function OnDelete() {
    setLoading(true);
    try {
      DeleteArticle({ articleId });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Unknown Error.");
      setLoading(false);
      return;
    }
    router.back();
  }
  return (
    <div>
      <div>
        <Link href={`/article/${articleId}/update`}>수정</Link>
      </div>
      <div>
        <button
          onClick={() => {
            OnDelete();
          }}
          disabled={loading}
        >
          삭제
        </button>
      </div>
    </div>
  );
}

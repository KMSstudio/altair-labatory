"use client";

import { useState } from "react";
import { UpdateArticle, type GetArticleResult } from "../../actions";
import { TagSelector } from "@/app/board/TagSelector";
import { useRouter } from "next/navigation";
import { SerializeTag } from "@/util/serialize/SerializeTag";

export function ArticleUpdateForm({ article }: { article: GetArticleResult }) {
  const [title, setTitle] = useState(article.title);
  const [content, setContent] = useState(article.content);
  const [selectedTags, setSelectedTags] = useState(
    article.tags.map((articleTag) => {
      return articleTag.tag;
    }),
  );
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("articleId", article.id.toString());
    const serializedTags = selectedTags.map((tag) => {
      return SerializeTag(tag);
    });
    formData.append("tags", JSON.stringify(serializedTags));
    setLoading(true);

    try {
      await UpdateArticle({ formData });
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert("Unknown error ocurred. Please try again.");
      }
      setLoading(false);
      return;
    }

    router.push(`/article/${article.id}`);
  }

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label htmlFor="title">제목</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="content">내용</label>
        <textarea
          id="content"
          name="content"
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <TagSelector setSelectedTags={setSelectedTags} SelectedTags={selectedTags} />
      <button type="submit" disabled={loading}>
        {loading ? "등록 중..." : "등록"}
      </button>
    </form>
  );
}

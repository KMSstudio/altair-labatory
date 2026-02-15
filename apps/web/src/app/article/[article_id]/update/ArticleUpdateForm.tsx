import { redirect } from "next/navigation";
import { UpdateArticle, type GetArticleResult } from "../../actions";
import { TagSelector } from "@/app/board/TagSelector";

async function onSubmit(formData: FormData) {
  "use server";
  let id: string;
  try {
    await UpdateArticle({ formData });
    id = formData.get("articleId") as string;
  } catch (e) {
    redirect(
      `?error=${encodeURIComponent(`Updating article error: ${e instanceof Error ? e.message : "Unknown error."}`)}`,
    );
  }

  redirect(`/article/${id}`);
}

export function ArticleUpdateForm({ article }: { article: GetArticleResult }) {
  const selectedTags = article.tags.map((articleTag) => {
    return articleTag.tag;
  });

  return (
    <form action={onSubmit}>
      <input type="hidden" name="articleId" value={article.id.toString()} />
      <div>
        <label htmlFor="title">title</label>
        <input id="title" name="title" type="text" required defaultValue={article.title} />
      </div>
      <div>
        <label htmlFor="content">content</label>
        <textarea id="content" name="content" required defaultValue={article.content} />
      </div>
      <TagSelector SelectedTags={selectedTags} />
      <button type="submit">submit</button>
    </form>
  );
}

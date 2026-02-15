import { redirect } from "next/navigation";
import { UpdateArticle, type GetArticleResult } from "../../actions";
import { TagSelector } from "@/app/board/TagSelector";
import Script from "next/script";

async function OnSubmit(formData: FormData) {
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
    <form action={OnSubmit} id="target-form">
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
      <button id="submit-btn" type="submit">
        submit
      </button>

      {/*Make button freeze during form submission */}
      <Script src="/js/disable-on-submit.js" strategy="afterInteractive" />
    </form>
  );
}

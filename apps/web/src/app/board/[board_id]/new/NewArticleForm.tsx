import { redirect } from "next/navigation";
import { CreateArticle } from "../../actions";
import { TagSelector } from "../../TagSelector";
import Script from "next/script";

async function onSubmit(formData: FormData) {
  "use server";
  const articleId = await CreateArticle(formData);
  try {
    if (articleId === undefined || articleId === null) {
      throw new Error("Article creation failed.");
    }
  } catch (e) {
    redirect(
      `?error=${encodeURIComponent(
        `Creating article error: ${e instanceof Error ? e.message : "Unknown error."}`,
      )}`,
    );
  }
  redirect(`/article/${articleId.toString()}`);
}

export default function NewArticleForm({ boardId }: { boardId: string }) {
  return (
    <form action={onSubmit} id="target-form">
      <input type="hidden" name="boardId" value={boardId} />
      <div>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" type="text" required defaultValue="" />
      </div>
      <div>
        <label htmlFor="content">Content</label>
        <textarea id="content" name="content" required defaultValue="" />
      </div>
      <TagSelector />
      <button type="submit" id="submit-btn">
        submit
      </button>
      <Script src="/js/disable-on-submit.js" strategy="afterInteractive" />
    </form>
  );
}

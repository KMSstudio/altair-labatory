"use server";

import Link from "next/link";
import { DeleteArticle } from "../../actions";
import { redirect } from "next/navigation";

async function OnDelete(formData: FormData) {
  "use server";
  const articleIdRaw = formData.get("articleId")?.toString() ?? "ff";
  console.log(articleIdRaw);
  try {
    const articleId = BigInt(articleIdRaw);
    await DeleteArticle({ articleId });
  } catch (e) {
    redirect(
      `?error=${encodeURIComponent(`Deleting article error: ${e instanceof Error ? e.message : "Unknown Error."}`)}`,
    );
  }
  redirect("/board");
}

export async function WriterSection({ articleId }: { articleId: bigint }) {
  return (
    <div>
      <div>
        <Link href={`/article/${articleId}/update`}>Edit</Link>
      </div>
      <div>
        <form action={OnDelete}>
          <input type="hidden" name="articleId" defaultValue={articleId.toString()} />
          <button type="submit">Delete</button>
        </form>
      </div>
    </div>
  );
}

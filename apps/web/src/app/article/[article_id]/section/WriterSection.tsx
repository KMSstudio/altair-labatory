import Link from "next/link";
import { DeleteArticle } from "../../actions";
import { redirect } from "next/navigation";

async function OnDelete(formData: FormData) {
  "use server";
  const articleIdRaw = formData.get("articleId")?.toString() ?? "";
  const boardIdRaw = formData.get("boardId")?.toString() ?? "";
  let boardId: bigint;
  try {
    const articleId = BigInt(articleIdRaw);
    boardId = BigInt(boardIdRaw);
    await DeleteArticle({ articleId });
  } catch (e) {
    redirect(
      `?error=${encodeURIComponent(`Deleting article error: ${e instanceof Error ? e.message : "Unknown Error."}`)}`,
    );
  }
  redirect(`/board/${boardId}/list`);
}

export async function WriterSection({
  articleId,
  boardId,
}: {
  articleId: bigint;
  boardId: bigint;
}) {
  return (
    <div>
      <div>
        <Link href={`/article/${articleId}/update`}>Edit</Link>
      </div>
      <div>
        <form action={OnDelete}>
          <input type="hidden" name="articleId" defaultValue={articleId.toString()} />
          <input type="hidden" name="boardId" defaultValue={boardId.toString()} />
          <button type="submit">Delete</button>
        </form>
      </div>
    </div>
  );
}

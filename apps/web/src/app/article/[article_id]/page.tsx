import { notFound } from "next/navigation";
import { GetArticle, GetComments, type GetCommentsType, type CommentDisplay } from "../actions";
import Link from "next/link";
import { CommentSection } from "./CommentSection";

function LinkComments(comments: GetCommentsType | null): CommentDisplay[] {
    const roots: CommentDisplay[] = [];
    const map = new Map<CommentDisplay["id"], CommentDisplay>();
    if (!comments) return roots;

    for (const comment of comments) {
        map.set(comment.id, { ...comment, children: [] })
    }
    for (const c of comments) {
        const comment = map.get(c.id);
        if (!comment) continue;

        if (!comment.parentId) {
            roots.push(comment);
        } else {
            const parent = map.get(comment.parentId);
            if (parent) parent.children.push(comment);
            else {
                roots.push(comment)
            }
        }
    }
    return roots;
}
export default async function Page({ params }: { params: { article_id: string } }) {
    params = await params;
    if (!params.article_id)
        notFound();
    let articleId: bigint;
    try {
        articleId = BigInt(params.article_id);
    } catch {
        notFound();
    }
    const article = await GetArticle(articleId);
    if (!article) {
        notFound();
    }
    const commentsRaw = await GetComments(articleId);
    const comments = LinkComments(commentsRaw);
    return (<article>
        <header>
            <div>
                <Link href={`/board/${article.boardId}/list`} >게시판으로 이동.</Link>
            </div>

            <h1>{article.title}</h1>

            <div>
                <p>{article.author?.displayName ?? "익명"}</p>
            </div>

            <div>
                <time dateTime={article.createdAt.toISOString()}>
                    {article.createdAt.toLocaleString()}
                </time>

                {article.updatedAt.getTime() !== article.createdAt.getTime() && (
                    <>
                        <span> · 수정 </span>
                        <time dateTime={article.updatedAt.toISOString()}>
                            {article.updatedAt.toLocaleString()}
                        </time>
                    </>
                )}
            </div>
        </header>

        <hr />

        <section>
            <dl>
                <div>
                    <dt>조회</dt>
                    <dd>{article.viewCount}</dd>
                </div>

                <div>
                    <dt>댓글</dt>
                    <dd>{article._count.comments ?? 0}</dd>
                </div>
            </dl>
        </section>

        <hr />

        <section>
            <div>{article.content}</div>
        </section>

        <hr />

        <section>
            <h2>반응</h2>
            <ul>
                <li>
                    <span>응원</span> <strong>{article.cheerCount}</strong>
                </li>
                <li>
                    <span>공감</span> <strong>{article.empathyCount}</strong>
                </li>
                <li>
                    <span>좋아요</span> <strong>{article.likeCount}</strong>
                </li>
                <li>
                    <span>궁금해요</span> <strong>{article.questionCount}</strong>
                </li>
                <li>
                    <span>별로예요</span> <strong>{article.badCount}</strong>
                </li>
            </ul>
        </section>

        <hr />

        <section>
            {article.tags ? (
                <ol>
                    {article.tags.map((tag) => (
                        <p>{tag.tag.text ?? tag.tag.id}</p>
                    ))}
                </ol>
            ) : (
                <></>
            )}
        </section>

        <hr />
        <section>
            <h2>댓글 {article._count.comments ?? 0}</h2>

            {(article._count.comments ?? 0) === 0 ? (
                <p>아직 댓글이 없습니다.</p>
            ) : (
                <CommentSection comments={comments} />
            )}
        </section>
    </article>
    )
}
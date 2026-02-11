"use client"

import { type CommentDisplay } from "../actions"

export function CommentSection({ comments }: { comments: CommentDisplay[] }) {
    return (
        <div>
            {comments.map((comment) => {
                return (
                    <div>
                        <div>
                            {comment.author?.displayName ?? "익명"}
                        </div>
                        <div>
                            {comment.createdAt.toDateString()}
                        </div>
                        <div>
                            {comment.isHidden ? "댓글이 가려졌습니다" : comment.content}
                        </div>
                        <div>
                            <ul>
                                <li>
                                    <span>응원</span> <strong>{comment.cheerCount}</strong>
                                </li>
                                <li>
                                    <span>공감</span> <strong>{comment.empathyCount}</strong>
                                </li>
                                <li>
                                    <span>좋아요</span> <strong>{comment.likeCount}</strong>
                                </li>
                                <li>
                                    <span>궁금해요</span> <strong>{comment.questionCount}</strong>
                                </li>
                                <li>
                                    <span>별로예요</span> <strong>{comment.badCount}</strong>
                                </li>
                            </ul>
                        </div>
                        <div>
                            {comment.children.length !== 0 ?
                                <CommentSection comments={comment.children} /> :
                                <></>
                            }
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
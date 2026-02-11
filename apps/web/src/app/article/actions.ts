"use server"

import { prisma } from "@labatory/db"

export async function GetArticle(articleId: bigint) {
    return prisma.article.findUnique({
        where: {
            id: articleId,
            isHidden: false,
        },
        select: {
            boardId: true,
            title: true,
            content: true,
            viewCount: true,
            tags: {
                include: {
                    tag: true
                }
            },
            author: true,
            cheerCount: true,
            empathyCount: true,
            likeCount: true,
            questionCount: true,
            badCount: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: {
                    comments: true,
                }
            }
        }
    })
}

export async function GetComments(articleId: bigint) {
    return prisma.comment.findMany({
        where: {
            articleId: articleId,
        },
        select: {
            id: true,
            author: {
                select: {
                    id: true,
                    displayName: true,
                }
            },
            isHidden: true,
            parentId: true,
            content: true,
            cheerCount: true,
            empathyCount: true,
            likeCount: true,
            questionCount: true,
            badCount: true,
            createdAt: true,
        }
    })
}

export type GetCommentsType = NonNullable<Awaited<ReturnType<typeof GetComments>>>;
export type CommentDisplay = GetCommentsType[number] & { children: CommentDisplay[] };
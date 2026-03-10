// @/app/api/_util/assertPermission.ts

import { prisma } from "@labatory/db";

export function mapPermissionError(msg: string) {
  if (msg === "Comment does not exist.") return { error: msg, status: 400 };
  if (msg === "Comment already deleted.") return { error: msg, status: 400 };
  if (msg === "Article does not exist.") return { error: msg, status: 400 };
  if (msg === "Article already deleted.") return { error: msg, status: 400 };
  if (msg === "Parent comment does not exist.") return { error: msg, status: 400 };
  if (msg === "Parent comment is hidden.") return { error: msg, status: 400 };
  if (msg === "Parent comment does not belong to the article.") {
    return { error: msg, status: 400 };
  }
  if (msg === "Forbidden.") return { error: msg, status: 403 };
  return { error: "Internal server error.", status: 500 };
}

export async function assertCommentAuthorOrAdmin(commentId: bigint, userId: bigint, role?: string) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      authorId: true,
      isHidden: true,
    },
  });

  if (!comment) throw new Error("Comment does not exist.");
  if (comment.isHidden) throw new Error("Comment already deleted.");

  const isAuthor = comment.authorId === userId;
  const isAdmin = role === "ADMIN";

  if (!isAuthor && !isAdmin) throw new Error("Forbidden.");

  return comment;
}

export async function assertArticleAuthorOrAdmin(articleId: bigint, userId: bigint, role?: string) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      authorId: true,
      isHidden: true,
    },
  });

  if (!article) throw new Error("Article does not exist.");
  if (article.isHidden) throw new Error("Article already deleted.");

  const isAuthor = article.authorId === userId;
  const isAdmin = role === "ADMIN";

  if (!isAuthor && !isAdmin) throw new Error("Forbidden.");

  return article;
}

export async function assertArticleCommentable(articleId: bigint) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      isHidden: true,
    },
  });

  if (!article) throw new Error("Article does not exist.");
  if (article.isHidden) throw new Error("Article already deleted.");

  return article;
}

export async function assertParentCommentInArticle(parentId: bigint, articleId: bigint) {
  const parent = await prisma.comment.findUnique({
    where: { id: parentId },
    select: {
      id: true,
      articleId: true,
      isHidden: true,
    },
  });

  if (!parent) throw new Error("Parent comment does not exist.");
  if (parent.isHidden) throw new Error("Parent comment is hidden.");
  if (parent.articleId !== articleId) {
    throw new Error("Parent comment does not belong to the article.");
  }

  return parent;
}

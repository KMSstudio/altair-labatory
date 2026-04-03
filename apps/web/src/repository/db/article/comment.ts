// @/repository/db/comments.ts

"use server";

import { Prisma, prisma } from "@labatory/db";

import type { Comment_Ctx, Comment_PostInput, Comment_UpdateInput } from "@/types/article";
import { type CommentDbShape, CommentDTO, getCommentSelect } from "@/repository/dto/article";
import { serializeComment } from "@/repository/serialize/article";

/**
 * Creates a new comment.
 *
 * This function performs DB-only logic and does not validate user session
 * or authorization. Caller is responsible for supplying a valid context.
 *
 * @param ctx - Author context used for DB write.
 * @param input - Comment creation payload.
 * @returns The created comment.
 */
export async function PostComment(ctx: Comment_Ctx, input: Comment_PostInput): Promise<CommentDTO> {
  const comment = (await prisma.comment.create({
    data: {
      articleId: input.articleId,
      parentId: input.parentId,
      content: input.content,
      authorId: ctx.authorId,
      authorIp: ctx.authorIp,
    },
    select: getCommentSelect,
  })) as CommentDbShape;
  return serializeComment(comment);
}

/**
 * Updates an existing comment and stores its previous state in commentHistory.
 *
 * This function performs DB-only logic and does not validate user session
 * or authorization. Caller is responsible for deciding whether the update
 * is allowed.
 *
 * @param commentId - Target comment id.
 * @param ctx - Author context used for DB write.
 * @param input - Comment update payload.
 * @returns The updated comment.
 */
export async function UpdateComment(
  commentId: bigint,
  ctx: Comment_Ctx,
  input: Comment_UpdateInput,
): Promise<CommentDTO> {
  const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const prev = await tx.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        content: true,
        authorIp: true,
      },
    });
    if (!prev) throw Error("Comment does not exist.");

    await tx.commentHistory.create({
      data: {
        commentId,
        oldContent: prev.content,
        oldAuthorIp: prev.authorIp,
      },
    });

    return tx.comment.update({
      where: { id: commentId },
      data: {
        content: input.content,
        authorIp: ctx.authorIp,
      },
      select: getCommentSelect,
    }) as Promise<CommentDbShape>;
  });

  return serializeComment(updated);
}

/**
 * Soft-deletes a comment.
 *
 * This function performs DB-only logic and does not validate user session
 * or authorization. Caller is responsible for deciding whether the deletion
 * is allowed.
 *
 * @param commentId - Target comment id.
 * @returns The deleted comment after update.
 */
export async function DeleteComment(commentId: bigint): Promise<CommentDTO> {
  const deleted = (await prisma.comment.update({
    where: { id: commentId },
    data: {
      isHidden: true,
      deletedAt: new Date(),
    },
    select: getCommentSelect,
  })) as CommentDbShape;
  return serializeComment(deleted);
}

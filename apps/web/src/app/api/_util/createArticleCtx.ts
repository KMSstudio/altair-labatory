// @/app/api/_util/createArticleCtx.ts

import "server-only";

import type { Session } from "next-auth";
import { getClientIp } from "@/util/util";
import type { Article_Ctx, Comment_Ctx } from "@/types/article";

/**
 * Build author context for article CRUD.
 *
 * This helper performs authentication and request-origin extraction:
 * - Validates NextAuth session existence
 * - Parses `session.user.id` into bigint
 * - Extracts client IP address
 *
 * It returns a context object used by downstream DB-layer functions.
 *
 * @returns Author context containing `authorId` and `authorIp`.
 *
 * @throws Error
 * Throws an Error with a user-facing message if:
 * - user is not authenticated
 * - session user id is missing or invalid
 * - client IP cannot be extracted
 */
export async function buildCreateArticleCtx(session: Session): Promise<Article_Ctx> {
  let authorId: bigint;
  try {
    authorId = BigInt(session.user.id);
  } catch {
    throw Error("Invalid user id.");
  }

  const clientIp = await getClientIp();
  if (!clientIp) throw Error("Invalid client ip.");

  return { authorId, authorIp: clientIp };
}

/**
 * Build author context for comment CRUD.
 *
 * This helper performs authentication and request-origin extraction:
 * - Parses `session.user.id` into bigint
 * - Extracts client IP address
 *
 * It returns a context object used by comment DB-layer functions.
 *
 * @param session - Authenticated NextAuth session
 *
 * @returns Author context containing `authorId` and `authorIp`.
 *
 * @throws Error
 * Throws an Error with a user-facing message if:
 * - session user id is missing or invalid
 * - client IP cannot be extracted
 */
export async function buildCommentCtx(session: Session): Promise<Comment_Ctx> {
  let authorId: bigint;
  try {
    authorId = BigInt(session.user.id);
  } catch {
    throw Error("Invalid user id.");
  }

  const clientIp = await getClientIp();
  if (!clientIp) throw Error("Invalid client ip.");

  return { authorId, authorIp: clientIp };
}

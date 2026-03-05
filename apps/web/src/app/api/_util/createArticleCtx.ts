// @/src/app/api/_util/createArticleCtx.ts

import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getClientIp } from "@/util/util";
import type { Article_Ctx } from "@/types/article";

/**
 * Build author context for article creation.
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
export async function buildCreateArticleCtx(boardIdRaw: string): Promise<Article_Ctx> {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw Error("User must be logged in.");
  if (!session.user.id) throw Error("Invalid session.");

  let authorId: bigint;
  try { authorId = BigInt(session.user.id); }
  catch { throw Error("Invalid user id."); }

  const clientIp = await getClientIp();
  if (!clientIp) throw Error("Invalid client ip.");

  let boardId: bigint;
  try { boardId = BigInt(boardIdRaw.trim()); }
  catch { throw Error("Invalid board id."); }

  return { authorId, boardId, authorIp: clientIp };
}

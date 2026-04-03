// @/repository/db/emote.ts

"use server";

import { Prisma, prisma, type EmoteKind, EmotePlace } from "@labatory/db";

import type { PostEmoteDTO } from "@/repository/dto/article";
import { getPostEmoteSelect } from "@/repository/dto/article";
import { serializeEmote } from "@/repository/serialize/article";
import type { Emote_Ctx } from "@/types/article";

/**
 * Toggle a user's emote on an article or comment.
 *
 * This function performs DB-only logic and does not validate session
 * or authorization. Caller is responsible for supplying a valid ctx.
 *
 * Behavior:
 * - if the same emote already exists, delete it
 * - otherwise create it
 * - return whether the emote is now active, with the current emote list
 *
 * @param ctx - Emote context containing user/target info.
 * @param emoteKind - Target emote kind to toggle.
 * @returns Toggle result with active flag and current serialized emotes.
 */
export async function ToggleEmote(
  ctx: Emote_Ctx,
  emoteKind: EmoteKind,
): Promise<{
  active: boolean;
  emotes: PostEmoteDTO[];
}> {
  const { userId, postId, postKind } = ctx;
  if (!(postKind in EmotePlace)) {
    throw new Error(`Invalid EmotePlace: ${postKind}`);
  }

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const existing = await tx.emote.findFirst({
      where:
        postKind === "ARTICLE"
          ? {
              userId,
              place: "ARTICLE",
              articleId: postId,
              kind: emoteKind,
            }
          : {
              userId,
              place: "COMMENT",
              commentId: postId,
              kind: emoteKind,
            },
      select: { id: true },
    });

    let active: boolean;

    if (existing) {
      await tx.emote.delete({ where: { id: existing.id } });
      active = false;
    } else {
      await tx.emote.create({
        data:
          postKind === "ARTICLE"
            ? {
                userId,
                place: "ARTICLE",
                articleId: postId,
                kind: emoteKind,
              }
            : {
                userId,
                place: "COMMENT",
                commentId: postId,
                kind: emoteKind,
              },
      });
      active = true;
    }

    const emotes = await tx.emote.findMany({
      where:
        postKind === "ARTICLE"
          ? {
              place: "ARTICLE",
              articleId: postId,
            }
          : {
              place: "COMMENT",
              commentId: postId,
            },
      select: getPostEmoteSelect,
      orderBy: { createdAt: "asc" },
    });

    return {
      active,
      emotes: emotes.map(serializeEmote),
    };
  });
}

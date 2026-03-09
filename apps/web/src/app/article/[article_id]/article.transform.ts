// @/app/article/[article_id]/article.transform.ts

import { EmoteKind } from "@labatory/db";

import type { CommentDTO, CommentDisplayTree } from "@/repository/dto/article";
import type { PostEmoteDTO, EmoteCountRecord, EmoteDisplayState } from "@/repository/dto/article";

export function BuildCommentDisplayTree(comments: CommentDTO[] | null): CommentDisplayTree[] {
  if (!comments) return [];

  const roots: CommentDisplayTree[] = [];
  const map = new Map<string, CommentDisplayTree>();

  for (const comment of comments) {
    map.set(comment.id, { ...comment, children: [] });
  }

  for (const comment of map.values()) {
    if (comment.parentId === null || comment.parentId === comment.id) {
      roots.push(comment);
      continue;
    }

    const parent = map.get(comment.parentId);
    if (!parent) {
      roots.push(comment);
      continue;
    }

    parent.children.push(comment);
  }

  return roots;
}

export function BuildEmoteCountRecord(emotes: PostEmoteDTO[]): EmoteCountRecord {
  const counts = {} as EmoteCountRecord;
  for (const kind of Object.values(EmoteKind)) {
    counts[kind] = 0;
  }
  for (const { kind } of emotes) {
    counts[kind] = (counts[kind] ?? 0) + 1;
  }
  return counts;
}

export function BuildEmoteDisplayState(
  emotes: PostEmoteDTO[],
  viewerId: string | null,
): EmoteDisplayState {
  const counts = BuildEmoteCountRecord(emotes);
  if (viewerId === null) return { counts, activeKinds: [] };
  const activeSet = new Set<EmoteKind>();
  for (const emote of emotes) {
    if (emote.userId === viewerId) activeSet.add(emote.kind);
  }
  return { counts, activeKinds: [...activeSet] };
}

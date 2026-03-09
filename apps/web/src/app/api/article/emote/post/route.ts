// @/app/api/article/emote/post/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { EmoteKind, EmotePlace } from "@labatory/db";

import { authOptions } from "@/lib/auth";
import type { Emote_Ctx } from "@/types/article";
import { ToggleEmote } from "@/repository/db/emote";
import { BuildEmoteDisplayState } from "@/app/article/[article_id]/article.transform";

type Body = {
  postId: string;
  postKind: string;
  emoteKind: string;
};

function ParseEmotePlace(value: string): EmotePlace {
  if (!Object.values(EmotePlace).includes(value as EmotePlace)) {
    throw new Error(`Invalid EmotePlace: ${value}`);
  }
  return value as EmotePlace;
}

function ParseEmoteKind(value: string): EmoteKind {
  if (!Object.values(EmoteKind).includes(value as EmoteKind)) {
    throw new Error(`Invalid EmoteKind: ${value}`);
  }
  return value as EmoteKind;
}

function ParseEmoteRequest(
  sessionUserId: string,
  postIdRaw: string,
  postKindRaw: string,
  emoteKindRaw: string,
): {
  userId: bigint;
  postId: bigint;
  postKind: EmotePlace;
  emoteKind: EmoteKind;
} {
  let userId: bigint;
  let postId: bigint;
  let postKind: EmotePlace;
  let emoteKind: EmoteKind;

  try {
    userId = BigInt(sessionUserId);
  } catch {
    throw new Error("Invalid user id.");
  }

  try {
    postId = BigInt(postIdRaw);
  } catch {
    throw new Error("Invalid postId.");
  }

  try {
    postKind = ParseEmotePlace(postKindRaw);
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : "Invalid postKind.");
  }

  try {
    emoteKind = ParseEmoteKind(emoteKindRaw);
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : "Invalid emoteKind.");
  }

  return { userId, postId, postKind, emoteKind };
}

export async function POST(request: Request) {
  let body: Body;

  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "User must be logged in." }, { status: 401 });
  }

  const postIdRaw = body.postId?.toString().trim() ?? "";
  const postKindRaw = body.postKind?.toString().trim() ?? "";
  const emoteKindRaw = body.emoteKind?.toString().trim() ?? "";

  if (!postIdRaw) return NextResponse.json({ error: "postId is required." }, { status: 400 });
  if (!postKindRaw) return NextResponse.json({ error: "postKind is required." }, { status: 400 });
  if (!emoteKindRaw) return NextResponse.json({ error: "emoteKind is required." }, { status: 400 });

  let userId: bigint;
  let postId: bigint;
  let postKind: EmotePlace;
  let emoteKind: EmoteKind;

  try {
    ({ userId, postId, postKind, emoteKind } = ParseEmoteRequest(
      session.user.id,
      postIdRaw,
      postKindRaw,
      emoteKindRaw,
    ));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid request." },
      { status: 400 },
    );
  }
  const ctx: Emote_Ctx = { userId, postId, postKind };

  try {
    const result = await ToggleEmote(ctx, emoteKind);

    const emoteState = BuildEmoteDisplayState(result.emotes, session.user.id);

    return NextResponse.json({
      ok: true,
      active: result.active,
      emoteState,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error." },
      { status: 500 },
    );
  }
}

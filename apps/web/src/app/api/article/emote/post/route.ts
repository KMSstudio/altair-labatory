// @/app/api/article/emote/post/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { EmoteKind, EmotePlace } from "@labatory/db";

import { authOptions } from "@/lib/auth";
import type { Emote_Ctx } from "@/types/article";
import { ToggleEmote } from "@/repository/db/article/emote";
import { BuildEmoteDisplayState } from "@/app/article/[article_id]/article.transform";
import { parseBigInt, parseEnumValue } from "@/app/api/_util/parse";

type Body = {
  postId: string;
  postKind: string;
  emoteKind: string;
};

/**
 * Toggle an emote on an article or comment.
 *
 * This endpoint parses the target post information and emote kind,
 * then toggles the emote for the current user.
 *
 * Validation steps:
 * 1. Parse request body
 * 2. Validate user session
 * 3. Parse `userId`, `postId`, `postKind`, and `emoteKind`
 * 4. Toggle emote state
 * 5. Build display state for client response
 *
 * @param request - HTTP request containing `{ postId, postKind, emoteKind }`
 *
 * @returns
 * - `200` `{ ok: true, active, emoteState }` on success
 * - `400` for invalid input
 * - `401` when the user is not logged in
 * - `500` for internal server errors
 */
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

  let userId: bigint;
  let postId: bigint;
  let postKind: EmotePlace;
  let emoteKind: EmoteKind;
  try {
    userId = parseBigInt(session.user.id, "user id");
    postId = parseBigInt(body.postId, "postId");
    postKind = parseEnumValue(EmotePlace, body.postKind, "postKind");
    emoteKind = parseEnumValue(EmoteKind, body.emoteKind, "emoteKind");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid parameter.";
    return NextResponse.json({ error: msg }, { status: 400 });
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

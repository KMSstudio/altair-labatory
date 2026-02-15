"use client";

import { useState } from "react";
import { GetEmoteCount, type GetEmoteCountResult, PostEmote } from "../../actions";
import { type EmoteKind } from "@labatory/db";
export function EmoteSection({
  emotes,
  id,
  kind,
}: {
  emotes: GetEmoteCountResult;
  id: bigint;
  kind: "COMMENT" | "ARTICLE";
}) {
  const [counts, setCounts] = useState<Record<EmoteKind, number>>(emotes);
  const [isPressed, setIsPressed] = useState<Record<EmoteKind, boolean>>({
    CHEER: false,
    EMPATHY: false,
    LIKE: false,
    QUESTION: false,
    BAD: false,
  });
  async function onClick(emoteType: EmoteKind) {
    try {
      const res = await PostEmote({ id, targetPlace: kind, emoteKind: emoteType });
      setIsPressed((prev) => ({
        ...prev,
        [emoteType]: res,
      }));
      setCounts(await GetEmoteCount({ id, targetPlace: kind }));
    } catch (e) {
      alert(`Posting emote error: ${e instanceof Error ? e.message : "Unknown error."}`);
    }
  }

  return (
    <div>
      <div>
        <button onClick={() => onClick("CHEER")} style={{ opacity: isPressed["CHEER"] ? 0.6 : 1 }}>
          CHEER {counts["CHEER"] ?? 0}
        </button>
      </div>
      <div>
        <button
          onClick={() => onClick("EMPATHY")}
          style={{ opacity: isPressed["EMPATHY"] ? 0.6 : 1 }}
        >
          EMPATHY {counts["EMPATHY"] ?? 0}
        </button>
      </div>
      <div>
        <button onClick={() => onClick("LIKE")} style={{ opacity: isPressed["LIKE"] ? 0.6 : 1 }}>
          LIKE {counts["LIKE"] ?? 0}
        </button>
      </div>
      <div>
        <button
          onClick={() => onClick("QUESTION")}
          style={{ opacity: isPressed["QUESTION"] ? 0.6 : 1 }}
        >
          QUESTION {counts["QUESTION"] ?? 0}
        </button>
      </div>
      <div>
        <button onClick={() => onClick("BAD")} style={{ opacity: isPressed["BAD"] ? 0.6 : 1 }}>
          BAD {counts["BAD"] ?? 0}
        </button>
      </div>
    </div>
  );
}

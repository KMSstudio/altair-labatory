"use client";

import { useState } from "react";
import { type EmoteKind } from "@labatory/db";
import type { EmoteDisplayState } from "@/repository/dto/article";
import styles from "../article.module.css";

const EMOTE_KINDS: EmoteKind[] = ["CHEER", "EMPATHY", "LIKE", "QUESTION", "BAD"];

function BuildPressedRecord(activeKinds: EmoteKind[]): Record<EmoteKind, boolean> {
  return {
    CHEER: activeKinds.includes("CHEER"),
    EMPATHY: activeKinds.includes("EMPATHY"),
    LIKE: activeKinds.includes("LIKE"),
    QUESTION: activeKinds.includes("QUESTION"),
    BAD: activeKinds.includes("BAD"),
  };
}

type PostEmoteResponse = {
  ok: true;
  emoteState: EmoteDisplayState;
};

export function EmoteSection({
  emoteState,
  postId,
  postKind,
}: {
  emoteState: EmoteDisplayState;
  postId: bigint;
  postKind: "COMMENT" | "ARTICLE";
}) {
  const [counts, setCounts] = useState(emoteState.counts);
  const [isPressed, setIsPressed] = useState<Record<EmoteKind, boolean>>(
    BuildPressedRecord(emoteState.activeKinds),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onClick(emoteKind: EmoteKind) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/article/emote/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: postId.toString(),
          postKind: postKind,
          emoteKind,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | PostEmoteResponse
        | { error?: string }
        | null;

      if (!res.ok) {
        const error =
          data && typeof data === "object" && "error" in data
            ? (data.error ?? "Unknown error.")
            : "Unknown error.";
        throw new Error(error);
      }

      if (!data || typeof data !== "object" || !("emoteState" in data) || !data.emoteState) {
        throw new Error("Invalid server response.");
      }

      setCounts(data.emoteState.counts);
      setIsPressed(BuildPressedRecord(data.emoteState.activeKinds));
    } catch (e) {
      alert(`Posting emote error: ${e instanceof Error ? e.message : "Unknown error."}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.emoteSection}>
      {EMOTE_KINDS.map((emoteKind) => (
        <div key={emoteKind}>
          <button
            type="button"
            onClick={() => onClick(emoteKind)}
            disabled={isSubmitting}
            className={`${styles.emoteBtn} ${isPressed[emoteKind] ? styles.emoteBtnActive : ""}`}
          >
            {emoteKind} {counts[emoteKind] ?? 0}
          </button>
        </div>
      ))}
    </div>
  );
}

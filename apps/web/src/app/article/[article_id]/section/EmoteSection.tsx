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
            if (e instanceof Error) {
                alert(e.message);
            } else {
                alert("Unknown Error.");
            }
        }
    }
    return (
        <div>
            <div>
                <button onClick={() => onClick("CHEER")}>
                    {isPressed["CHEER"] ? "응원 취소" : "응원해요:"} {counts["CHEER"] ?? 0}
                </button>
            </div>
            <div>
                <button onClick={() => onClick("EMPATHY")}>
                    {isPressed["EMPATHY"] ? "공감 취소" : "공감해요:"} {counts["EMPATHY"] ?? 0}
                </button>
            </div>
            <div>
                <button onClick={() => onClick("LIKE")}>
                    {isPressed["LIKE"] ? "좋아요 취소" : "좋아해요:"} {counts["LIKE"] ?? 0}
                </button>
            </div>
            <div>
                <button onClick={() => onClick("QUESTION")}>
                    {isPressed["QUESTION"] ? "궁금 취소" : "궁금해요:"} {counts["QUESTION"] ?? 0}
                </button>
            </div>
            <div>
                <button onClick={() => onClick("BAD")}>
                    {isPressed["BAD"] ? "비추천 취소" : "별로예요:"} {counts["BAD"] ?? 0}
                </button>
            </div>
        </div>
    );
}

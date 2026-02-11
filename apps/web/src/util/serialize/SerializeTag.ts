import { GetTagResult } from "../board.action";

export function SerializeTag(tag: GetTagResult) {
    return {
        id: tag.id.toString(),
        kind: tag.kind,
        lab: tag.lab,
        subj: tag.subj,
        univ: tag.univ,
        text: tag.text,
    }
}

export type SerializeTagResult = NonNullable<Awaited<ReturnType<typeof SerializeTag>>>
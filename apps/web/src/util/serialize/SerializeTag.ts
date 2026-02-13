import { GetTagResult } from "../tag.action";

export function SerializeTag(tag: GetTagResult) {
  return {
    id: tag.id.toString(),
    kind: tag.kind,
    labId: tag.labId?.toString(),
    subjId: tag.subjId?.toString(),
    univId: tag.univId?.toString(),
    text: tag.text,
  };
}

export type SerializeTagResult = NonNullable<Awaited<ReturnType<typeof SerializeTag>>>;

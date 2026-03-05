// @/src/util/serialize/SerializeTag.ts

import type { ArticleTagDbShape, ArticleTagDTO } from "@/lib/dto/article-tag";

export function serializeTag(tag: ArticleTagDbShape): ArticleTagDTO {
  return {
    id: tag.id.toString(),
    kind: tag.kind,
    labId: tag.labId?.toString(),
    subjId: tag.subjId?.toString(),
    univId: tag.univId?.toString(),
    text: tag.text,
  };
}

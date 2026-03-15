// @/util/actions/tag.action.ts

"use server";

import { prisma, Prisma, type TagKind } from "@labatory/db";
import type { TagDTO } from "@/repository/dto/article";
import { name2Text } from "@/util/util";
import { serializeTag } from "@/repository/serialize/article";

type DbClient = Prisma.TransactionClient | typeof prisma;

const TagSelect = {
  id: true,
  kind: true,
  labId: true,
  subjId: true,
  univId: true,
  text: true,
} as const;

/**
 * Resolve tag display text by referenced entity name.
 * Only supports kind: LAB | UNIV | SUBJECT.
 * @throws Error if kind is not supported or id is not bigint or connected row does not exist.
 */
async function fetchNameText(kind: TagKind, db: DbClient, id: bigint): Promise<string> {
  if (kind !== "LAB" && kind !== "UNIV" && kind !== "SUBJECT") throw Error("Invalid tag kind.");

  const getName = () => {
    switch (kind) {
      case "LAB":
        return db.lab.findUnique({ where: { id }, select: { nameKo: true, nameEn: true } });
      case "UNIV":
        return db.university.findUnique({ where: { id }, select: { nameKo: true, nameEn: true } });
      case "SUBJECT":
        return db.subject.findUnique({ where: { id }, select: { nameKo: true, nameEn: true } });
    }
  };

  const result = await getName();
  if (!result) throw Error("Invalid tag.");
  return name2Text(result.nameKo, result.nameEn);
}

/**
 * Create a new tag.
 * - kind=TEXT: requires text
 * - kind!=TEXT: requires id (connect), and text is auto-generated from the referenced entity.
 * @throws Error if required fields are missing or references are invalid.
 */
export async function CreateTag({
  kind,
  id,
  text,
  db = prisma,
}: {
  kind: TagKind;
  id?: bigint;
  text?: string;
  db?: DbClient;
}): Promise<TagDTO> {
  const data: Prisma.TagCreateInput = { kind };

  if (kind === "TEXT") {
    if (!text?.trim()) throw Error("Invalid tag creation: kind == TEXT requires text field.");
    data.text = text.trim();
  } else {
    if (typeof id !== "bigint") throw Error("Invalid tag creation: required id field is null.");
    switch (kind) {
      case "LAB":
        data.lab = { connect: { id } };
        break;
      case "UNIV":
        data.univ = { connect: { id } };
        break;
      case "SUBJECT":
        data.subj = { connect: { id } };
        break;
      default:
        throw Error("Invalid tag creation due to unknown type.");
    }
    data.text = await fetchNameText(kind, db, id);
  }

  const newTag = await db.tag.create({ data, select: TagSelect });
  return serializeTag(newTag);
}

/**
 * Update existing tag's text.
 * - if text is empty/undefined:
 *   - LAB/UNIV/SUBJECT: regenerate text from referenced entity
 *   - TEXT: keep existing text
 * @throws Error if tagId is invalid or referenced entity is invalid
 */
export async function UpdateTag({
  tagId,
  text,
  db = prisma,
}: {
  tagId: bigint;
  text?: string;
  db?: DbClient;
}): Promise<TagDTO> {
  const tag = await db.tag.findUnique({ where: { id: tagId }, select: TagSelect });
  if (!tag) throw Error("Invalid tag id");

  let nextText = "";
  if (tag.kind === "TEXT") {
    nextText = text?.trim() || (tag.text ?? "").trim();
  } else {
    const refId =
      tag.kind === "LAB"
        ? tag.labId
        : tag.kind === "SUBJECT"
          ? tag.subjId
          : tag.kind === "UNIV"
            ? tag.univId
            : null;
    if (refId == null) throw Error("Invalid tag update: required reference id field is null.");
    nextText = await fetchNameText(tag.kind, db, refId);
  }

  const updatedTag = await db.tag.update({
    where: { id: tag.id },
    data: { text: nextText },
    select: TagSelect,
  });

  return serializeTag(updatedTag);
}

/**
 * Get tag info by id.
 */
export async function GetTag({
  tagId,
  db = prisma,
}: {
  tagId: bigint;
  db?: DbClient;
}): Promise<TagDTO | null> {
  const tag = await db.tag.findUnique({ where: { id: tagId }, select: TagSelect });
  if (tag === null) return null;
  return serializeTag(tag);
}
/**
 * Get info of all tags
 */
export async function GetTags({ db = prisma }: { db?: DbClient }): Promise<TagDTO[]> {
  const tags = await db.tag.findMany({ select: TagSelect });
  return tags.map(serializeTag);
}

/**
 * Search tags by kind and partial text match.
 */
export async function SearchTags({
  kind,
  query,
  db = prisma,
}: {
  kind: TagKind;
  query: string;
  db?: DbClient;
}): Promise<TagDTO[]> {
  const query_trim = query.trim();
  const whereQuery = (q: string) => ({ contains: q, mode: Prisma.QueryMode.insensitive }) as const;

  const tags = await db.tag.findMany({
    where: { AND: [{ text: whereQuery(query_trim), kind }] },
    select: TagSelect,
  });
  return tags.map(serializeTag);
}

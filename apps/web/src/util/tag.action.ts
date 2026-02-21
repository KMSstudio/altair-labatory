"use server";

import { prisma, Prisma, type TagKind } from "@labatory/db";
import { headers } from "next/headers";

/**
 * Extracts the client's IP address from incoming request headers.
 * @returns {Promise<string | null>} The detected client IP address or null.
 */
export async function getClientIp() {
  const h = await headers();

  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return h.get("x-real-ip");
}

const getTagSelect = {
  id: true,
  kind: true,
  labId: true,
  subjId: true,
  univId: true,
  text: true,
};
const nameToText = (nameKo: string, nameEn: string | null) => {
  return `${nameKo}(${nameEn ?? ""})`;
};
async function fetchNameText(kind: TagKind, db: DbClient = prisma, id: bigint | null) {
  if (!id) throw Error("Invalid tag.");
  if (kind === "TEXT") {
    return "";
  }
  switch (kind) {
    case "LAB": {
      if (!id) throw Error("Invalid tag.");

      const result = await db.lab.findUnique({
        where: { id },
        select: { nameKo: true, nameEn: true },
      });

      if (!result) throw Error("Invalid tag.");
      return nameToText(result.nameKo, result.nameEn);
    }

    case "UNIV": {
      if (!id) throw Error("Invalid tag.");

      const result = await db.university.findUnique({
        where: { id },
        select: { nameKo: true, nameEn: true },
      });

      if (!result) throw Error("Invalid tag.");
      return nameToText(result.nameKo, result.nameEn);
    }

    case "SUBJECT": {
      if (!id) throw Error("Invalid tag.");

      const result = await db.subject.findUnique({
        where: { id },
        select: { nameKo: true, nameEn: true },
      });

      if (!result) throw Error("Invalid tag.");
      return nameToText(result.nameKo, result.nameEn);
    }

    default:
      throw Error("Invalid tag.");
  }
}

type DbClient = Prisma.TransactionClient | typeof prisma;

/**
 * create a new tag.
 * @param {TagKind} kind kind of tag. one of following string:
 * - UNIV
 * - LAB
 * - SUBJECT
 * - TEXT
 * @param {bigint|null} id Id of SUBJECT/LAB/UNIVERSITY whose tag will be created. if kind is TEXT, id is null.
 * @param {string|null} text Text of tag. Null if kind is not NULL.
 * @param {Dbclient} db Prisma client where db function will be called. default prisma
 * @returns newly created tag with:
 *- id
 *- kind
 *- labId
 *- subjId
 *- univId
 *- text
 * @throws If id is null while kind is not TEXT, or text is null whlie kind is TEXT. Throw If connected value is not valid.
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
}) {
  if ((kind === "TEXT" && !text) || (kind !== "TEXT" && !id)) {
    throw Error("Invalid tag creation.");
  }
  const data: Prisma.TagCreateInput = {
    kind,
  };

  switch (kind) {
    case "LAB":
      if (!id) {
        throw Error("Invalid tag creation.");
      }
      data.lab = { connect: { id } };
      data.text = await fetchNameText("LAB", db, id);
      break;
    case "SUBJECT":
      if (!id) {
        throw Error("Invalid tag creation.");
      }
      data.subj = { connect: { id } };
      data.text = await fetchNameText("SUBJECT", db, id);
      break;
    case "UNIV":
      if (!id) {
        throw Error("Invalid tag creation.");
      }
      data.univ = { connect: { id } };
      data.text = await fetchNameText("UNIV", db, id);
      break;
    case "TEXT":
      data.text = text;
      break;
  }
  return db.tag.create({
    data,
    select: getTagSelect,
  });
}
/**
 * Update existing tag's text.
 * @param {bigint} tagId Id of tag whose information will be changed.
 * @param {string|null} text Text of tag. Null if kind is not NULL.
 * @param {Dbclient} db Prisma client where db function will be called. default prisma
 * @returns newly created tag with:
 *- id
 *- kind
 *- labId
 *- subjId
 *- univId
 *- text
 * @throws If id is null while kind is not TEXT, or text is null whlie kind is TEXT. Throw If connected value is not valid.
 */
export async function UpdateTag({
  tagId,
  text,
  db = prisma,
}: {
  tagId: bigint;
  text?: string;
  db?: DbClient;
}) {
  const tag = await db.tag.findUnique({
    where: {
      id: tagId,
    },
    select: getTagSelect,
  });
  if (!tag) throw Error("Invalid tag id");
  let Tagtext: string = text ?? "";
  if (!Tagtext) {
    switch (tag.kind) {
      case "LAB":
        Tagtext = await fetchNameText("LAB", db, tag.labId);
        break;
      case "SUBJECT":
        Tagtext = await fetchNameText("SUBJECT", db, tag.subjId);
        break;
      case "UNIV":
        Tagtext = await fetchNameText("UNIV", db, tag.univId);
        break;
      case "TEXT":
        if (!tag.text) break;
        Tagtext = tag.text;
        break;
    }
  }
  return db.tag.update({
    where: {
      id: tag.id,
    },
    data: {
      text: Tagtext,
    },
    select: getTagSelect,
  });
}
/**
 * Get tag information.
 * @param {bigint} tagId Id of tag.
 * @param {Dbclient} db Prisma client where db function will be called. default prisma
 * @returns newly created tag with:
 *- id
 *- kind
 *- labId
 *- subjId
 *- univId
 *- text
 */
export async function GetTag({ tagId, db = prisma }: { tagId: bigint; db?: DbClient }) {
  return db.tag.findUnique({
    where: { id: tagId },
    select: getTagSelect,
  });
}

/**
 * Search a number of tags which have query as part of their text.
 * @param {TagKind} kind Determine a field where search will be performed. one of following string:
 * - UNIV
 * - LAB
 * - SUBJECT
 * - TEXT
 * @param {string} queryRaw User input. did not trimmed.
 * @param {Dbclient} db Prisma client where db function will be called. default prisma.
 * @returns List of tag met condition. return value contains:
 *- id
 *- kind
 *- labId
 *- subjId
 *- univId
 *- text
 */
export async function SearchTags({
  kind,
  queryRaw,
  db = prisma,
}: {
  kind: TagKind;
  queryRaw: string;
  db?: DbClient;
}) {
  const where: Prisma.TagWhereInput = {};
  const query = queryRaw.trim();
  const whereQuery = (query: string) =>
    ({ contains: query, mode: Prisma.QueryMode.insensitive }) as const;

  where.AND = [{ text: whereQuery(query), kind }];

  return db.tag.findMany({
    where,
    select: getTagSelect,
  });
}

export type GetTagResult = NonNullable<Awaited<ReturnType<typeof GetTag>>>;

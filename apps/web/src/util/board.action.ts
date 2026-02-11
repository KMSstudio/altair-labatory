
"use server";

import { prisma, Prisma, Tag, TagKind } from "@labatory/db";
import { headers } from "next/headers";

export async function getClientIp() {
    const h = await headers();

    const forwardedFor = h.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0].trim();
    }

    return h.get("x-real-ip");
}

const tagDisplaySelect = {
    id: true,
    kind: true,
    lab: {
        select: {
            nameKo: true,
            nameEn: true,
        }
    },
    subj: {
        select: {
            nameKo: true,
            nameEn: true,
        }
    },
    univ: {
        select: {
            nameKo: true,
            nameEn: true,
        }
    },
    text: true
}

export async function createTag(kind: TagKind, id?: bigint, text?: string) {
    if ((kind === TagKind.TEXT && !text) || (kind !== TagKind.TEXT && !id)) {
        throw Error("Invalid tag creation.");
    }
    let data: Prisma.TagCreateInput = {
        kind
    };
    switch (kind) {
        case TagKind.LAB:
            data.lab = { connect: { id } }
            break;
        case TagKind.SUBJECT:
            data.subj = { connect: { id } }
            break;
        case TagKind.UNIV:
            data.univ = { connect: { id } }
            break;
        case TagKind.TEXT:
            data.text = text;
            break;
    }

    const tag = prisma.tag.create({
        data,
        select: tagDisplaySelect
    })

    return tag;
}

export async function GetTag(tagId: bigint) {
    return prisma.tag.findUnique({
        where: { id: tagId },
        select: tagDisplaySelect,
    })
}

export async function SearchTags(kind: TagKind, queryRaw: string) {
    let where: Prisma.TagWhereInput = {};
    const query = queryRaw.trim();
    const whereQuery = (query: string) =>
        ({ contains: query, mode: Prisma.QueryMode.insensitive }) as const;
    const orGroups = {
        [TagKind.LAB]: [{ lab: { nameEn: whereQuery(query) } }, { lab: { nameKo: whereQuery(query) } }],
        [TagKind.UNIV]: [{ univ: { nameEn: whereQuery(query) } }, { univ: { nameKo: whereQuery(query) } }],
        [TagKind.SUBJECT]: [{ subj: { nameEn: whereQuery(query) } }, { subj: { nameKo: whereQuery(query) } }],
        [TagKind.TEXT]: [{ text: whereQuery(query) }],
    } satisfies Record<TagKind, Prisma.TagWhereInput["OR"]>;

    where.OR = orGroups[kind];

    return await prisma.tag.findMany({
        where,
        select: tagDisplaySelect
    })
}

export type GetTagResult = NonNullable<Awaited<ReturnType<typeof GetTag>>>;

function GetTagDisplayText(tag: GetTagResult): string {

    let text: string = "";
    const nameToText = ((nameKo: string, nameEn: string | null) => { return `${nameKo}(${nameEn ?? ""})` })

    switch (tag.kind) {
        case "LAB":
            if (!tag.lab) break;
            text = nameToText(tag.lab.nameKo, tag.lab.nameEn)
            break;
        case "SUBJECT":
            if (!tag.subj) break;
            text = nameToText(tag.subj.nameKo, tag.subj.nameEn)
            break;
        case "UNIV":
            if (!tag.univ) break;
            text = nameToText(tag.univ.nameKo, tag.univ.nameEn)
            break;
        case "TEXT":
            if (!tag.text) break;
            text = tag.text
            break;
    }
    return text;
}
"use server";

import { prisma, Prisma, TagKind } from "@labatory/db";
import { headers } from "next/headers";

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
    if (!id) throw Error("Invaild tag.");
    if (kind === TagKind.TEXT) {
        return "";
    }
    switch (kind) {
        case TagKind.LAB: {
            if (!id) throw Error("Invalid tag.");

            const result = await db.lab.findUnique({
                where: { id },
                select: { nameKo: true, nameEn: true },
            });

            if (!result) throw Error("Invalid tag.");
            return nameToText(result.nameKo, result.nameEn);
        }

        case TagKind.UNIV: {
            if (!id) throw Error("Invalid tag.");

            const result = await db.university.findUnique({
                where: { id },
                select: { nameKo: true, nameEn: true },
            });

            if (!result) throw Error("Invalid tag.");
            return nameToText(result.nameKo, result.nameEn);
        }

        case TagKind.SUBJECT: {
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
    if ((kind === TagKind.TEXT && !text) || (kind !== TagKind.TEXT && !id)) {
        throw Error("Invalid tag creation.");
    }
    const data: Prisma.TagCreateInput = {
        kind,
    };

    switch (kind) {
        case TagKind.LAB:
            if (!id) {
                throw Error("Invalid tag creation.");
            }
            data.lab = { connect: { id } };
            data.text = await fetchNameText("LAB", db, id);
            break;
        case TagKind.SUBJECT:
            if (!id) {
                throw Error("Invalid tag creation.");
            }
            data.subj = { connect: { id } };
            data.text = await fetchNameText("SUBJECT", db, id);
            break;
        case TagKind.UNIV:
            if (!id) {
                throw Error("Invalid tag creation.");
            }
            data.univ = { connect: { id } };
            data.text = await fetchNameText("UNIV", db, id);
            break;
        case TagKind.TEXT:
            data.text = text;
            break;
    }
    return db.tag.create({
        data,
        select: getTagSelect,
    });
}
export async function UpdateTag({
    tagId,
    text,
    db = prisma,
}: {
    tagId: bigint;
    text?: string;
    db?: DbClient;
}) {
    const tag = await prisma.tag.findUnique({
        where: {
            id: tagId,
        },
        select: getTagSelect,
    });
    if (!tag) throw Error("Invaild tag id");
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

export async function GetTag({ tagId, db = prisma }: { tagId: bigint; db?: DbClient }) {
    return db.tag.findUnique({
        where: { id: tagId },
        select: getTagSelect,
    });
}

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

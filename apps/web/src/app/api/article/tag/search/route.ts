import { SearchTags } from "@/repository/db/article/tag";
import { TagKind } from "@labatory/db";
import { NextResponse } from "next/server";

/**
 * Get tags that match the kind and query of request.
 * 
 * @param request - HTTP request containing `{ searchQuery, tagKind }`
 * @returns 
 * - `200` `{ ok: true, tags }` on success
 * - `500` for internal server errors
 */

type Body = {
    searchQuery: string,
    tagKind: TagKind
}
export async function GET(request: Request) {
    let body: Body;
    try {
        body = (await request.json()) as Body;
    } catch {
        return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    let trimmedQuery: string;
    let tagKind: TagKind;

    try {
        trimmedQuery = body.searchQuery.trim();
        tagKind = body.tagKind;
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Invalid parameter.";
        return NextResponse.json({ error: msg }, { status: 400 });
    }

    try {
        const tags = SearchTags({ kind: tagKind, query: trimmedQuery });
        return NextResponse.json({ ok: true, tags }, { status: 200 });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : "Internal server error." },
            { status: 500 },
        );
    }
}
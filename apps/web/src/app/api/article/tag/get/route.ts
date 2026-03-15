import { GetTags } from "@/repository/db/article/tag";
import { NextResponse } from "next/server";

/**
 * Get every instance of tags available.
 * @returns 
 * - `200` `{ ok: true, tags }` on success
 * - `500` for internal server errors
 */
export async function GET(request: Request) {
    try {
        const tags = await GetTags({});
        return NextResponse.json({ ok: true, tags }, { status: 200 });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : "Internal server error." },
            { status: 500 },
        );
    }
}
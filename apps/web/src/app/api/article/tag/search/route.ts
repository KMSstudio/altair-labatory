import { SearchTags } from "@/repository/db/article/tag";
import type { TagKind } from "@labatory/db";
import { NextResponse } from "next/server";

/**
 * Get tags that match the kind and query of request.
 *
 * @param request - HTTP request containing URL. URL contains searchQuery and tagKind.
 * @returns
 * - `200` `{ ok: true, tags }` on success
 * - `500` for internal server errors
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get("searchQuery");
  const rawKind = searchParams.get("tagKind");

  if (!searchQuery || !rawKind) {
    return NextResponse.json({ error: "searchQuery and tagKind are required." }, { status: 400 });
  }

  const trimmedQuery = searchQuery.trim();
  const tagKind = rawKind as TagKind;

  try {
    const tags = await SearchTags({ kind: tagKind, query: trimmedQuery });
    return NextResponse.json({ ok: true, tags }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error." },
      { status: 500 },
    );
  }
}

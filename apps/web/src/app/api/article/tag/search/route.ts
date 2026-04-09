import { parseEnumValue } from "@/app/api/_util/parse";
import { SearchTags } from "@/repository/db/article/tag";
import { TagKind } from "@labatory/db";
import { NextResponse } from "next/server";

type Body = {
  searchQuery: string;
  tagKind: string;
};

/**
 * Get tags that match the kind and query of request.
 *
 * @param request - HTTP request containing URL. URL contains searchQuery and tagKind.
 * @returns
 * - `200` `{ ok: true, tags }` on success
 * - `400` for invalid query or tagKind
 * - `500` for internal server errors
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const body: Body = {
    searchQuery: searchParams.get("searchQuery") ?? "",
    tagKind: searchParams.get("tagKind") ?? "",
  };
  if (!body.searchQuery || !body.tagKind) {
    return NextResponse.json({ error: "searchQuery and tagKind are required." }, { status: 400 });
  }

  const trimmedQuery = body.searchQuery.trim();
  let tagKind: TagKind;
  try {
    tagKind = parseEnumValue(TagKind, body.tagKind, "tagKind");
  } catch (e) {
    return NextResponse.json({ error: `${e}` }, { status: 400 });
  }
  try {
    const tags = await SearchTags({ kind: tagKind, query: trimmedQuery });
    return NextResponse.json({ ok: true, tags }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

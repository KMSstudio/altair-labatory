import { parseEnumValue } from "@/app/api/_util/parse";
import { SearchTags } from "@/repository/db/article/tag";
import { TagKind } from "@labatory/db";
import { NextResponse } from "next/server";

/**
 * Get tags that match the kind and query of request.
 *
 * @param request - HTTP request containing URL. URL contains searchQuery and tagKind.
 * @returns
 * - `200` `{ ok: true, tags }` on success
 * - `400` for invaild query or tagKind
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
  let tagKind: TagKind;
  try {
    tagKind = parseEnumValue(TagKind, rawKind, "tagKind");
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

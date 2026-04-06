// @/app/api/labatory/get/route.ts

import { NextResponse } from "next/server";
import { parseEnumValue } from "@/app/api/_util/parse";
import { LabSearchScope, searchLab } from "@/repository/db/labatory/labatory";

type Body = {
  query: string;
  searchScope: string;
};

/**
 * Get labatorys that match the searchScope and query of request.
 *
 * @param request - HTTP request containing URL. URL contains searchScope and query.
 * @returns
 * - `200` `{ ok: true, labs }` on success
 * - `400` for invaild query or searchScope
 * - `500` for internal server errors
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const body: Body = {
    query: searchParams.get("query") ?? "",
    searchScope: searchParams.get("searchScope") ?? "",
  };
  if (!body.query || !body.searchScope)
    return NextResponse.json({ error: "Query and search scope are required." }, { status: 400 });

  const query = body.query.trim();
  let searchScope: LabSearchScope;
  try {
    searchScope = parseEnumValue(LabSearchScope, body.searchScope, "lab search scope");
  } catch (e) {
    return NextResponse.json({ error: `${e}` }, { status: 400 });
  }
  try {
    const labs = await searchLab({ query, searchScope });
    return NextResponse.json({ ok: true, labs }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

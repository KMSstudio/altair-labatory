// @/app/api/labatory/search/route.ts

import { NextResponse } from "next/server";
import { parseEnumValue } from "@/app/api/_util/parse";
import { LabSearchScope, searchLab } from "@/repository/db/labatory/labatory";

type Params = {
  query: string;
  searchScope: string;
};

/**
 * Get labatorys that match the searchScope and query of request.
 *
 * @param request - HTTP request containing URL. URL contains searchScope and query.
 * @param  query - The search keyword. Matches are performed using partial string matching.
 * @param searchScope - Defines the scope of the search:
 * - "LAB": Returns labs whose Korean or English names contain the query.
 * - "SUBJ": Returns labs whose associated subjects' Korean or English names contain the query.
 * - "UNIV": Returns labs whose associated universities' Korean or English names contain the query.
 * - "ALL": Returns labs matching any of the above conditions.
 * @returns
 * - `200` `{ ok: true, labs }` on success
 * - `400` for invaild query or searchScope
 * - `500` for internal server errors
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params: Params = {
    query: searchParams.get("query") ?? "",
    searchScope: searchParams.get("searchScope") ?? "",
  };
  const query = params.query.trim();
  if (!query || !params.searchScope)
    return NextResponse.json({ error: "Query and search scope are required." }, { status: 400 });

  let searchScope: LabSearchScope;
  try {
    searchScope = parseEnumValue(LabSearchScope, params.searchScope, "lab search scope");
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

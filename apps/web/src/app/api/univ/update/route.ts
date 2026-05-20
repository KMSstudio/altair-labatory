// @/app/api/univ/update/route.ts

import { NextResponse } from "next/server";
import { Prisma } from "@labatory/db";

import {
  getUniversityCore,
  getUniversityLists,
  updateUniversityCore,
} from "@/repository/db/labatory/university";
import { parseBigInt } from "../../_util/parse";

type Body = {
  universityId: string;
  nameKo: string;
  nameEn: string;
  country: string;
  websiteUrl: string;
  domain: string;
};

/**
 * Handle university update requests.
 *
 * This API endpoint performs all **server-side validation** before
 * delegating the actual database write operation to `updateUniversityCore`.
 *
 * Validation performed here includes:
 * - Request body validation
 * - university existence check
 *
 * @param request - Incoming HTTP request containing a JSON body.
 *
 * @returns
 * - `200` with `{ ok: true, universityId }` if update succeeds
 * - `400` for validation errors
 * - `500` for internal or database errors
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const nameKo = body.nameKo ?? "";
  const nameEn = body.nameEn ?? "";
  const country = body.country ?? "";
  const websiteUrl = body.websiteUrl ?? "";
  const domain = body.domain ?? "";

  if (!nameKo.trim()) return NextResponse.json({ error: "nameKo is required." }, { status: 400 });

  let universityId: bigint;
  try {
    universityId = parseBigInt(body.universityId, "university id");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid parameter.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Load minimal university info for ownership check
  const university = await getUniversityCore({ universityId });
  if (!university)
    return NextResponse.json({ error: "University does not exist." }, { status: 400 });

  const where = {
    id: { not: universityId },
    OR: [{ nameKo }],
  };
  const dup = await getUniversityLists({ where });

  if (dup[0]?.nameKo == nameKo) {
    return NextResponse.json({ error: "Duplicate Korean name is not allowed" }, { status: 400 });
  }

  try {
    const updateUniversity = await updateUniversityCore({
      universityId,
      input: { nameKo, nameEn, country, websiteUrl, domain },
    });
    if (!updateUniversity) throw new Error();
    return NextResponse.json({ ok: true, university: updateUniversity }, { status: 200 });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal database error." }, { status: 500 });
  }
}

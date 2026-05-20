// @/app/api/univ/create/route.ts

import { NextResponse } from "next/server";
import { Prisma } from "@labatory/db";

import { createUniversityCore, getUniversityLists } from "@/repository/db/labatory/university";

type Body = {
  nameKo: string;
  nameEn: string;
  country: string;
  websiteUrl: string;
  domain: string;
};

/**
 * Handle university create requests.
 *
 * This API endpoint performs all **server-side validation** before
 * delegating the actual database write operation to `createUniversityCore`.
 *
 * Validation performed here includes:
 * - Request body validation
 * - university existence check
 *
 * @param request - Incoming HTTP request containing a JSON body.
 *
 * @returns
 * - `200` with `{ ok: true, universityId }` if create succeeds
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

  const where = {
    isDeleted: false,
    OR: [{ nameKo }],
  };
  const dup = await getUniversityLists({ where });

  if (dup[0]?.nameKo == nameKo) {
    return NextResponse.json({ error: "Duplicate Korean name is not allowed" }, { status: 400 });
  }
  try {
    const university = await createUniversityCore({
      input: { nameKo, nameEn, country, websiteUrl, domain },
    });
    if (!university) throw new Error();
    return NextResponse.json({ ok: true, university }, { status: 200 });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal database error." }, { status: 500 });
  }
}

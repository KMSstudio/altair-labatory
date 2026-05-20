// @/app/api/labaratory/subject/create/route.ts
import { NextResponse } from "next/server";
import { Prisma } from "@labatory/db";
import { getSubjects, createSubjectCore } from "@/repository/db/labatory/subject";

type Body = {
  nameKo: string;
  nameEn: string;
  description: string | null;
};

/**
 * Handle subject create requests.
 *
 * This API endpoint performs all **server-side validation** before
 * delegating the actual database write operation to `createsubjectCore`.
 *
 * Validation performed here includes:
 * - Request body validation
 * - subject existence check
 *
 * @param request - Incoming HTTP request containing a JSON body.
 *
 * @returns
 * - `200` with `{ ok: true, subjectId }` if create succeeds
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
  const description = body.description ?? "";

  if (!nameKo.trim()) return NextResponse.json({ error: "nameKo is required." }, { status: 400 });

  if (!nameEn.trim()) return NextResponse.json({ error: "nameEn is required." }, { status: 400 });

  const where = {
    isDeleted: false,
    OR: [{ nameKo }, { nameEn }],
  };
  const dup = await getSubjects({ where });

  if (dup[0]?.nameKo == nameKo) {
    return NextResponse.json({ error: "Duplicate Korean name is not allowed" }, { status: 400 });
  }
  if (dup[0]?.nameEn == nameEn)
    return NextResponse.json({ error: "Duplicate English name is not allowed" }, { status: 400 });

  try {
    const subject = await createSubjectCore({
      input: { nameKo, nameEn, description },
    });
    if (!subject) throw new Error();
    return NextResponse.json({ ok: true, subject }, { status: 200 });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal database error." }, { status: 500 });
  }
}

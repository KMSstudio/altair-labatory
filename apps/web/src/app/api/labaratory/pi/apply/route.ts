// @/app/api/labaratory/pi/apply/route.ts

import { NextResponse } from "next/server";
import { Prisma } from "@labatory/db";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import {
  createPiApplication,
  getPiApplicationLists,
} from "@/repository/db/labatory/pi-application";
import { parseBigInt } from "@/app/api/_util/parse";
import { isValidUrl } from "@/util/util";

type Body = {
  requestedName: string;
  labId: string | null;
  scholarUrl: string;
  note: string | null;
};

/**
 * Handle article update requests.
 *
 * This API endpoint performs all **server-side validation** before
 * delegating the actual database write operation to `UpdateArticleCore`.
 *
 * Validation performed here includes:
 * - Request body validation
 * - Article existence check
 * - Authentication and client IP extraction via `buildCreateArticleCtx`
 * - Author ownership check (only author can update)
 * - Tag ID parsing
 *
 * @param request - Incoming HTTP request containing a JSON body.
 *
 * @returns
 * - `200` with `{ ok: true, articleId }` if update succeeds
 * - `400` for validation errors
 * - `401` if the user is not authenticated
 * - `403` if the user is not the author
 * - `500` for internal or database errors
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "User must be logged in." }, { status: 401 });
  }

  let userId;
  try {
    userId = parseBigInt(session.user.id, "user id");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid parameter.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const schoolEmail = session.user.primaryEmail ?? "";
  if (!schoolEmail.trim())
    return NextResponse.json({ error: "Invalid session school email" }, { status: 400 });

  const requestedName = body.requestedName ?? "";
  const scholarUrl = body.scholarUrl ?? "";
  const note = body.note ?? "";

  if (!requestedName.trim())
    return NextResponse.json({ error: "Requested name is required." }, { status: 400 });
  if (!scholarUrl.trim())
    return NextResponse.json({ error: "Scholar url are required." }, { status: 400 });
  if (!isValidUrl(scholarUrl)) {
    return NextResponse.json({ error: "invalid scholarUrl" }, { status: 400 });
  }

  let labId: bigint | null = null;
  if (body.labId != null) {
    try {
      labId = BigInt(body.labId);
    } catch {
      labId = null;
    }
  }

  const existingPending = await getPiApplicationLists({
    where: { userId, status: "PENDING" },
  });
  if (existingPending[0]) {
    return NextResponse.json(
      { error: "A pending PI application already exists." },
      { status: 400 },
    );
  }

  try {
    const piApplication = await createPiApplication({
      userId,
      input: { requestedName, labId, schoolEmail, scholarUrl, note },
    });

    return NextResponse.json({ ok: true, piApplication }, { status: 200 });
  } catch (e) {
    console.log(e);
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal database error." }, { status: 500 });
  }
}

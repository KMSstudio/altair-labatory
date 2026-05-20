// @/app/api/univ/update/route.ts

import { NextResponse } from "next/server";
import { Prisma } from "@labatory/db";

import { getPiCore, updatePiCore } from "@/repository/db/labatory/pi";
import { parseBigInt } from "../../../_util/parse";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Body = {
  piId: string;
  name: string;
  email: string;
  scholarUrl: string;
  labId?: string | null;
  userId?: string | null;
};

/**
 * Handle PI application creation requests.
 *
 * This API endpoint performs all **server-side validation** before
 * delegating the actual database write operation to `createPiApplication`.
 *
 * Validation performed here includes:
 * - Request body JSON parsing
 * - Authentication check via `getServerSession`
 * - User ID parsing (BigInt)
 * - School email extraction from session
 * - Required field checks (`requestedName`, `scholarUrl`)
 * - URL format validation for `scholarUrl`
 * - Optional `labId` parsing (invalid values fall back to `null`)
 * - Duplicate pending application check (only one PENDING application
 *   per user is allowed)
 *
 * @param request - Incoming HTTP request containing a JSON body with
 *   `requestedName`, `scholarUrl`, optional `note`, and optional `labId`.
 *
 * @returns
 * - `200` with `{ ok: true, piApplication }` if creation succeeds
 * - `400` for validation errors (invalid JSON, missing fields, invalid
 *   URL, invalid user id, missing school email, or an existing pending
 *   application)
 * - `401` if the user is not authenticated
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

  const name = body.name ?? "";
  const email = body.email ?? "";
  const scholarUrl = body.scholarUrl ?? "";

  if (!name.trim()) return NextResponse.json({ error: "name is required." }, { status: 400 });
  if (!email.trim()) return NextResponse.json({ error: "email is required." }, { status: 400 });
  if (!scholarUrl.trim())
    return NextResponse.json({ error: "scholarUrl is required." }, { status: 400 });

  let piId: bigint;
  try {
    piId = parseBigInt(body.piId, "pi id");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid parameter.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  let labId: bigint | null = null;
  if (body.labId) {
    try {
      labId = BigInt(body.labId);
    } catch {
      // labId is null
    }
  }

  let userId: bigint | null = null;
  if (body.userId) {
    try {
      userId = BigInt(body.userId);
    } catch {
      // userId is null
    }
  }

  // Load minimal pi info for ownership check
  const pi = await getPiCore({ piId });
  if (!pi) return NextResponse.json({ error: "pi does not exist." }, { status: 400 });

  // if (pi.userId != session.user.id)
  //   return NextResponse.json({ error: "Authenticated user does not match the PI." }, { status: 400 });

  try {
    const updatepi = await updatePiCore({
      piId,
      input: { name, email, scholarUrl, labId, userId },
    });
    if (!updatepi) throw new Error();
    return NextResponse.json({ ok: true, pi: updatepi }, { status: 200 });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal database error." }, { status: 500 });
  }
}

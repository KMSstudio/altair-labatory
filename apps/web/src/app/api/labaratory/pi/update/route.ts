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
 * Handle PI (Principal Investigator) update requests.
 *
 * This API endpoint performs all **server-side validation and authorization**
 * before delegating the actual database write operation to `updatePiCore`.
 *
 * Validation performed here includes:
 * - Request body JSON parsing
 * - Authentication check via `getServerSession`
 * - Required field checks (`name`, `email`, `scholarUrl`)
 * - `piId` parsing (BigInt) via `parseBigInt`
 * - Optional `labId` and `userId` parsing (BigInt)
 * - PI existence check via `getPiCore`
 * - Ownership verification (the authenticated user must own the target PI)
 *
 * @param request - Incoming HTTP request containing a JSON body with
 *   `name`, `email`, `scholarUrl`, `piId`, and optional `labId` and `userId`.
 *
 * @returns
 * - `200` with `{ ok: true, pi }` if the update succeeds
 * - `400` for validation errors (invalid JSON, missing required fields,
 *   invalid `piId`/`labId`/`userId`, or non-existent PI)
 * - `401` if the user is not authenticated
 * - `403` if the authenticated user does not match the PI owner
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
      return NextResponse.json({ error: "Invalid session lab id." }, { status: 400 });
    }
  }

  let userId: bigint | null = null;
  if (body.userId) {
    try {
      userId = BigInt(body.userId);
    } catch {
      return NextResponse.json({ error: "Invalid session user id." }, { status: 400 });
    }
  }

  // Load minimal pi info for ownership check
  const pi = await getPiCore({ piId });
  if (!pi) return NextResponse.json({ error: "pi does not exist." }, { status: 400 });

  if (pi.userId != session.user.id)
    return NextResponse.json(
      { error: "Authenticated user does not match the PI." },
      { status: 403 },
    );

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

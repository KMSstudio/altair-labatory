// @/app/api/labaratory/pi/delete/route.ts

import { NextResponse } from "next/server";

import { deletePiCore, getPiCore } from "@/repository/db/labatory/pi";
import { parseBigInt } from "@/app/api/_util/parse";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Body = {
  piId: string;
};

/**
 * Delete a pi
 *
 * This endpoint deletes pi
 *
 * Validation steps:
 * 1. Parse request body
 * 2. Convert ids to bigint
 * 3. Execute deletion
 *
 * @param request - HTTP request containing `{ piId }`
 *
 * @returns
 * - `200` `{ ok: true, piId }` on success
 * - `400` invalid parameters
 * - `500` internal server error
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

  let piId: bigint;
  try {
    piId = parseBigInt(body.piId, "pi id");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid parameter.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const pi = await getPiCore({ piId });
  if (!pi) return NextResponse.json({ error: "Pi does not exist." }, { status: 400 });

  if (pi.userId != session.user.id)
    return NextResponse.json(
      { error: "Authenticated user does not match the PI." },
      { status: 400 },
    );

  try {
    await deletePiCore({ piId });
    return NextResponse.json({ ok: true, piId: piId.toString() }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

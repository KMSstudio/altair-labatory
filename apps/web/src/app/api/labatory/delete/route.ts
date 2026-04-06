// @/app/api/labatory/delete/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { Prisma } from "@labatory/db";
import { authOptions } from "@/lib/auth";

import { assertLabPiOrAdmin, mapPermissionError } from "@/app/api/_util/assertPermission";
import { parseBigInt } from "@/app/api/_util/parse";
import { deleteLab } from "@/repository/db/labatory/labatory";

type Body = {
  labId: string;
};

/**
 * Delete a labatory (soft-delete).
 *
 * This endpoint deletes a labatory if user is a PI who is linked to the labatory
 * or an ADMIN user.
 *
 * Validation steps:
 * 1. Parse request body
 * 2. Validate session
 * 3. Convert ids to bigint
 * 4. Verify permission
 * 5. Execute deletion
 *
 * @param request - Incoming HTTP request containing a JSON body.
 *
 * @returns
 * - `200` `{ ok: true, lab }` on success
 * - `400` invalid parameters
 * - `401` user not logged in
 * - `403` permission denied
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
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let labId: bigint;
  let userId: bigint;
  try {
    labId = parseBigInt(body.labId, "lab id");
    userId = parseBigInt(session.user.id, "user id");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid parameter.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    await assertLabPiOrAdmin(labId, userId, session.user.role);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal server error.";
    const { error, status } = mapPermissionError(msg);
    return NextResponse.json({ error }, { status });
  }

  try {
    const deletedLab = await deleteLab({ labId });
    return NextResponse.json({ ok: true, lab: deletedLab }, { status: 200 });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
    if (e.code === "P2003")
      return NextResponse.json({ error: "Invalid reference." }, { status: 400 });
    return NextResponse.json({ error: "Internal database error." }, { status: 500 });
  }
}

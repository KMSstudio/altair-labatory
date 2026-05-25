// @/app/api/labaratory/pi/decide/route.ts

import { parseBigInt } from "@/app/api/_util/parse";
import { authOptions } from "@/lib/auth";
import { createPiCore } from "@/repository/db/labatory/pi";
import {
  changePiApplicationStatus,
  getPiApplication,
} from "@/repository/db/labatory/pi-application";
import { prisma, Prisma } from "@labatory/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type Body = {
  piApplicationId: string;
  newStatus: string;
};

/**
 * Handle PI application decision requests (approve or reject).
 *
 * Performs all **server-side validation** before delegating the database
 * write to `changePiApplicationStatus` (and `createPiCore` on approval),
 * both wrapped in a single transaction to keep state consistent.
 *
 * Validation performed here includes:
 * - Request body JSON parsing
 * - Authentication check via `getServerSession`
 * - Authorization check (only `ADMIN` users may decide a PI application)
 * - User ID and PI application ID parsing (BigInt)
 * - Application existence check
 * - Application status precondition check (must still be `PENDING`)
 * - `newStatus` value validation (must be `"APPROVED"` or `"REJECTED"`)
 *
 * On approval, a new PI record is created from the application's
 * captured data; on rejection, only the application status is updated.
 *
 * @param request - Incoming HTTP request containing a JSON body with
 *   `piApplicationId` and `newStatus`.
 *
 * @returns
 * - `200` with `{ ok: true, piApplication, pi }` if the decision is
 *   applied successfully (`pi` is `null` for rejections)
 * - `400` for validation errors
 * - `401` if the user is not authenticated
 * - `403` if the user lacks the `ADMIN` role
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
  if (!session?.user?.id)
    return NextResponse.json({ error: "Decider must be logged in." }, { status: 401 });

  if (session.user.role != "ADMIN")
    return NextResponse.json({ error: "Admin role required to decide the PI." }, { status: 403 });

  let piApplicationId;
  try {
    piApplicationId = parseBigInt(body.piApplicationId, "application id");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid parameter.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const application = await getPiApplication({ piApplicationId });
  if (!application)
    return NextResponse.json({ error: "Pi application does not exist" }, { status: 400 });

  if (application.status == "APPROVED")
    return NextResponse.json({ error: "Pi application already approved" }, { status: 400 });
  if (application.status == "REJECTED")
    return NextResponse.json({ error: "Pi application already rejected" }, { status: 400 });

  const newStatus = body.newStatus ?? "";
  if (!newStatus || (newStatus != "APPROVED" && newStatus != "REJECTED"))
    return NextResponse.json({ error: "Invalid new status" }, { status: 400 });

  let labId: bigint | null = null;
  if (application.labId != null) {
    try {
      labId = BigInt(application.labId);
    } catch {
      labId = null;
    }
  }

  const input = {
    name: application.requestedName,
    email: application.schoolEmail,
    scholarUrl: application.scholarUrl,
    labId: labId,
    userId: BigInt(application.userId),
  };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const piApplication = await changePiApplicationStatus({ piApplicationId, newStatus, db: tx });
      const pi = newStatus === "APPROVED" ? await createPiCore({ input, db: tx }) : null;
      return { piApplication, pi };
    });
    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal database error." }, { status: 500 });
  }
}

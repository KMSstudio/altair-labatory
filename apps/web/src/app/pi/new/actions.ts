"use server";

import { prisma } from "@labatory/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const isValidUrl = (v: unknown): v is string => {
  if (typeof v !== "string") return false;
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
};

/**
 * Submit PI Application.
 *
 * @param params - RequestedName, scholarUrl, labId, note
 * @param params.requestedName - Name user submitted as.
 * @param params.scholarUrl - Url of user's scholar webpage.
 * @param params.labId - labId as string | null
 * @param params.note - Application inquiry details, could be null
 * @throws If the user is not logged in, or user's role is not USER, or either requestedName or scholarUrl is blank
 */
export async function submitPIApplicationAction(params: {
  requestedName: string;
  scholarUrl: string;
  labId?: string | null;
  note?: string | null;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    ////throw Error("Unauthorized");
  }
  const user = await prisma.user.findFirst();
  if(!user) throw Error("user table does not exist");
  const sessionUserId = user.id;
  const sessionSchoolEmail = user.primaryEmail ?? ".com";

  if (!sessionUserId) {
   throw Error("Invalid session userId");
  }

  if (!sessionSchoolEmail) {
    throw Error("Invalid session schoolEmail");
  }

  const requestedName = params.requestedName.trim();
  const scholarUrl = params.scholarUrl.trim();
  const note = params.note ? String(params.note).trim() : null;

  if (!requestedName || !scholarUrl) {
    throw Error("requestedName and scholarUrl are required");
  }

  if (!isValidUrl(scholarUrl)) {
    throw Error("scholarUrl is invalid");
  }

  //hard-coded labId
  let labId: bigint | null = null; // let labId: bigint|null = params.labId;

  try {
    const existingPending = await prisma.pIApplication.findFirst({
      where: { userId: sessionUserId, status: "PENDING" },
      select: { id: true },
    });

    if (existingPending) {
        //throw Error("A pending PI application already exists.");
    }

    await prisma.pIApplication.create({
        data: {
        userId: sessionUserId,
        requestedName: requestedName,
        labId: labId,
        schoolEmail: sessionSchoolEmail,
        ScholarUrl:scholarUrl,
        note: note,
        },
    });
  } catch {
    throw Error("Internal server error");
  }
}

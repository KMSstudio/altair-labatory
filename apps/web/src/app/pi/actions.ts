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
  labId: bigint | null;
  note?: string | null;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw Error("Unauthorized");
  }
  const sessionUserId = BigInt(session.user.id);
  const sessionSchoolEmail = session.user.primaryEmail;

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

  let labId: bigint | null = null;

  if (params.labId) {
    labId = params.labId;
  }

  const existingPending = await prisma.pIApplication.findFirst({
    where: { userId: sessionUserId, status: "PENDING" },
    select: { id: true },
  });
  if (existingPending) {
    throw Error("A pending PI application already exists.");
  }
  try {
    await prisma.pIApplication.create({
      data: {
        userId: sessionUserId,
        requestedName: requestedName,
        labId: labId,
        schoolEmail: sessionSchoolEmail,
        ScholarUrl: scholarUrl,
        note: note,
      },
    });
  } catch (e) {
    if (e instanceof Error) throw Error(e.message ?? "Internal server error");
    else throw Error("Unknown error");
  }
}

export async function FindLabs(params: { labNameEn: string }) {
  params = await params;
  const labNameEn = params.labNameEn ?? "";
  if (!labNameEn) throw Error("Lab name required");
  try {
    return await prisma.lab.findMany({
      where: {
        nameEn: {
          contains: labNameEn.trim(),
          mode: "insensitive",
        },
      },
      orderBy: { nameEn: "asc" },
    });
  } catch {
    throw Error("Internal server error");
  }
}
/**
 * Update PI info.
 *
 * @var piId - Id of pi whose infomation will be changed
 * @param params - name, email, labId, scholarUrl
 * @param params.name - Name user submitted as.
 * @param params.email - Email of user
 * @param params.scholarUrl - Url of user's scholar webpage.
 * @param params.labId - labId as string | null
 * @throws If name or email is empty, piId is not provided, or invalid
 */
export async function UpdatePI(
  piId: bigint,
  params: {
    name: string;
    email: string;
    labId?: bigint | null;
    scholarUrl?: string;
  },
) {
  const email = params.email;
  const name = params.name;
  const scholarUrl = params.scholarUrl;

  let labId: bigint | null = null;
  if (params.labId) {
    labId = params.labId;
  }
  if (!piId) throw Error("Invaild function call.");

  if (!email || !name) {
    throw Error("email and name are required.");
  }

  try {
    await prisma.pI.update({
      where: { id: piId },
      data: {
        name,
        email,
        labId,
        scholarUrl,
      },
    });
  } catch {
    throw Error("PI info update Fail.");
  }

  return true;
}

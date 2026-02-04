"use server";

import { Prisma, prisma } from "@labatory/db";
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

const PISelect = {
  id: true,
  userId: true,
  name: true,
  email: true,
  scholarUrl: true,
  createdAt: true,
  labId: true,
};
const LabSelect = {
  id: true,
  nameEn: true,
  nameKo: true,
  websiteUrl: true,
  description: true,
};

export async function GetPI(PIId: bigint) {
  return prisma.pI.findUnique({
    where: { id: PIId },
    select: PISelect,
  });
}

export async function GetLab(LabId: bigint) {
  return prisma.lab.findUnique({
    where: { id: LabId },
    select: LabSelect,
  });
}

export type GetPIResult = NonNullable<Awaited<ReturnType<typeof GetPI>>>;
export type GetLabResult = NonNullable<Awaited<ReturnType<typeof GetLab>>>;

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

/**
 * Searches for labs using the provided query.
 * Searches by Korean and English names by default, or by URL if the query starts with "http://" or "https://".
 *
 * @param params.query - The provided search query.
 * @returns Search result; ordered By english name.
 * @throws If internal server error
 */
export async function SearchLabs(query: string) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    throw Error("query is required");
  }

  const prismaQuery = (value: string) =>
    ({ contains: value, mode: Prisma.QueryMode.insensitive }) as const;
  const where: Prisma.LabWhereInput = {};
  if (/^https?:\/\//i.test(query)) {
    where.websiteUrl = prismaQuery(trimmedQuery);
  } else {
    where.OR = [{ nameEn: prismaQuery(query) }, { nameKo: prismaQuery(query) }];
  }

  try {
    return await prisma.lab.findMany({
      where,
      orderBy: { nameEn: "asc" },
      select: LabSelect,
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

"use server";

import { prisma } from "@labatory/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const isValidUrl = (v: unknown): v is string => {
  if (typeof v !== "string") return false;
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
};

const toBigIntFromString = (v: String): bigint | null => {
  if (typeof v === "string" && /^[0-9]+$/.test(v)) return BigInt(v);
  return null;
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
    //throw Error("Unauthorized");
  }

  const sessionUserId = BigInt("123");
  const sessionSchoolEmail = "1";

  if (!sessionUserId) {
    //throw Error("Invalid session userId");
  }

  if (!sessionSchoolEmail) {
    //throw Error("Invalid session schoolEmail");
  }

  const requestedName = params.requestedName.trim();
  const scholarUrl = params.scholarUrl.trim();
  const note = params.note ? String(params.note).trim() : null;

  if (!requestedName || !scholarUrl) {
    //throw Error("requestedName and scholarUrl are required");
  }

  if (!isValidUrl(scholarUrl)) {
    //throw Error("scholarUrl is invalid");
  }

  //hard-coded labId
  let labId: bigint | null = null; // let labId: bigint|null = params.labId;

  try {
    

    const chec = await prisma.pIApplication.create({
    data: {
      userId: sessionUserId,
      requestedName: "Minseo Kim",
      labId: BigInt("1"),
      schoolEmail: "minseo.kim@school.test",
      ScholarUrl: "https://scholar.google.com/citations?user=minseo",
      note: "Looking to register the lab for recruitment.",
      decidedBy: BigInt("1"),
      decidedAt: new Date(),
    },
  });
    console.log("Seed completed", {chec:chec.id,

  });
    revalidatePath("/");
  } catch {
    throw Error("Internal server error");
  }
}

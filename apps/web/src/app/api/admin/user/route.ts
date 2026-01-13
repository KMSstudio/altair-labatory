import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@labatory/db";

type SearchField = "name" | "email" | "all";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("search") ?? "").trim();
const fieldRaw = (searchParams.get("field") ?? "name").trim();
  const field: SearchField =
    fieldRaw === "email" || fieldRaw === "all" ? (fieldRaw as SearchField) : "name";

  const where =
    q.length === 0
      ? undefined // select all if q is empty
      : field === "name"
        ? { displayName: { contains: q, mode: "insensitive" as const } }
        : field === "email"
          ? { primaryEmail: { contains: q, mode: "insensitive" as const } }
          : {
              OR: [
                { displayName: { contains: q, mode: "insensitive" as const } },
                { primaryEmail: { contains: q, mode: "insensitive" as const } },
              ],
            };
  const users = await prisma.user.findMany({
    where: where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      displayName: true,
      role: true,
      primaryEmail: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    users: users.map((u) => ({
      where:where,
      id: u.id.toString(),               // BigInt -> string
      displayName: u.displayName,
      role: u.role,
      primaryEmail: u.primaryEmail,
      createdAt: u.createdAt.toISOString(), // Date -> string
    })),
  });
}


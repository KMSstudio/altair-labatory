import { NextRequest, NextResponse } from "next/server";
import { prisma,Prisma } from "@labatory/db"

const normalizeField = (raw: string): string=> (raw === "email" || raw === "all" ? raw : "name");
const containsInsensitive = (q: string) => ({ contains: q, mode: "insensitive" as const });
const buildWhere = (q: string, f: string): Prisma.UserWhereInput | undefined => {
  const field = normalizeField(f);
  if (!q) return undefined;
  if (field === "name") return { displayName: containsInsensitive(q) };
  if (field === "email") return { primaryEmail: containsInsensitive(q) };
  return { OR: [{ displayName: containsInsensitive(q) }, { primaryEmail: containsInsensitive(q) }] };
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("search") ?? "").trim();
  const field = (searchParams.get("field") ?? "name").trim();

  const users = await prisma.user.findMany({
    where: buildWhere(q, field),
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id.toString(),               
      displayName: u.displayName,
      role: u.role,
      primaryEmail: u.primaryEmail,
      createdAt: u.createdAt.toISOString(),
    })),
  });
}


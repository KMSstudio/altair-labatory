import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@labatory/db";

type SearchField = "이름" | "이메일" | "전부";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("search") ?? "").trim();
const fieldRaw = (searchParams.get("field") ?? "이름").trim();
  const field: SearchField =
    fieldRaw === "이메일" || fieldRaw === "전부" ? (fieldRaw as SearchField) : "이름";
  const users = await prisma.user.findMany({
    where: q
      ? {
          displayName: {
            contains: q,
            mode: "insensitive",
          },
        }
      : undefined, // q가 없으면 전체
    orderBy: { createdAt: "desc" },
    // 전체가 너무 많아질 수 있으니 운영에서는 페이지네이션/limit 권장
    // 요구사항대로 "모두"면 take 제거하거나 충분히 큰 값 사용
    select: {
      id: true,
      displayName: true,
      role: true,
      primaryEmail: true,
      createdAt: true,
    },
  });

  const where =
    q.length === 0
      ? undefined // q가 비면 전체 유저
      : field === "이름"
        ? { displayName: { contains: q, mode: "insensitive" as const } }
        : field === "이메일"
          ? { primaryEmail: { contains: q, mode: "insensitive" as const } }
          : {
              OR: [
                { displayName: { contains: q, mode: "insensitive" as const } },
                { primaryEmail: { contains: q, mode: "insensitive" as const } },
              ],
            };

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id.toString(),               // BigInt -> string
      displayName: u.displayName,
      role: u.role,
      primaryEmail: u.primaryEmail,
      createdAt: u.createdAt.toISOString(), // Date -> string
    })),
  });
}


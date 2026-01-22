// @/app/api/auth/register/route.ts

import { NextResponse } from "next/server";
import { passwordHashing } from "@/lib/auth";
import { prisma } from "@labatory/db";
import { Prisma } from "@prisma/client";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export async function POST(request: Request) {
  let body: { email?: string; password?: string; displayName?: string };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const email = body.email ? normalizeEmail(body.email) : "";
  const password = body.password ?? "";
  const displayName = body.displayName ? body.displayName.trim() : "";

  if (!email || !password || !displayName)
    return NextResponse.json({ error: "Email, password, and display name are required." }, { status: 400 });

  if (password.length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

  try {
    const passwordHash = await passwordHashing(password);

    // $transaction: wraps the DB operations below into a single transaction (all-or-nothing). Used for observe ACID.
    await prisma.$transaction(async (tx) => {
      const anyCredSameEmail = await tx.userCredential.findFirst({ where: { email } });

      let userId: bigint;
      if (anyCredSameEmail) {
        userId = anyCredSameEmail.userId;
      } else {
        const user = await tx.user.create({ data: { displayName, primaryEmail: email } });
        userId = user.id;
      }

      await tx.userCredential.create({
        data: {
          userId,
          provider: "credentials",
          providerUserId: email,
          email,
          emailVerified: false,
          isPrimary: false,
          passwordHash: await passwordHash,
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return NextResponse.json({ error: "Email already in use." }, { status: 409 });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

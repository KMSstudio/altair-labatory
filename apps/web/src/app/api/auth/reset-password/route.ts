// @/app/api/auth/register/route.ts

import { NextResponse } from "next/server";
import { passwordHashing } from "@/lib/auth";
import { prisma } from "@labatory/db";
import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  let body: { password?: string; tokenHash?: string; email?: string };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const tokenHash = body.tokenHash ?? "";
  if (!tokenHash)
    return NextResponse.json({ error: "token is required." }, { status: 400 });

  const email = body.email ?? "";
  if (!email)
    return NextResponse.json({ error: "email is required." }, { status: 400 });

  const tokens = await prisma.verificationToken.findMany({
    where: {
      tokenHash: tokenHash,
    },
  })
  for (const token of tokens) {
    if (token.sendEmail !== email) continue;
    if (!token) {
      return NextResponse.json({ error: "token not found." }, { status: 404 });
    }
    const id = token.credentialId;
    if (!id)
      return NextResponse.json({ error: "invalid credential id." }, { status: 400 });

    const password = body.password ?? "";
    if (!password)
      return NextResponse.json({ error: "password is required." }, { status: 400 });
    if (password.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

    try {
      const passwordHash = await passwordHashing(password);

      await prisma.$transaction(async (tx) => {
        await tx.userCredential.update({
          where: { id },
          data: {
            passwordHash: await passwordHash,
          },
        });

        await tx.verificationToken.update({
          where: { id: token.id },
          data: {
            usedAt: new Date(Date.now())
          }
        });
      });

      return NextResponse.json({ ok: true });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
        return NextResponse.json({ error: "Email already in use." }, { status: 409 });
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "token not found." }, { status: 404 });
}

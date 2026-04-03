// @/app/api/auth/register/route.ts

import { NextResponse } from "next/server";
import { CreateUserSuite, passwordHashing } from "@/lib/auth";
import { prisma } from "@labatory/db";
import { Prisma } from "@prisma/client";
import { SendVerification } from "@/lib/mail";

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const IGNORE_EMAIL_VERIFY_string = process.env.IGNORE_EMAIL_VERIFY ?? "";
const IGNORE_EMAIL_VERIFY =
  IGNORE_EMAIL_VERIFY_string === "1" || IGNORE_EMAIL_VERIFY_string.toUpperCase() === "TRUE";

export async function POST(request: Request) {
  let body: { email?: string; password?: string; displayName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = body.email ? normalizeEmail(body.email) : "";
  const password = body.password ?? "";
  const displayName = body.displayName ? body.displayName.trim() : "";

  if (!email || !password || !displayName)
    return NextResponse.json(
      { error: "Email, password, and display name are required." },
      { status: 400 },
    );

  if (password.length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

  if (IGNORE_EMAIL_VERIFY) {
    try {
      const passwordHash = await passwordHashing(password);

      // $transaction: wraps the DB operations below into a single transaction (all-or-nothing). Used for observe ACID.
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const anyCredSameEmail = await tx.userCredential.findFirst({ where: { email } });

        let userId: bigint;
        if (anyCredSameEmail) {
          userId = anyCredSameEmail.userId;
        } else {
          const user = await CreateUserSuite(tx, displayName, email);
          userId = user.id;
        }

        await tx.userCredential.create({
          data: {
            userId,
            provider: "credentials",
            providerUserId: email,
            email,
            emailVerified: true,
            isPrimary: false,
            passwordHash: await passwordHash,
          },
        });
      });

      return NextResponse.json({ ok: true });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
        return NextResponse.json({ error: "Email already in use." }, { status: 409 });
      else return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
  } else {
    try {
      const SendSuccess = await SendVerification({
        stringVal: JSON.stringify({ displayName, email, password }),
        userEmail: email,
      });
      if (SendSuccess) {
        return NextResponse.json({ ok: true });
      } else {
        return NextResponse.json({ error: "Email send failed." }, { status: 502 });
      }
    } catch {
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
  }
}

// @/lib/auth.ts

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { hash, compare } from "bcryptjs";
import { prisma } from "@labatory/db";
import { Prisma } from "@prisma/client";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

async function loadUserTokenData(userId: bigint) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      displayName: true,
      role: true,
      primaryEmail: true,
      pi: { select: { id: true } },
    },
  });
  if (!user) return null;

  return {
    userId: user.id.toString(),
    displayName: user.displayName,
    role: user.role,
    primaryEmail: user.primaryEmail,
    piId: user.pi?.id ? user.pi.id.toString() : null,
  };
}

export const passwordHashing = (str: string): Promise<string> => hash(str, 10);

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email ? normalizeEmail(credentials.email) : "";
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        const credential = await prisma.userCredential.findUnique({
          where: { provider_providerUserId: { provider: "credentials", providerUserId: email } },
          include: { user: true },
        });
        if (!credential?.passwordHash) return null;

        const ok = await compare(password, credential.passwordHash);
        if (!ok) return null;

        return {
          id: credential.userId.toString(),
          name: credential.user.displayName,
          email: credential.user.primaryEmail ?? credential.email,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ account, profile }) {
      if (!account) return false;
      if (account.provider !== "google") return true;

      const providerUserId = account.providerAccountId || (profile as { sub?: string } | null)?.sub;
      if (!providerUserId) return false;

      // schema: UserCredential.email is required (String)
      const rawEmail = (profile as { email?: string } | null)?.email;
      const email = rawEmail ? normalizeEmail(rawEmail) : "";
      if (!email) return false;

      try {
        await prisma.$transaction(async (tx) => {
          const existing = await tx.userCredential.findUnique({
            where: { provider_providerUserId: { provider: "google", providerUserId } },
            select: { id: true },
          });
          if (existing) return;

          const match = await tx.userCredential.findFirst({
            where: { email },
            include: { user: true },
          });

          let userId: bigint;
          let userPrimaryEmail: string | null;

          if (match) {
            userId = match.user.id;
            userPrimaryEmail = match.user.primaryEmail;
          } else {
            const displayNameRaw = (profile as { name?: string } | null)?.name;
            const displayName =
              displayNameRaw && displayNameRaw.trim()
                ? displayNameRaw.trim()
                : email.split("@")[0] || "User";

            const created = await CreateUserSuite(tx, displayName, email);
            userId = created.id;
            userPrimaryEmail = created.primaryEmail;
          }

          // Create google credential
          await tx.userCredential.create({
            data: {
              userId,
              provider: "google",
              providerUserId,
              email,
              emailVerified: true,
              isPrimary: !userPrimaryEmail,
              passwordHash: null,
            },
          });

          // Fill a user.primaryEmail when is empty
          if (!userPrimaryEmail) {
            await tx.user.update({
              where: { id: userId },
              data: { primaryEmail: email },
            });
          }
        });

        return true;
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return true;
        return false;
      }
    },

    async jwt({ token, user, account }) {
      if (user?.id) {
        const data = await loadUserTokenData(BigInt(user.id));
        if (data) {
          token.userId = data.userId;
          token.displayName = data.displayName;
          token.role = data.role;
          token.primaryEmail = data.primaryEmail;
          token.piId = data.piId;
        }
        return token;
      }

      // google 로그인: providerAccountId(sub)로 userCredential을 찾아 userId를 얻음
      if (account?.provider === "google" && account.providerAccountId) {
        const providerUserId = account.providerAccountId;

        const credential = await prisma.userCredential.findUnique({
          where: { provider_providerUserId: { provider: "google", providerUserId } },
          select: { userId: true },
        });

        if (credential) {
          const data = await loadUserTokenData(credential.userId);
          if (data) {
            token.userId = data.userId;
            token.displayName = data.displayName;
            token.role = data.role;
            token.primaryEmail = data.primaryEmail;
            token.piId = data.piId;
          }
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
        session.user.displayName = (token.displayName as string) ?? session.user.name ?? "";
        session.user.role = (token.role as "USER" | "PI" | "ADMIN") ?? "USER";
        session.user.primaryEmail = (token.primaryEmail as string | null) ?? null;
        session.user.piId = (token.piId as string | null) ?? null;
      }
      return session;
    },
  },
};

async function LinkUserWithPIByEmail(tx: Prisma.TransactionClient, userId: bigint) {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: {
      primaryEmail: true,
    }
  });
  if (!user) {
    throw Error("Invaild user id.");
  }
  const userEmail = user.primaryEmail;
  if (!userEmail) {
    return false;
  }

  const piWithSameEmail = await tx.pI.findMany({
    where: {
      email: userEmail,
      user: null,
    },
    select: {
      id: true,
    }
  });
  if (piWithSameEmail.length == 0) return false;
  if (piWithSameEmail.length != 1) {
    throw Error("Multiple PI data detected.");
  }

  const pi = piWithSameEmail[0];

  await tx.pI.update({
    where: { id: pi.id },
    data: {
      userId,
    },
  });
  await tx.user.update({
    where: { id: userId },
    data: {
      pi: {
        connect: { id: pi.id },
      },
    },
  });

  return true;
}


export async function CreateUserSuite(
  tx: Prisma.TransactionClient,
  userName: string,
  userEmail: string | null,
) {
  const createdUser = await tx.user.create({
    data: { displayName: userName, primaryEmail: userEmail },
    select: { id: true, primaryEmail: true },
  });
  await LinkUserWithPIByEmail(tx, createdUser.id);

  return createdUser;
}

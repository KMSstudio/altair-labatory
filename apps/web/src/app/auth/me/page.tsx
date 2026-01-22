// @/app/auth/me/page.tsx

import { prisma } from "@labatory/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

async function getCurrentUser(userId: bigint) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      pi: true,
      credentials: {
        select: {
          id: true,
          provider: true,
          providerUserId: true,
          email: true,
          emailVerified: true,
          isPrimary: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}


export default async function Page(){

    const session = await getServerSession(authOptions);

    if(!session) redirect("/auth/login");

    const userId = BigInt(session.user.id);

    const user = await getCurrentUser(userId);
    if(!user) return <div>존재하지 않는 유저 세션입니다.</div>

    return (
        <main>
            <header>
            </header>

            <section>
                <div>
                    <strong>Name:</strong> <span>{user.displayName}</span>
                </div>
                <div>
                    <strong>Role:</strong> <span>{user.role}</span>
                </div>
                <div>
                    <strong>Primary Email:</strong>{" "}
                    <span>{user.primaryEmail ?? "No email"}</span>
                </div>
                <div>
                    <strong>Created:</strong>{" "}
                    <span>{user.createdAt.toDateString()}</span>
                </div>
                <div>
                    <strong>PI:</strong>{" "}
                    <span>{user.pi ? "Linked" : "Not linked"}</span>
                </div>
            </section>

            <section>
                <header>
                <h3>Credentials linked ({user.credentials.length})</h3>
                </header>

                {user.credentials.length === 0 ? (
                <p>No credentials linked.</p>
                ) : (
                <ul>
                    {user.credentials.map((cred) => (
                    <li key={cred.id.toString()}>
                        <p>
                            <strong>Provider:</strong> <span>{cred.provider}</span>
                            {cred.isPrimary ? " (Primary)" : ""}
                        </p>
                        <p>
                            <strong>Email:</strong> <span>{cred.email}</span>
                        </p>
                        <p>
                            <strong>Email verified:</strong>{" "}
                            <span>{cred.emailVerified ? "Yes" : "No"}</span>
                        </p>
                    </li>
                    ))}
                </ul>
                )}
            </section>

            <section>
                <header>
                    <h3>PI info</h3>
                </header>

                {!user.pi ? (
                    <p>Not PI user.</p>
                ) : (
                    <>
                    <div>
                        <strong>Name:</strong> <span>{user.pi.name}</span>
                    </div>
                    <div>
                        <strong>Email:</strong> <span>{user.pi.email}</span>
                    </div>
                    <div>
                        <strong>ScholarUrl:</strong> <span>{user.pi.scholarUrl}</span>
                    </div>
                    </>
                )} 
            </section>
        </main>
    )
}

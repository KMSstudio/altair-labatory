import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@labatory/db";
import Layout from "../../layout";

async function getUser(userId: bigint) {
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

export default async function UserDetailPage({ params }: {
  params: { user_id: string };
}) {
  params = await params;

  let id: bigint;
  try {
    id = BigInt(params.user_id);
  } catch {
    notFound();
  }

  const user = await getUser(id);
  if (!user) notFound();

  return (
    <Layout>
      <main>
        <header>
          <div>
            <p>/admin/users/{params.user_id}</p>
            <h1>{user.displayName}</h1>
            {user.primaryEmail && <p>{user.primaryEmail}</p>}
          </div>

          <div>
            <Link href="/admin/user">← Back to list</Link>
            {" "}|{" "}
            <Link href={`/admin/user/edit/${params.user_id}`}>Edit</Link>
          </div>
        </header>

        <section>
          <div>
            <strong>Role:</strong> {user.role}
          </div>
          <div>
            <strong>Primary Email:</strong>{" "}
            {user.primaryEmail ?? "No email"}
          </div>
          <div>
            <strong>ID:</strong> {user.id.toString()}
          </div>
          <div>
            <strong>Created:</strong>{" "}
            {user.createdAt.toISOString()}
          </div>
          <div>
            <strong>Updated:</strong>{" "}
            {user.updatedAt.toISOString()}
          </div>
          <div>
            <strong>PI:</strong>{" "}
            {user.pi ? "Linked" : "Not linked"}
          </div>
        </section>
        <section>
          <header>
            <h3>Credentials linked ({user.credentials.length})</h3>
          </header>

          {user.credentials.length === 0 ? (
            <p>No credentials linked to this user.</p>
          ) : (
            <ul>
              {user.credentials.map((cred) => (
                <li key={cred.id.toString()}>
                  <p>
                    <strong>ID:</strong> {cred.id.toString()}
                  </p>
                  <p>
                    <strong>Provider:</strong>{" "}
                    {cred.provider}
                    {cred.isPrimary ? " (Primary)" : ""}
                  </p>
                  <p>
                    <strong>Email:</strong> {cred.email}
                  </p>
                  <p>
                    <strong>Email verified:</strong>{" "}
                    {cred.emailVerified ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Provider user ID:</strong>{" "}
                    {cred.providerUserId}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {cred.createdAt.toISOString()}
                  </p>
                  <p>
                    <strong>Updated:</strong>{" "}
                    {cred.updatedAt.toISOString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </Layout>
  );
}

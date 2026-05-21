// @app/admin/pi/[pi_application_id]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@labatory/db";

async function getPIApplication(id: bigint) {
  return prisma.pIApplication.findUnique({
    where: { id: id },
    include: {
      user: true,
    },
  });
}

export default async function PIApplicationDetailPage({
  params,
}: {
  params: { pi_application_id: string };
}) {
  let id: bigint;
  params = await params;

  try {
    id = BigInt(params.pi_application_id);
  } catch {
    notFound();
  }

  const application = await getPIApplication(id);
  if (!application) notFound();

  return (
    <main>
      <header>
        <div>
          <p>/admin/pi/{params.pi_application_id}</p>
          <h1>{application.requestedName}</h1>
          <p>Status: {application.status}</p>
        </div>
        <div>
          <Link href="/admin/pi">← Back to list</Link>
          {" | "}
          <Link href={`/admin/user/${application.userId.toString()}`}>View User</Link>
        </div>
      </header>

      <section>
        <div>
          <strong>ID:</strong> {application.id.toString()}
        </div>
        <div>
          <strong>Requested Name:</strong> {application.requestedName}
        </div>
        <div>
          <strong>School Email:</strong> {application.schoolEmail}
        </div>
        <div>
          <strong>Scholar URL:</strong>{" "}
          <a href={application.scholarUrl} target="_blank" rel="noopener noreferrer">
            {application.scholarUrl}
          </a>
        </div>
        <div>
          <strong>Lab ID:</strong>{" "}
          {application.labId ? application.labId.toString() : "Not assigned"}
        </div>
        <div>
          <strong>Note:</strong> {application.note ?? "No note"}
        </div>
      </section>

      <section>
        <div>
          <strong>Status:</strong> {application.status}
        </div>
        <div>
          <strong>Decided By:</strong>{" "}
          {application.decidedBy ? application.decidedBy.toString() : "Not decided"}
        </div>
        <div>
          <strong>Decided At:</strong>{" "}
          {application.decidedAt ? application.decidedAt.toISOString() : "Not decided"}
        </div>
      </section>

      <section>
        <div>
          <strong>Created:</strong> {application.createdAt.toISOString()}
        </div>
        <div>
          <strong>Updated:</strong> {application.updatedAt.toISOString()}
        </div>
      </section>

      <section>
        <header>
          <h3>Applicant</h3>
        </header>
        <div>
          <strong>User ID:</strong> {application.user.id.toString()}
        </div>
        <div>
          <strong>Name:</strong> {application.user.displayName}
        </div>
        {application.user.primaryEmail && (
          <div>
            <strong>Email:</strong> {application.user.primaryEmail}
          </div>
        )}
      </section>
    </main>
  );
}

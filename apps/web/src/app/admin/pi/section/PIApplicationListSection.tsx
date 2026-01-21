// app/admin/pi/PIApplicationListSection.tsx

import Link from "next/link";
import { PIApplication } from "@labatory/db";

export function PIApplicationListItem({
  application,
}: {
  application: PIApplication & { user: { displayName: string } };
}) {
  return (
    <li>
      <div>
        <p>ID {application.id.toString()}</p>
        <h3>{application.requestedName}</h3>
        <p>Applicant: {application.user.displayName}</p>
        <p>School Email: {application.schoolEmail}</p>
        <p>Lab Id: {application.labId}</p>
        <p>Status: {application.status}</p>
        <p>Created at: {new Date(application.createdAt).toLocaleDateString()}</p>
      </div>
      <div>
        <Link href={`/admin/pi/${application.id}`}>View</Link>
      </div>
    </li>
  );
}

export function PIApplicationListSection({
  title,
  applications,
}: {
  title: string;
  applications: (PIApplication & {
    user: { displayName: string };
  })[];
}) {
  return (
    <section>
      <h2>{title}</h2>

      {applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <ul>
          {applications.map((application) => (
            <PIApplicationListItem key={application.id} application={application} />
          ))}
        </ul>
      )}
    </section>
  );
}

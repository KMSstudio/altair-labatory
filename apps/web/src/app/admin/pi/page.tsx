// app/admin/pi/page.tsx

import { PIApplicationStatus, prisma, type PIApplication } from "@labatory/db";
import { PIApplicationListSection } from "./section/PIApplicationListSection";

export default async function PIApplicationPage() {
  const applications: PIApplication[] = await prisma.pIApplication.findMany({
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const pendingApplications = applications.filter(
    (app) => app.status === PIApplicationStatus.PENDING,
  );

  const decidedApplications = applications.filter(
    (app) => app.status !== PIApplicationStatus.PENDING,
  );

  return (
    <main>
      <h1>PI Applications</h1>

      <PIApplicationListSection title="Pending Applications" applications={pendingApplications} />

      <PIApplicationListSection title="Decided Applications" applications={decidedApplications} />
    </main>
  );
}

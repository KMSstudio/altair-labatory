// app/admin/pi/page.tsx

import { PIApplicationStatus, prisma } from "@labatory/db";
import { PIApplicationListSection } from "./section/PIApplicationListSection";

export default async function PIApplicationPage() {
  const applications = await prisma.pIApplication.findMany({
    where: {
      status: {
        in: [
          PIApplicationStatus.PENDING,
          PIApplicationStatus.APPROVED,
        ],
      },
    },
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

      <PIApplicationListSection
        title="Pending Applications"
        applications={pendingApplications}
      />

      <PIApplicationListSection
        title="Decided Applications"
        applications={decidedApplications}
      />
    </main>
  );
}

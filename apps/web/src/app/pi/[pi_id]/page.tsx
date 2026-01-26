import { notFound } from "next/navigation";
import { prisma } from "@labatory/db";

async function GetPI(PIId: bigint) {
  return prisma.pI.findUnique({
    where: { id: PIId },
  });
}

async function GetLab(LabId: bigint) {
  return prisma.lab.findUnique({
    where: { id: LabId },
  });
}

export default async function PIDetailPage({ params }: { params: { pi_id: string } }) {
  params = await params;
  let id: bigint;
  try {
    id = BigInt(params.pi_id);
  } catch {
    notFound();
  }

  const pi = await GetPI(id);
  if (!pi) notFound();
  const lab = pi.labId ? await GetLab(pi.labId) : null;

  return (
    <main>
      <header></header>

      <section>
        <div>
          <h1>PI Info</h1>
        </div>
        <div>
          <strong>Name:</strong> <span>{pi.name}</span>
        </div>
        <div>
          <strong>Email:</strong> <span>{pi.email}</span>
        </div>

        <div>
          <strong>ScholarUrl:</strong> <span>{pi.scholarUrl ?? "Not assigned"}</span>
        </div>

        <div>
          <strong>createdAt:</strong> <span>{pi.createdAt.getTime()}</span>
        </div>
      </section>

      <section>
        <div>
          <h1>Linked Lab Info</h1>
        </div>
        {!lab ? (
          <div>
            <p>Lab not linked</p>
          </div>
        ) : (
          <>
            <div>
              <strong>Korean name:</strong> <span>{lab.nameKo}</span>
            </div>
            <div>
              <strong>English name:</strong> <span>{lab.nameEn}</span>
            </div>
            <div>
              <strong>Lab website Url:</strong> <span>{lab.websiteUrl}</span>
            </div>
            <div>
              <strong>discription:</strong> <span>{lab.description}</span>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

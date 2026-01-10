import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@labatory/db";

type UnivPageProps = {
  params: { univ_id: string };
};

async function getUniversity(univId: bigint) {
  return prisma.university.findUnique({
    where: { id: univId },
    include: {
      labs: {
        select: {
          id: true,
          nameKo: true,
          nameEn: true,
          websiteUrl: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export default async function UniversityDetailPage({ params }: UnivPageProps) {
  params = await params
  const id = BigInt(params.univ_id);
  const university = await getUniversity(id);

  if (!university) {
    notFound();
  }

  return (
    <main className="univ-shell">
      <header className="univ-header">
        <div>
          <p className="eyebrow">/univ/{params.univ_id}</p>
          <h1>{university.nameKo}</h1>
          {university.nameEn && <p className="muted">{university.nameEn}</p>}
        </div>
        <div className="actions">
          <Link className="ghost" href="/univ">
            ← Back to list
          </Link>
          <Link className="primary" href={`/univ/edit/${params.univ_id}`}>
            Edit
          </Link>
        </div>
      </header>

      <section className="panel grid">
        <div>
          <p className="eyebrow">Country</p>
          <p className="value">{university.country ?? "Unknown"}</p>
        </div>
        <div>
          <p className="eyebrow">Website</p>
          {university.websiteUrl ? (
            <a className="value" href={university.websiteUrl} target="_blank" rel="noreferrer">
              {university.websiteUrl}
            </a>
          ) : (
            <p className="value muted">No website</p>
          )}
        </div>
        <div>
          <p className="eyebrow">ID</p>
          <p className="value">{university.id.toString()}</p>
        </div>
        <div>
          <p className="eyebrow">Created</p>
          <p className="value">{university.createdAt.toISOString()}</p>
        </div>
      </section>

      <section className="panel">
        <header className="panel-head">
          <div>
            <p className="eyebrow">Labs linked</p>
            <h3>{university.labs.length} lab(s)</h3>
          </div>
        </header>
        {university.labs.length === 0 ? (
          <p className="muted">No labs have been associated with this university yet.</p>
        ) : (
          <ul className="lab-grid">
            {university.labs.map((lab) => (
              <li key={lab.id.toString()} className="card">
                <p className="eyebrow">Lab ID {lab.id.toString()}</p>
                <h4>{lab.nameKo}</h4>
                {lab.nameEn && <p className="muted">{lab.nameEn}</p>}
                <p className="muted">{lab.websiteUrl ?? "No website"}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

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

      <style jsx>{`
        .univ-shell {
          display: grid;
          gap: 1.5rem;
          padding: 2rem 0;
        }
        .univ-header {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: center;
          border-bottom: 1px solid #e0e4ea;
          padding-bottom: 1rem;
        }
        .panel {
          background: #fff;
          border: 1px solid #e0e4ea;
          border-radius: 12px;
          padding: 1.25rem;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .lab-grid {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        }
        .card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 0.9rem;
        }
        .panel-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }
        .eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 0.75rem;
          color: #5f6b7a;
          margin: 0;
        }
        .muted {
          color: #6b7280;
          margin: 0.15rem 0;
        }
        .value {
          font-weight: 700;
          color: #111827;
          margin: 0.15rem 0;
          word-break: break-word;
        }
        .actions {
          display: flex;
          gap: 0.75rem;
        }
        .primary {
          background: #111827;
          color: #fff;
          padding: 0.65rem 0.95rem;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 700;
        }
        .ghost {
          background: #f3f4f6;
          color: #374151;
          padding: 0.65rem 0.95rem;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 700;
        }
        a {
          color: #111827;
          font-weight: 600;
        }
        @media (max-width: 700px) {
          .univ-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .actions {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}

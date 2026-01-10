import Link from "next/link";
import { prisma } from "@labatory/db";
import { deleteUniversity } from "./actions";

async function getUniversities() {
  return prisma.university.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export default async function UniversityListPage() {
  const universities = await getUniversities();

  return (
    <main className="univ-shell">
      <header className="univ-header">
        <div>
          <p className="eyebrow">Universities CRUD sample</p>
          <h1>Universities</h1>
          <p className="lede">
            Minimal Prisma-powered flow showing how to create, read, update, and delete university
            rows from <code>@labatory/db</code>.
          </p>
        </div>
        <Link className="primary" href="/univ/new">
          + Add university
        </Link>
      </header>

      <section className="panel">
        {universities.length === 0 ? (
          <p className="muted">No universities yet. Add one to get started.</p>
        ) : (
          <ul className="univ-grid">
            {universities.map((univ) => (
              <li key={univ.id.toString()} className="card">
                <div className="card-head">
                  <div>
                    <p className="eyebrow">ID {univ.id.toString()}</p>
                    <h3>{univ.nameKo}</h3>
                    {univ.nameEn && <p className="muted">{univ.nameEn}</p>}
                  </div>
                  <div className="country-tag">{univ.country ?? "Unknown"}</div>
                </div>
                <p className="muted">{univ.websiteUrl ?? "No website"}</p>
                <div className="actions">
                  <Link href={`/univ/${univ.id.toString()}`}>View</Link>
                  <Link href={`/univ/edit/${univ.id.toString()}`}>Edit</Link>
                  <form action={deleteUniversity}>
                    <input type="hidden" name="id" value={univ.id.toString()} />
                    <button type="submit" className="ghost">
                      Delete
                    </button>
                  </form>
                </div>
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
        .univ-header h1 {
          margin: 0.1rem 0;
        }
        .panel {
          background: #f8fafc;
          border: 1px solid #e0e4ea;
          border-radius: 12px;
          padding: 1.5rem;
        }
        .eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 0.75rem;
          color: #5f6b7a;
          margin: 0;
        }
        .lede {
          color: #4a5563;
          max-width: 680px;
        }
        .muted {
          color: #6b7280;
          margin: 0.25rem 0 0;
        }
        .univ-grid {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        }
        .card {
          background: #fff;
          border: 1px solid #e0e4ea;
          border-radius: 10px;
          padding: 1rem;
          display: grid;
          gap: 0.5rem;
        }
        .card-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
        }
        .country-tag {
          background: #eef2ff;
          color: #4338ca;
          padding: 0.35rem 0.6rem;
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.85rem;
          min-width: 84px;
          text-align: center;
        }
        .actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          flex-wrap: wrap;
        }
        form {
          margin: 0;
        }
        a {
          color: #111827;
          font-weight: 600;
        }
        .primary {
          background: #111827;
          color: #fff;
          padding: 0.65rem 0.95rem;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 700;
        }
        .primary:hover {
          background: #0b1220;
        }
        button {
          border: none;
          background: #f97316;
          color: #fff;
          padding: 0.55rem 0.85rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
        }
        .ghost {
          background: #f3f4f6;
          color: #374151;
        }
        button:hover {
          opacity: 0.9;
        }
        code {
          background: #f3f4f6;
          padding: 0.15rem 0.35rem;
          border-radius: 6px;
        }
        @media (max-width: 700px) {
          .univ-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </main>
  );
}

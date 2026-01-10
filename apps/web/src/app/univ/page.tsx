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
    </main>
  );
}

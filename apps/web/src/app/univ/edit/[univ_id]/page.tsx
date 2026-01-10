import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@labatory/db";
import { updateUniversity, deleteUniversity } from "../../actions";

type EditPageProps = {
  params: { univ_id: string };
};

async function getUniversity(univId: bigint) {
  return prisma.university.findUnique({
    where: { id: univId },
  });
}

export default async function EditUniversityPage({ params }: EditPageProps) {
  const id = BigInt(params.univ_id);
  const university = await getUniversity(id);

  if (!university) {
    notFound();
  }

  return (
    <main className="univ-form-shell">
      <header className="form-head">
        <div>
          <p className="eyebrow">/univ/edit/{params.univ_id}</p>
          <h1>Edit university</h1>
          <p className="lede">
            Server action demo for updating and deleting a university through Prisma.
          </p>
        </div>
        <div className="actions">
          <Link href={`/univ/${params.univ_id}`} className="ghost">
            ← Back to detail
          </Link>
          <Link href="/univ" className="ghost">
            List
          </Link>
        </div>
      </header>

      <form action={updateUniversity} className="form">
        <input type="hidden" name="id" value={university.id.toString()} />
        <label>
          Korean name *
          <input name="nameKo" defaultValue={university.nameKo} required />
        </label>
        <label>
          English name
          <input name="nameEn" defaultValue={university.nameEn ?? ""} />
        </label>
        <label>
          Country
          <input name="country" defaultValue={university.country ?? ""} />
        </label>
        <label>
          Website URL
          <input name="websiteUrl" type="url" defaultValue={university.websiteUrl ?? ""} />
        </label>

        <div className="actions space">
          <button type="submit">Save changes</button>
        </div>
      </form>

      <form action={deleteUniversity} className="form danger-zone">
        <input type="hidden" name="id" value={university.id.toString()} />
        <div className="actions space">
          <button type="submit" className="danger">
            Delete university
          </button>
        </div>
      </form>

      <style jsx>{`
        .univ-form-shell {
          display: grid;
          gap: 1.5rem;
          padding: 2rem 0;
        }
        .form-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .form {
          display: grid;
          gap: 1rem;
          background: #fff;
          border: 1px solid #e0e4ea;
          border-radius: 12px;
          padding: 1.5rem;
        }
        label {
          display: grid;
          gap: 0.35rem;
          font-weight: 600;
        }
        input {
          padding: 0.7rem 0.8rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
        }
        input:focus {
          outline: 2px solid #111827;
          border-color: #111827;
        }
        .actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .space {
          justify-content: flex-end;
        }
        button {
          border: none;
          background: #111827;
          color: #fff;
          padding: 0.65rem 1rem;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
        }
        .danger {
          background: #b91c1c;
        }
        .danger-zone {
          border-color: #fecdd3;
          background: #fff1f2;
        }
        .ghost {
          background: #f3f4f6;
          color: #374151;
          padding: 0.65rem 1rem;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 700;
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
          max-width: 620px;
        }
        @media (max-width: 700px) {
          .form-head {
            flex-direction: column;
            align-items: flex-start;
          }
          .actions {
            justify-content: stretch;
          }
        }
      `}</style>
    </main>
  );
}

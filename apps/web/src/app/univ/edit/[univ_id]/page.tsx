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
  params = await params
  let id: bigint;
  try { id = BigInt(params.univ_id); } catch { notFound(); }
  const university = await getUniversity(id);
  if (!university) { notFound(); }

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
      </form>=
    </main>
  );
}

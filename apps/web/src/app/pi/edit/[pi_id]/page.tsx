import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { PIEditFormClient } from "./PIEditForm";
import { GetLab, GetPI } from "../../actions";

export default async function EditUserPage({ params }: { params: { pi_id: string } }) {
  params = await params;
  if (!params.pi_id) notFound();
  let pi_id;
  try {
    pi_id = BigInt(params.pi_id);
  } catch {
    notFound();
  }

  const pi = await GetPI(pi_id);
  const session = await getServerSession(authOptions);
  if (!session || !pi || !pi.userId) redirect("/");
  if (session.user.id !== pi.userId.toString()) redirect("/");

  const lab = pi.labId ? await GetLab(pi.labId) : null;

  return (
    <main>
      <PIEditFormClient pi={pi} lab={lab} />
    </main>
  );
}

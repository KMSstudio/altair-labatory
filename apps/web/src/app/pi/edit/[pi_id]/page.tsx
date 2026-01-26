import { notFound, redirect } from "next/navigation";
import { prisma } from "@labatory/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { PIEditFormClient } from "./PIEditForm";
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

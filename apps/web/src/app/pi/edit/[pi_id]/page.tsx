import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { PIEditFormClient } from "./PIEditForm";
import styles from "../../pi.module.css";
import { getPiCore } from "@/repository/db/labatory/pi";
import { getLabsCore } from "@/repository/db/labatory/labatory";

export default async function EditUserPage({ params }: { params: { pi_id: string } }) {
  params = await params;
  if (!params.pi_id) notFound();
  let piId;
  try {
    piId = BigInt(params.pi_id);
  } catch {
    notFound();
  }

  const pi = await getPiCore({ piId });
  const session = await getServerSession(authOptions);
  if (!session || !pi || !pi.userId) redirect("/");
  // if (session.user.id !== pi.userId.toString()) redirect("/");

  const labs = await getLabsCore({});
  return (
    <main className={styles.piShell}>
      <PIEditFormClient pi={pi} labs={labs} />
    </main>
  );
}

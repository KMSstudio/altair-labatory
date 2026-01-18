import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PIApplicationForm } from "./PIApplicationForm";

export default async function PIApplicationApplyPage() {
  const session = await getServerSession(authOptions);

  if(!session?.user || session.user.role!=="USER") {
    redirect("/");
  }

  return (
    <main>
      <h1>Apply as PI</h1>
      <PIApplicationForm />
    </main>
  );}

// @/app/admin/layout.tsx

import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function NewPILayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/pi");
  if (session.user.role !== "USER") redirect("/pi");
  return <>{children}</>;
}

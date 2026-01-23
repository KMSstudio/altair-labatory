import { redirect } from "next/navigation";

/**
 * /subj
 * Index route for the subject module. Redirects to `/subj/list`.
 * @returns Never returns normally; triggers a Next.js redirect.
 */
export default function SubjectIndexPage() {
  redirect("/subj/list");
}

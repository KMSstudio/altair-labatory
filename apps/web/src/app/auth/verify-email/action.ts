"use server";

import { redirect } from "next/navigation";


export async function submitAction(email: string, formData: FormData) {
    const rawtokenHash = formData.get("tokenHash");
    if (!rawtokenHash) return;
    if (!email) return;
    const tokenHash = rawtokenHash.toString();
    if (tokenHash.length < 5) return;
    redirect(`/auth/verify-email?email=${email}&token_hash=${tokenHash}`);
}
